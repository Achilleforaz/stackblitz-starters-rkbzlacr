"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/app/lib/supabase"

type AdminProfile = {
  email: string
  role: "superadmin" | "admin"
}

type Product = {
  id?: number
  category: string | null
  model_code: string | null
  new_code: string | null
  dn: string | null
  mwp: string | null
  port: string | null
  setting: string | null
  model: string | null
  body_material: string | null
  regulation: string | null
  sealing: string | null
  degreasing: string | null
  option: string | null
  price: string | null
  is_hidden: boolean | null
}

type Category = {
  id?: string
  name: string
  code: string
  is_hidden: boolean
}

const emptyProduct: Product = {
  category: "Pressure Regulator",
  model_code: "",
  new_code: "",
  dn: "",
  mwp: "",
  port: "",
  setting: "",
  model: "",
  body_material: "",
  regulation: "",
  sealing: "",
  degreasing: "",
  option: "",
  price: "",
  is_hidden: false,
}

const productFields: { key: keyof Product; label: string }[] = [
  { key: "category", label: "Category" },
  { key: "model_code", label: "Model code" },
  { key: "new_code", label: "Article code" },
  { key: "dn", label: "DN" },
  { key: "mwp", label: "MWP" },
  { key: "port", label: "In & Outlet Port" },
  { key: "setting", label: "Setting" },
  { key: "model", label: "Model" },
  { key: "body_material", label: "Body Material" },
  { key: "regulation", label: "Regulation" },
  { key: "sealing", label: "Sealing" },
  { key: "degreasing", label: "Degreasing" },
  { key: "option", label: "Option" },
  { key: "price", label: "Price" },
]

