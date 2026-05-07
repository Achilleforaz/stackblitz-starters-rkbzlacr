"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/app/lib/supabase"

type Product = {
  id: number
  category: string | null
  model: string | null
  model_code: string | null
  new_code: string | null
  dn: string | null
  mwp: string | null
  port: string | null
  setting: string | null
  price: string | null
  is_hidden: boolean | null
}

type DiscountSettings = {
  id: string
  product_id: number
  base_discount_percent: number
  updated_at?: string
}

type DiscountRange = {
  id: string
  product_id: number
  min_volume: number
  max_volume: number | null
  discount_percent: number
  created_at?: string
  updated_at?: string
}

type SavingAction =
  | null
  | "base"
  | "model-base"
  | "model-ranges"
  | "add-range"
  | `range-${string}`
  | `delete-${string}`

export default function DistributorDiscountsPage() {
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [modelBaseDiscount, setModelBaseDiscount] = useState("")
  const [modelRanges, setModelRanges] = useState<
    { id: string; min_volume: number; max_volume: number | null; discount_percent: number }[]
  >([])

  const [settings, setSettings] = useState<DiscountSettings | null>(null)
  const [ranges, setRanges] = useState<DiscountRange[]>([])

  const [message, setMessage] = useState("")
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingEditor, setLoadingEditor] = useState(false)
  const [savingAction, setSavingAction] = useState<SavingAction>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  async function getAccessToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    return session?.access_token || null
  }

  async function loadProducts() {
    setMessage("")
    setLoadingProducts(true)

    try {
      const token = await getAccessToken()

      if (!token) {
        router.push("/admin/login")
        return
      }

      const response = await fetch("/api/admin/distributor-discounts", {
        headers: {
          authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        setMessage(result.error || "Unable to load distributor discounts")
        return
      }

      const loadedProducts: Product[] = result.products || []

      setProducts(loadedProducts)
      setSettings(null)
      setRanges([])

      if (!selectedCategory && loadedProducts.length) {
        setSelectedCategory(loadedProducts[0]?.category || "Pressure Regulator")
      }
    } catch (error: any) {
      setMessage(error.message || "Unable to load distributor discounts")
    } finally {
      setLoadingProducts(false)
    }
  }

  async function loadDiscountData(productId: number) {
    setMessage("")
    setLoadingEditor(true)

    try {
      const token = await getAccessToken()

      if (!token) {
        router.push("/admin/login")
        return
      }

      const response = await fetch(
        `/api/admin/distributor-discounts?productId=${productId}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      )

      const result = await response.json()

      if (!response.ok) {
        setMessage(result.error || "Unable to load distributor discounts")
        return
      }

      setSettings(result.settings || null)
      setRanges(
        [...(result.ranges || [])].sort(
          (a, b) => Number(a.min_volume) - Number(b.min_volume)
        )
      )
    } catch (error: any) {
      setMessage(error.message || "Unable to load distributor discounts")
    } finally {
      setLoadingEditor(false)
    }
  }

  async function selectProduct(product: Product) {
    if (loadingEditor || savingAction) return

    setSelectedProductId(product.id)
    setSettings(null)
    setRanges([])
    await loadDiscountData(product.id)
  }

  const categories = useMemo(() => {
    return Array.from(
      new Set(products.map((product) => product.category || "Pressure Regulator"))
    ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  }, [products])

  const models = useMemo(() => {
    return Array.from(
      new Set(
        products
          .filter(
            (product) =>
              (product.category || "Pressure Regulator") === selectedCategory
          )
          .map((product) => product.model_code || product.model || "")
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  }, [products, selectedCategory])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryOk =
        (product.category || "Pressure Regulator") === selectedCategory
      const modelValue = product.model_code || product.model || ""
      const modelOk = selectedModel ? modelValue === selectedModel : true

      return categoryOk && modelOk
    })
  }, [products, selectedCategory, selectedModel])

  const selectedModelProducts = useMemo(() => {
    if (!selectedModel) return []

    return products.filter((product) => {
      const categoryOk =
        (product.category || "Pressure Regulator") === selectedCategory
      const modelValue = product.model_code || product.model || ""
      return categoryOk && modelValue === selectedModel
    })
  }, [products, selectedCategory, selectedModel])

  const selectedProduct = useMemo(() => {
    return products.find((product) => product.id === selectedProductId) || null
  }, [products, selectedProductId])

  function countProductsInCategory(categoryName: string) {
    return products.filter(
      (product) => (product.category || "Pressure Regulator") === categoryName
    ).length
  }

  function countProductsInModel(model: string) {
    return products.filter((product) => {
      const categoryOk =
        (product.category || "Pressure Regulator") === selectedCategory
      const modelValue = product.model_code || product.model || ""
      return categoryOk && modelValue === model
    }).length
  }

  function formatPrice(price: string | null) {
    if (!price) return "-"

    const numeric = Number(String(price).replace(",", "."))

    if (Number.isNaN(numeric)) return price

    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 2,
    }).format(numeric)
  }

  function previewDiscountedPrice(price: string | null, discountPercent: number) {
    const numeric = Number(String(price || "").replace(",", "."))

    if (!price || Number.isNaN(numeric)) return "-"

    const discounted = numeric * (1 - Number(discountPercent || 0) / 100)

    return formatPrice(String(discounted))
  }

  function addModelRange() {
    const sortedRanges = [...modelRanges].sort(
      (a, b) => Number(a.min_volume) - Number(b.min_volume)
    )
    const lastRange = sortedRanges[sortedRanges.length - 1]
    const defaultDiscount = Number(modelBaseDiscount || 0)

    setModelRanges((current) => [
      ...current,
      {
        id: `model-range-${Date.now()}-${current.length}`,
        min_volume: lastRange?.max_volume ? Number(lastRange.max_volume) + 1 : 1,
        max_volume: null,
        discount_percent: lastRange?.discount_percent || defaultDiscount,
      },
    ])
  }

  function updateModelRangeLocal(
    id: string,
    field: "min_volume" | "max_volume" | "discount_percent",
    value: string
  ) {
    setModelRanges((current) =>
      current.map((range) =>
        range.id === id
          ? {
              ...range,
              [field]: field === "max_volume" && value === "" ? null : Number(value),
            }
          : range
      )
    )
  }

  function removeModelRange(id: string) {
    setModelRanges((current) => current.filter((range) => range.id !== id))
  }

  async function saveModelBaseDiscount() {
    if (!selectedModel || savingAction) return

    setSavingAction("model-base")
    setMessage("")

    try {
      const token = await getAccessToken()

      if (!token) {
        router.push("/admin/login")
        return
      }

      const response = await fetch("/api/admin/distributor-discounts", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "save_model_base_discount",
          category: selectedCategory,
          modelCode: selectedModel,
          baseDiscountPercent: Number(modelBaseDiscount || 0),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setMessage(result.error || "Unable to save model discount")
        return
      }

      setMessage(
        `Model PR${selectedModel} distributor discount applied to ${result.updatedCount || 0} product(s). Product overrides remain editable.`
      )

      if (selectedProductId) {
        await loadDiscountData(selectedProductId)
      }
    } catch (error: any) {
      setMessage(error.message || "Unable to save model discount")
    } finally {
      setSavingAction(null)
    }
  }

  async function applyModelRanges() {
    if (!selectedModel || savingAction) return

    const ok = window.confirm(
      `Replace distributor discount ranges for all PR${selectedModel} products?`
    )
    if (!ok) return

    setSavingAction("model-ranges")
    setMessage("")

    try {
      const token = await getAccessToken()

      if (!token) {
        router.push("/admin/login")
        return
      }

      const response = await fetch("/api/admin/distributor-discounts", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "replace_model_ranges",
          category: selectedCategory,
          modelCode: selectedModel,
          ranges: modelRanges.map((range) => ({
            minVolume: range.min_volume,
            maxVolume: range.max_volume,
            discountPercent: range.discount_percent,
          })),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setMessage(result.error || "Unable to save model ranges")
        return
      }

      setMessage(
        `Model PR${selectedModel} volume ranges applied to ${result.updatedCount || 0} product(s). Product ranges remain editable individually.`
      )

      if (selectedProductId) {
        await loadDiscountData(selectedProductId)
      }
    } catch (error: any) {
      setMessage(error.message || "Unable to save model ranges")
    } finally {
      setSavingAction(null)
    }
  }

  function updateBaseDiscountLocal(value: string) {
    const numeric = Number(value)

    setSettings((current) => ({
      id: current?.id || "",
      product_id: selectedProductId || 0,
      base_discount_percent: Number.isFinite(numeric) ? numeric : 0,
    }))
  }

  async function saveBaseDiscount() {
    if (!selectedProductId || savingAction) return

    setSavingAction("base")
    setMessage("")

    try {
      const token = await getAccessToken()

      if (!token) {
        router.push("/admin/login")
        return
      }

      const response = await fetch("/api/admin/distributor-discounts", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "save_base_discount",
          productId: selectedProductId,
          baseDiscountPercent: Number(settings?.base_discount_percent || 0),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setMessage(result.error || "Unable to save base discount")
        return
      }

      setSettings(result.settings)
      setMessage("Default distributor discount saved.")
    } catch (error: any) {
      setMessage(error.message || "Unable to save base discount")
    } finally {
      setSavingAction(null)
    }
  }

  async function addRange() {
    if (!selectedProductId || savingAction) return

    setSavingAction("add-range")
    setMessage("")

    try {
      const token = await getAccessToken()

      if (!token) {
        router.push("/admin/login")
        return
      }

      const sortedRanges = [...ranges].sort(
        (a, b) => Number(a.min_volume) - Number(b.min_volume)
      )
      const lastRange = sortedRanges[sortedRanges.length - 1]
      const baseDiscount = Number(settings?.base_discount_percent || 0)

      const response = await fetch("/api/admin/distributor-discounts", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "add_range",
          productId: selectedProductId,
          minVolume: lastRange?.max_volume ? Number(lastRange.max_volume) + 1 : 1,
          maxVolume: null,
          discountPercent: lastRange?.discount_percent || baseDiscount,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setMessage(result.error || "Unable to add range")
        return
      }

      setRanges((current) =>
        [...current, result.range].sort(
          (a, b) => Number(a.min_volume) - Number(b.min_volume)
        )
      )
      setMessage("Range added.")
    } catch (error: any) {
      setMessage(error.message || "Unable to add range")
    } finally {
      setSavingAction(null)
    }
  }

  function updateRangeLocal(
    id: string,
    field: "min_volume" | "max_volume" | "discount_percent",
    value: string
  ) {
    setRanges((current) =>
      current.map((range) =>
        range.id === id
          ? {
              ...range,
              [field]:
                field === "max_volume" && value === "" ? null : Number(value),
            }
          : range
      )
    )
  }

  async function saveRange(range: DiscountRange) {
    if (savingAction) return

    setSavingAction(`range-${range.id}`)
    setMessage("")

    try {
      const token = await getAccessToken()

      if (!token) {
        router.push("/admin/login")
        return
      }

      const response = await fetch("/api/admin/distributor-discounts", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "update_range",
          id: range.id,
          minVolume: range.min_volume,
          maxVolume: range.max_volume,
          discountPercent: range.discount_percent,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setMessage(result.error || "Unable to save range")
        return
      }

      setRanges((current) =>
        current
          .map((item) => (item.id === result.range.id ? result.range : item))
          .sort((a, b) => Number(a.min_volume) - Number(b.min_volume))
      )
      setMessage("Range saved.")
    } catch (error: any) {
      setMessage(error.message || "Unable to save range")
    } finally {
      setSavingAction(null)
    }
  }

  async function deleteRange(id: string) {
    if (savingAction) return

    const ok = window.confirm("Delete this distributor discount range?")
    if (!ok) return

    setSavingAction(`delete-${id}`)
    setMessage("")

    try {
      const token = await getAccessToken()

      if (!token) {
        router.push("/admin/login")
        return
      }

      const response = await fetch("/api/admin/distributor-discounts", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "delete_range",
          id,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setMessage(result.error || "Unable to delete range")
        return
      }

      setRanges((current) => current.filter((range) => range.id !== id))
      setMessage("Range deleted.")
    } catch (error: any) {
      setMessage(error.message || "Unable to delete range")
    } finally {
      setSavingAction(null)
    }
  }

  const baseDiscount = Number(settings?.base_discount_percent || 0)

  async function logout() {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  return (
    <main className="admin-page min-h-screen p-5 text-white md:p-8">
      <div className="admin-shell mx-auto max-w-[1800px]">
        <header className="admin-header admin-header-compact admin-header-horizontal mb-6">
          <div className="admin-header-layout">
            <div className="admin-header-title">
              <p className="admin-kicker">IMF</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Distributor discounts</h1>
              <p className="mt-2 text-sm font-semibold text-white/60">
                Configure distributor discount rules by product and volume range.
              </p>
            </div>

            <nav className="admin-nav-row" aria-label="Admin navigation">
              <a href="/prism" className="admin-nav-button admin-nav-button-muted">
                Open PRISM
              </a>
              <a href="/admin" className="admin-nav-button admin-nav-button-muted">
                Catalog
              </a>
              <a href="/admin/clients" className="admin-nav-button admin-nav-button-muted">
                Clients
              </a>
              <a href="/admin/distributor-discounts" className="admin-nav-button admin-nav-button-active">
                Discounts
              </a>
              <a href="/admin/admins" className="admin-nav-button admin-nav-button-muted">
                Admin users
              </a>
              <button onClick={logout} className="admin-nav-button admin-nav-button-logout">
                Logout
              </button>
            </nav>
          </div>
        </header>

        {message && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-white/20 bg-white/10 p-4 text-white">
            <span>{message}</span>
            <button
              type="button"
              onClick={() => setMessage("")}
              className="rounded-lg bg-white/10 px-3 py-1 text-sm font-bold"
            >
              Close
            </button>
          </div>
        )}

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_260px_1fr_520px]">
          <aside className="rounded-3xl bg-white/10 p-5">
            <h2 className="mb-4 text-xl font-bold">Categories</h2>

            {loadingProducts ? (
              <p className="text-gray-300">Loading...</p>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    type="button"
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category)
                      setSelectedModel(null)
                      setSelectedProductId(null)
                      setModelBaseDiscount("")
                      setModelRanges([])
                      setSettings(null)
                      setRanges([])
                    }}
                    className={`w-full rounded-xl px-4 py-3 text-left font-bold transition ${
                      selectedCategory === category
                        ? "bg-purple-600 text-white"
                        : "bg-[#151515] hover:bg-[#222]"
                    }`}
                  >
                    <span>{category}</span>
                    <span className="mt-1 block text-xs font-normal text-gray-300">
                      {countProductsInCategory(category)} product(s)
                    </span>
                  </button>
                ))}
              </div>
            )}
          </aside>

          <aside className="rounded-3xl bg-white/10 p-5">
            <h2 className="mb-4 text-xl font-bold">Models</h2>

            <button
              type="button"
              onClick={() => {
                setSelectedModel(null)
                setSelectedProductId(null)
                setModelBaseDiscount("")
                setModelRanges([])
                setSettings(null)
                setRanges([])
              }}
              className={`mb-2 w-full rounded-xl px-4 py-3 text-left font-bold transition ${
                selectedModel === null
                  ? "bg-purple-600 text-white"
                  : "bg-[#151515] hover:bg-[#222]"
              }`}
            >
              All models
            </button>

            <div className="space-y-2">
              {models.map((model) => (
                <button
                  type="button"
                  key={model}
                  onClick={() => {
                    setSelectedModel(model)
                    setSelectedProductId(null)
                    setModelBaseDiscount("")
                    setModelRanges([])
                    setSettings(null)
                    setRanges([])
                  }}
                  className={`w-full rounded-xl px-4 py-3 text-left font-bold transition ${
                    selectedModel === model
                      ? "bg-purple-600 text-white"
                      : "bg-[#151515] hover:bg-[#222]"
                  }`}
                >
                  <span>PR{model}</span>
                  <span className="mt-1 block text-xs font-normal text-gray-300">
                    {countProductsInModel(model)} product(s)
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <section className="rounded-3xl bg-white/10 p-5">
            {selectedModel && (
              <div className="mb-6 rounded-3xl border border-purple-400/30 bg-black/25 p-5">
                <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-200">
                      Model distributor rules
                    </p>
                    <h3 className="mt-2 text-2xl font-black">PR{selectedModel}</h3>
                    <p className="mt-2 text-sm text-gray-300">
                      Apply a default discount and volume ranges to all {selectedModelProducts.length} product(s) in this model. You can still override any product below.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-end gap-3">
                    <label>
                      <span className="mb-2 block text-sm font-semibold text-gray-300">
                        Model default discount %
                      </span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={modelBaseDiscount}
                        onChange={(event) => setModelBaseDiscount(event.target.value)}
                        className="w-40 rounded-xl bg-white p-3 text-black"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={saveModelBaseDiscount}
                      disabled={savingAction !== null || !modelBaseDiscount.trim()}
                      className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
                    >
                      {savingAction === "model-base" ? "Applying..." : "Apply discount"}
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#111] p-4">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="font-black">Model volume ranges</h4>
                      <p className="mt-1 text-sm text-gray-400">
                        These ranges replace the ranges of every product in the selected model.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addModelRange}
                      disabled={savingAction !== null}
                      className="rounded-xl bg-green-600 px-4 py-2 text-sm font-bold hover:bg-green-700 disabled:opacity-50"
                    >
                      Add model range
                    </button>
                  </div>

                  {modelRanges.length === 0 ? (
                    <p className="rounded-xl bg-black/30 p-3 text-sm text-gray-300">
                      No model range yet. Add ranges, then apply them to the model.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {modelRanges.map((range, index) => (
                        <div key={range.id} className="grid grid-cols-1 gap-3 rounded-xl bg-black/30 p-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
                          <label>
                            <span className="mb-1 block text-xs font-semibold text-gray-300">
                              Min volume #{index + 1}
                            </span>
                            <input
                              type="number"
                              value={range.min_volume}
                              onChange={(event) =>
                                updateModelRangeLocal(range.id, "min_volume", event.target.value)
                              }
                              className="w-full rounded-xl bg-white p-3 text-black"
                            />
                          </label>
                          <label>
                            <span className="mb-1 block text-xs font-semibold text-gray-300">
                              Max volume
                            </span>
                            <input
                              type="number"
                              value={range.max_volume ?? ""}
                              placeholder="∞"
                              onChange={(event) =>
                                updateModelRangeLocal(range.id, "max_volume", event.target.value)
                              }
                              className="w-full rounded-xl bg-white p-3 text-black"
                            />
                          </label>
                          <label>
                            <span className="mb-1 block text-xs font-semibold text-gray-300">
                              Discount %
                            </span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={range.discount_percent}
                              onChange={(event) =>
                                updateModelRangeLocal(range.id, "discount_percent", event.target.value)
                              }
                              className="w-full rounded-xl bg-white p-3 text-black"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => removeModelRange(range.id)}
                            disabled={savingAction !== null}
                            className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold hover:bg-red-700 disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={applyModelRanges}
                    disabled={savingAction !== null}
                    className="mt-4 rounded-xl bg-purple-600 px-4 py-3 text-sm font-bold hover:bg-purple-700 disabled:opacity-50"
                  >
                    {savingAction === "model-ranges" ? "Applying ranges..." : "Apply ranges to model"}
                  </button>
                </div>
              </div>
            )}

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black">Products</h2>
                <p className="text-sm text-gray-300">
                  Select a product to edit distributor discounts.
                </p>
              </div>

              <div className="rounded-xl bg-black/30 px-4 py-2 text-sm">
                {filteredProducts.length} products
              </div>
            </div>

            <div className="max-h-[780px] space-y-3 overflow-y-auto pr-2">
              {filteredProducts.map((product) => (
                <button
                  type="button"
                  key={product.id}
                  onClick={() => selectProduct(product)}
                  disabled={loadingEditor || savingAction !== null}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedProductId === product.id
                      ? "border-purple-400 bg-purple-500/20"
                      : "border-white/10 bg-[#111] hover:bg-[#1d1d1d]"
                  } ${product.is_hidden ? "opacity-50" : ""}`}
                >
                  <p className="text-lg font-black">
                    {product.new_code || "No article code"}
                  </p>

                  <p className="mt-1 text-sm text-gray-300">
                    DN {product.dn || "-"} · MWP {product.mwp || "-"} · Port{" "}
                    {product.port || "-"} · Setting {product.setting || "-"}
                  </p>

                  <p className="mt-1 text-sm text-gray-300">
                    Price: {formatPrice(product.price)}
                  </p>
                </button>
              ))}

              {filteredProducts.length === 0 && (
                <p className="rounded-2xl bg-[#111] p-5 text-gray-300">
                  No product found for this category/model.
                </p>
              )}
            </div>
          </section>

          <aside className="rounded-3xl border border-purple-400/40 bg-[#111] p-6">
            {!selectedProduct ? (
              <div className="text-gray-300">
                <h2 className="mb-3 text-2xl font-black text-white">Editor</h2>
                <p>Select a product to edit its distributor discounts.</p>
              </div>
            ) : loadingEditor ? (
              <div className="text-gray-300">
                <h2 className="mb-3 text-2xl font-black text-white">Editor</h2>
                <p>Loading discount rules...</p>
              </div>
            ) : (
              <>
                <div className="mb-6 rounded-3xl bg-white/10 p-5">
                  <p className="text-sm tracking-[0.25em] text-purple-200">
                    SELECTED PRODUCT
                  </p>

                  <h2 className="mt-2 text-3xl font-black">
                    {selectedProduct.new_code || "No article code"}
                  </h2>

                  <p className="mt-2 text-sm text-gray-300">
                    DN {selectedProduct.dn || "-"} · MWP{" "}
                    {selectedProduct.mwp || "-"} · Port{" "}
                    {selectedProduct.port || "-"}
                  </p>

                  <p className="mt-2 text-sm text-gray-300">
                    Normal price: {formatPrice(selectedProduct.price)}
                  </p>
                </div>

                <div className="mb-6 rounded-3xl bg-white/10 p-5">
                  <h3 className="mb-2 text-xl font-black">
                    Default distributor discount
                  </h3>

                  <p className="mb-4 text-sm text-gray-300">
                    Used from volume 1 until the first configured range starts.
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={baseDiscount}
                      onChange={(event) =>
                        updateBaseDiscountLocal(event.target.value)
                      }
                      className="w-32 rounded-xl bg-white p-3 text-black"
                    />

                    <span className="text-gray-300">%</span>

                    <button
                      type="button"
                      onClick={saveBaseDiscount}
                      disabled={savingAction !== null}
                      className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
                    >
                      {savingAction === "base" ? "Saving..." : "Save"}
                    </button>
                  </div>

                  <p className="mt-4 text-sm text-gray-300">
                    Preview distributor price:{" "}
                    <span className="font-bold text-white">
                      {previewDiscountedPrice(selectedProduct.price, baseDiscount)}
                    </span>
                  </p>
                </div>

                <div className="rounded-3xl bg-white/10 p-5">
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-black">Volume ranges</h3>
                      <p className="mt-1 text-sm text-gray-300">
                        After the last max volume, PRISM keeps the last range
                        discount.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={addRange}
                      disabled={savingAction !== null}
                      className="rounded-xl bg-green-600 px-4 py-3 text-sm font-bold hover:bg-green-700 disabled:opacity-50"
                    >
                      {savingAction === "add-range" ? "Adding..." : "Add range"}
                    </button>
                  </div>

                  {ranges.length === 0 ? (
                    <p className="rounded-2xl bg-black/30 p-4 text-gray-300">
                      No range yet. Default discount will be used.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {ranges.map((range, index) => (
                        <div
                          key={range.id}
                          className="rounded-2xl border border-white/10 bg-[#111] p-4"
                        >
                          <div className="mb-4 flex items-center justify-between gap-3">
                            <h4 className="font-bold">Range #{index + 1}</h4>

                            <button
                              type="button"
                              onClick={() => deleteRange(range.id)}
                              disabled={savingAction !== null}
                              className="rounded-xl bg-red-600 px-3 py-2 text-xs font-bold hover:bg-red-700 disabled:opacity-50"
                            >
                              {savingAction === `delete-${range.id}`
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            <label>
                              <span className="mb-2 block text-sm font-semibold text-gray-300">
                                Min volume
                              </span>
                              <input
                                type="number"
                                value={range.min_volume}
                                onChange={(event) =>
                                  updateRangeLocal(
                                    range.id,
                                    "min_volume",
                                    event.target.value
                                  )
                                }
                                className="w-full rounded-xl bg-white p-3 text-black"
                              />
                            </label>

                            <label>
                              <span className="mb-2 block text-sm font-semibold text-gray-300">
                                Max volume
                              </span>
                              <input
                                type="number"
                                value={range.max_volume ?? ""}
                                placeholder="∞"
                                onChange={(event) =>
                                  updateRangeLocal(
                                    range.id,
                                    "max_volume",
                                    event.target.value
                                  )
                                }
                                className="w-full rounded-xl bg-white p-3 text-black"
                              />
                            </label>

                            <label>
                              <span className="mb-2 block text-sm font-semibold text-gray-300">
                                Discount %
                              </span>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={range.discount_percent}
                                onChange={(event) =>
                                  updateRangeLocal(
                                    range.id,
                                    "discount_percent",
                                    event.target.value
                                  )
                                }
                                className="w-full rounded-xl bg-white p-3 text-black"
                              />
                            </label>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm text-gray-300">
                              Preview:{" "}
                              <span className="font-bold text-white">
                                {previewDiscountedPrice(
                                  selectedProduct.price,
                                  range.discount_percent
                                )}
                              </span>
                            </p>

                            <button
                              type="button"
                              onClick={() => saveRange(range)}
                              disabled={savingAction !== null}
                              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
                            >
                              {savingAction === `range-${range.id}`
                                ? "Saving..."
                                : "Save range"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </aside>
        </section>
      </div>
    </main>
  )
}