export default function AdminPage() {
  const router = useRouter()

  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const [selectedCategory, setSelectedCategory] = useState("Pressure Regulator")
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [modelPrice, setModelPrice] = useState("")
  const [savingModelPrice, setSavingModelPrice] = useState(false)

  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [editCategory, setEditCategory] = useState<Category | null>(null)

  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteMessage, setInviteMessage] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    checkAdminAccess()
    loadCatalog()
  }, [])

  async function getAccessToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    return session?.access_token || null
  }

  async function checkAdminAccess() {
    const token = await getAccessToken()

    if (!token) {
      router.push("/admin/login")
      return
    }

    const response = await fetch("/api/admin/me", {
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      router.push("/admin/login")
      return
    }

    setAdminProfile(await response.json())
  }

  async function callCatalogApi(body: any) {
    const token = await getAccessToken()

    if (!token) {
      router.push("/admin/login")
      throw new Error("Not connected")
    }

    const response = await fetch("/api/admin/catalog", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "Admin action failed")
    }

    return result
  }

  async function loadCatalog() {
    setMessage("")
    setLoading(true)

    const token = await getAccessToken()

    if (!token) {
      setLoading(false)
      return
    }

    const response = await fetch("/api/admin/catalog", {
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    const result = await response.json()
    setLoading(false)

    if (!response.ok) {
      setMessage(result.error || "Unable to load catalog")
      return
    }

    setProducts(result.products || [])
    setCategories(result.categories || [])
  }

  async function inviteAdmin() {
    setInviteMessage("")

    const token = await getAccessToken()

    if (!token) {
      router.push("/admin/login")
      return
    }

    const response = await fetch("/api/admin/invite", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email: inviteEmail }),
    })

    const result = await response.json()

    if (!response.ok) {
      setInviteMessage(result.error || "Error")
      return
    }

    setInviteEmail("")
    setInviteMessage("Admin invitation sent.")
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  const visibleCategories = useMemo(() => {
    const fromProducts = Array.from(
      new Set(products.map((item) => item.category || "Pressure Regulator"))
    )

    const merged = [...categories.map((item) => item.name), ...fromProducts]

    return Array.from(new Set(merged)).sort()
  }, [categories, products])

  const models = useMemo(() => {
    return Array.from(
      new Set(
        products
          .filter((item) => (item.category || "Pressure Regulator") === selectedCategory)
          .map((item) => item.model_code)
          .filter((value): value is string => Boolean(value))
      )
    ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  }, [products, selectedCategory])

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const categoryOk = (item.category || "Pressure Regulator") === selectedCategory
      const modelOk = selectedModel ? item.model_code === selectedModel : true
      return categoryOk && modelOk
    })
  }, [products, selectedCategory, selectedModel])

  const selectedModelProducts = useMemo(() => {
    if (!selectedModel) return []

    return products.filter(
      (item) =>
        (item.category || "Pressure Regulator") === selectedCategory &&
        item.model_code === selectedModel
    )
  }, [products, selectedCategory, selectedModel])

  const selectedModelPriceSummary = useMemo(() => {
    const prices = selectedModelProducts
      .map((product) => Number(String(product.price || "").replace(",", ".")))
      .filter((value) => Number.isFinite(value))

    if (!prices.length) return null

    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const average = prices.reduce((sum, value) => sum + value, 0) / prices.length
    const unique = Array.from(new Set(prices.map((value) => String(value))))

    return { min, max, average, isUniform: unique.length === 1 }
  }, [selectedModelProducts])

  function formatMoney(value: number) {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 2,
    }).format(value)
  }

  function countProductsInCategory(categoryName: string) {
    return products.filter(
      (product) => (product.category || "Pressure Regulator") === categoryName
    ).length
  }

  function startNewProduct() {
    setEditCategory(null)
    setEditProduct({
      ...emptyProduct,
      category: selectedCategory,
      model_code: selectedModel || "",
    })
  }

  function startNewCategory() {
    setEditProduct(null)
    setEditCategory({
      name: "",
      code: "",
      is_hidden: false,
    })
  }

  async function saveModelPrice() {
    if (!selectedModel || savingModelPrice) return

    setSavingModelPrice(true)
    setMessage("")

    try {
      const result = await callCatalogApi({
        action: "update_model_price",
        category: selectedCategory,
        modelCode: selectedModel,
        price: modelPrice,
      })

      const updatedProducts: Product[] = result.products || []
      const updatedById = new Map(updatedProducts.map((product) => [product.id, product]))

      setProducts((current) =>
        current.map((product) => updatedById.get(product.id) || product)
      )

      if (editProduct?.id && updatedById.has(editProduct.id)) {
        setEditProduct(updatedById.get(editProduct.id) || editProduct)
      }

      setMessage(
        `Model PR${selectedModel} price updated on ${updatedProducts.length} product(s). Product prices can still be overridden individually.`
      )
    } catch (error: any) {
      setMessage(error.message)
    }

    setSavingModelPrice(false)
  }

  async function saveProduct() {
    if (!editProduct) return

    setSaving(true)
    setMessage("")

    try {
      if (editProduct.id) {
        const result = await callCatalogApi({
          action: "update_product",
          product: editProduct,
        })

        setProducts((current) =>
          current.map((item) => (item.id === editProduct.id ? result.product : item))
        )
      } else {
        const result = await callCatalogApi({
          action: "create_product",
          product: editProduct,
        })

        setProducts((current) => [...current, result.product])
      }

      setEditProduct(null)
    } catch (error: any) {
      setMessage(error.message)
    }

    setSaving(false)
  }

  async function saveCategory() {
    if (!editCategory) return

    setSaving(true)
    setMessage("")

    try {
      if (editCategory.id) {
        const oldCategory = categories.find((item) => item.id === editCategory.id)
        const result = await callCatalogApi({
          action: "update_category",
          ...editCategory,
        })

        setCategories((current) =>
          current.map((item) => (item.id === editCategory.id ? result.category : item))
        )

        if (oldCategory && oldCategory.name !== result.category.name) {
          setProducts((current) =>
            current.map((product) =>
              (product.category || "Pressure Regulator") === oldCategory.name
                ? { ...product, category: result.category.name }
                : product
            )
          )

          if (selectedCategory === oldCategory.name) {
            setSelectedCategory(result.category.name)
        setModelPrice("")
          }
        }
      } else {
        const result = await callCatalogApi({
          action: "create_category",
          name: editCategory.name,
          code: editCategory.code,
        })

        setCategories((current) => [...current, result.category])
        setSelectedCategory(result.category.name)
        setModelPrice("")
      }

      setEditCategory(null)
    } catch (error: any) {
      setMessage(error.message)
    }

    setSaving(false)
  }

  async function deleteCategory(category: Category) {
    if (!category.id) {
      setMessage("This category cannot be deleted because it is not saved as a category record yet.")
      return
    }

    const productCount = countProductsInCategory(category.name)

    if (productCount > 0) {
      setMessage(
        `Category "${category.name}" cannot be deleted because it contains ${productCount} product(s). Move or delete the products first.`
      )
      return
    }

    const ok = window.confirm(`Delete category "${category.name}" permanently?`)
    if (!ok) return

    try {
      await callCatalogApi({
        action: "delete_category",
        id: category.id,
      })

      setCategories((current) => current.filter((item) => item.id !== category.id))

      if (selectedCategory === category.name) {
        setSelectedCategory("Pressure Regulator")
        setSelectedModel(null)
        setModelPrice("")
      }

      if (editCategory?.id === category.id) {
        setEditCategory(null)
      }
    } catch (error: any) {
      setMessage(error.message)
    }
  }

  async function toggleProductVisibility(product: Product) {
    if (!product.id) return

    const updated = {
      ...product,
      is_hidden: !product.is_hidden,
    }

    try {
      const result = await callCatalogApi({
        action: "update_product",
        product: updated,
      })

      setProducts((current) =>
        current.map((item) => (item.id === product.id ? result.product : item))
      )

      if (editProduct?.id === product.id) {
        setEditProduct(result.product)
      }
    } catch (error: any) {
      setMessage(error.message)
    }
  }

  async function deleteProduct(product: Product) {
    if (!product.id) return

    const ok = window.confirm(`Delete ${product.new_code || "this product"} permanently?`)

    if (!ok) return

    try {
      await callCatalogApi({
        action: "delete_product",
        id: product.id,
      })

      setProducts((current) => current.filter((item) => item.id !== product.id))

      if (editProduct?.id === product.id) {
        setEditProduct(null)
      }
    } catch (error: any) {
      setMessage(error.message)
    }
  }

  return (
    <main className="admin-page min-h-screen p-4 text-white md:p-6">
      <div className="admin-shell mx-auto max-w-[1800px]">
        <header className="admin-header admin-header-compact admin-header-horizontal mb-6">
          <div className="admin-header-layout">
            <div className="admin-header-title">
              <p className="admin-kicker">IMF</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Admin catalog</h1>
              {adminProfile && (
                <p className="mt-2 text-sm font-semibold text-white/60">
                  Connected as {adminProfile.email} · {adminProfile.role}
                </p>
              )}
            </div>

            <nav className="admin-nav-row" aria-label="Admin navigation">
              <a href="/prism" className="admin-nav-button admin-nav-button-muted">
                Open PRISM
              </a>
              <a href="/admin" className="admin-nav-button admin-nav-button-active">
                Catalog
              </a>
              <a href="/admin/clients" className="admin-nav-button admin-nav-button-muted">
                Clients
              </a>
              <a href="/admin/distributor-discounts" className="admin-nav-button admin-nav-button-muted">
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
          <div className="admin-alert admin-alert-error mb-6">
            <span>{message}</span>
            <button onClick={() => setMessage("")} className="admin-small-button admin-small-button-danger">
              Close
            </button>
          </div>
        )}

        {adminProfile?.role === "superadmin" && (
          <section className="admin-panel mb-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-xl font-black">Superadmin</h2>
                <p className="mt-1 text-sm font-semibold text-white/55">
                  Invite another administrator to manage PRISM.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="email"
                  placeholder="new.admin@email.com"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  className="admin-input min-w-[260px]"
                />

                <button onClick={inviteAdmin} className="admin-action-button admin-action-button-primary">
                  Invite admin
                </button>
              </div>
            </div>

            {inviteMessage && <p className="mt-3 text-sm font-semibold text-white/65">{inviteMessage}</p>}
          </section>
        )}

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[290px_minmax(0,1fr)_460px] 2xl:grid-cols-[320px_minmax(0,1fr)_520px]">
          <aside className="space-y-6">
            <div className="admin-panel">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black">Categories</h2>
                  <p className="mt-1 text-xs font-semibold text-white/45">Product families</p>
                </div>

                <button onClick={startNewCategory} className="admin-small-button admin-small-button-primary">
                  Add
                </button>
              </div>

              <div className="space-y-3">
                {visibleCategories.map((category) => {
                  const categoryRecord = categories.find((item) => item.name === category)
                  const productCount = countProductsInCategory(category)

                  return (
                    <div key={category} className="admin-category-row">
                      <button
                        onClick={() => {
                          setSelectedCategory(category)
                          setSelectedModel(null)
                          setModelPrice("")
                          setEditProduct(null)
                          setEditCategory(null)
                        }}
                        className={`admin-category-main ${
                          selectedCategory === category ? "admin-category-main-active" : ""
                        }`}
                      >
                        <span className="admin-category-name">{category}</span>
                        <span className="admin-category-count">{productCount} product(s)</span>
                      </button>

                      <div className="admin-category-actions">
                        <button
                          onClick={() => {
                            if (!categoryRecord) {
                              setMessage(`Category "${category}" exists on products but not in prism_categories yet. Create it first if you want to edit it.`)
                              return
                            }

                            setEditProduct(null)
                            setEditCategory(categoryRecord)
                          }}
                          className="admin-icon-button admin-icon-button-warn"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => {
                            if (!categoryRecord) {
                              setMessage(`Category "${category}" cannot be deleted because it is not saved as a category record.`)
                              return
                            }

                            deleteCategory(categoryRecord)
                          }}
                          className="admin-icon-button admin-icon-button-danger"
                        >
                          Del
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="admin-panel">
              <h2 className="mb-4 text-xl font-black">Models</h2>

              <button
                onClick={() => {
                  setSelectedModel(null)
                  setModelPrice("")
                }}
                className={`admin-list-button ${selectedModel === null ? "admin-list-button-active" : ""}`}
              >
                All models
              </button>

              <div className="mt-2 space-y-2">
                {models.map((model) => (
                  <button
                    key={model}
                    onClick={() => {
                      setSelectedModel(model)
                      setModelPrice("")
                      setEditProduct(null)
                    }}
                    className={`admin-list-button ${selectedModel === model ? "admin-list-button-active" : ""}`}
                  >
                    PR{model}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="admin-panel min-w-0">
            {selectedModel && (
              <div className="mb-6 rounded-3xl border border-purple-400/30 bg-white/10 p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                  <div>
                    <p className="admin-kicker">MODEL PRICE</p>
                    <h3 className="mt-2 text-2xl font-black">PR{selectedModel}</h3>
                    <p className="mt-2 text-sm font-semibold text-white/55">
                      Set one price for the whole model. Individual products can still be edited from the product editor.
                    </p>
                    {selectedModelPriceSummary && (
                      <p className="mt-2 text-xs font-semibold text-white/50">
                        Current prices: average {formatMoney(selectedModelPriceSummary.average)} · min {formatMoney(selectedModelPriceSummary.min)} · max {formatMoney(selectedModelPriceSummary.max)} · {selectedModelPriceSummary.isUniform ? "uniform" : "product overrides detected"}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <label className="block min-w-[180px]">
                      <span className="admin-label">Model price</span>
                      <input
                        value={modelPrice}
                        onChange={(event) => setModelPrice(event.target.value)}
                        placeholder="Example: 1250"
                        className="admin-input w-full"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={saveModelPrice}
                      disabled={savingModelPrice || !modelPrice.trim()}
                      className="admin-action-button admin-action-button-primary disabled:opacity-60"
                    >
                      {savingModelPrice ? "Applying..." : "Apply to model"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-black">
                  Products {selectedModel ? `(PR${selectedModel})` : ""}
                </h2>
                <p className="mt-1 text-sm font-semibold text-white/55">
                  Click a product to edit it instantly on the right.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="admin-count-pill">
                  {filteredProducts.length} products
                </div>

                <button onClick={startNewProduct} className="admin-action-button admin-action-button-primary">
                  Add product
                </button>
              </div>
            </div>

            {loading && <p className="font-semibold text-white/70">Loading...</p>}

            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  onClick={() => {
                    setEditCategory(null)
                    setEditProduct({ ...product })
                  }}
                  className={`admin-product-row ${editProduct?.id === product.id ? "admin-product-row-active" : ""} ${product.is_hidden ? "opacity-50" : ""}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-black md:text-lg">
                      {product.new_code || "No article code"}
                    </p>

                    <p className="mt-1 truncate text-xs font-semibold text-white/48 md:text-sm">
                      DN {product.dn || "-"} · MWP {product.mwp || "-"} · Port {product.port || "-"} · Setting {product.setting || "-"} · Price {product.price || "-"}
                    </p>
                  </div>

                  <div className="admin-product-actions" onClick={(event) => event.stopPropagation()}>
                    <span className="admin-status-text">
                      {product.is_hidden ? "Hidden" : "Visible"}
                    </span>

                    <button
                      onClick={() => toggleProductVisibility(product)}
                      className={`admin-toggle ${product.is_hidden ? "admin-toggle-off" : "admin-toggle-on"}`}
                    >
                      <span className={`admin-toggle-dot ${product.is_hidden ? "admin-toggle-dot-off" : "admin-toggle-dot-on"}`} />
                    </button>

                    <button onClick={() => deleteProduct(product)} className="admin-small-button admin-small-button-danger">
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="admin-panel admin-editor-panel">
            {editCategory && (
              <>
                <h2 className="mb-5 text-2xl font-black">
                  {editCategory.id ? "Edit category" : "Add category"}
                </h2>

                <label className="mb-4 block">
                  <span className="admin-label">Category name</span>
                  <input
                    value={editCategory.name}
                    onChange={(event) =>
                      setEditCategory({
                        ...editCategory,
                        name: event.target.value,
                      })
                    }
                    className="admin-input w-full"
                  />
                </label>

                <label className="mb-4 block">
                  <span className="admin-label">Code prefix</span>
                  <input
                    value={editCategory.code}
                    onChange={(event) =>
                      setEditCategory({
                        ...editCategory,
                        code: event.target.value,
                      })
                    }
                    className="admin-input w-full"
                  />
                </label>

                {editCategory.id && (
                  <p className="mb-4 rounded-2xl border border-white/10 bg-black/20 p-3 text-sm font-semibold text-white/55">
                    Delete is blocked while products still exist inside this category.
                  </p>
                )}

                <div className="flex flex-wrap gap-3">
                  <button onClick={saveCategory} disabled={saving} className="admin-action-button admin-action-button-primary">
                    {saving ? "Saving..." : "Save category"}
                  </button>

                  {editCategory.id && (
                    <button onClick={() => deleteCategory(editCategory)} className="admin-action-button admin-action-button-danger">
                      Delete category
                    </button>
                  )}

                  <button onClick={() => setEditCategory(null)} className="admin-action-button admin-action-button-muted">
                    Cancel
                  </button>
                </div>
              </>
            )}

            {editProduct && (
              <>
                <h2 className="mb-5 text-2xl font-black">
                  {editProduct.id ? "Edit product" : "Add product"}
                </h2>

                <div className="space-y-4">
                  {productFields.map((field) => (
                    <label key={field.key} className="block">
                      <span className="admin-label">{field.label}</span>

                      <input
                        value={String(editProduct[field.key] ?? "")}
                        onChange={(event) =>
                          setEditProduct({
                            ...editProduct,
                            [field.key]: event.target.value,
                          })
                        }
                        className="admin-input w-full"
                      />
                    </label>
                  ))}
                </div>

                <div className="my-6 flex items-center gap-3">
                  <span className="text-sm font-black text-white/62">Visibility</span>

                  <button
                    onClick={() =>
                      setEditProduct({
                        ...editProduct,
                        is_hidden: !editProduct.is_hidden,
                      })
                    }
                    className={`admin-toggle ${editProduct.is_hidden ? "admin-toggle-off" : "admin-toggle-on"}`}
                  >
                    <span className={`admin-toggle-dot ${editProduct.is_hidden ? "admin-toggle-dot-off" : "admin-toggle-dot-on"}`} />
                  </button>

                  <span className="text-sm font-semibold text-white/70">
                    {editProduct.is_hidden ? "Hidden" : "Visible"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button onClick={saveProduct} disabled={saving} className="admin-action-button admin-action-button-primary disabled:opacity-60">
                    {saving ? "Saving..." : "Save product"}
                  </button>

                  <button onClick={() => setEditProduct(null)} className="admin-action-button admin-action-button-muted">
                    Cancel
                  </button>
                </div>
              </>
            )}

            {!editCategory && !editProduct && (
              <div className="text-white/58">
                <h2 className="mb-3 text-2xl font-black text-white">Editor</h2>
                <p className="font-semibold">Click a product or add a product/category to edit here.</p>
              </div>
            )}
          </aside>
        </section>
      </div>
    </main>
  )
}
