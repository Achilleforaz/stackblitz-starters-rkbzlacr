import { supabase } from "./supabase"

export type PrismConfiguration = {
  id: number
  dn: string
  mwp: string
  port: string
  model: string
  bodyMaterial: string
  regulation: string
  setting: string
  sealing: string
  degreasing: string
  option: string
  newCode: string
  price: string
  certification?: string
  valveInsert?: string
  seatMaterial?: string
  workingTemp?: string
  leakageRateInternal?: string
  leakageRateExternal?: string
}

export async function getPrismConfigurations(): Promise<PrismConfiguration[]> {
  const { data, error } = await supabase
    .from("prism_configurations")
    .select("*")
    .eq("is_hidden", false)
    .order("model")

  if (error) {
    console.error(error)
    return []
  }

  return (data ?? []).map((item) => ({
    id: item.id,
    dn: cleanValue(item.dn),
    mwp: cleanValue(item.mwp),
    port: cleanValue(item.port),
    model: cleanValue(item.model),
    bodyMaterial: cleanValue(item.body_material),
    regulation: cleanValue(item.regulation),
    setting: cleanValue(item.setting),
    sealing: cleanValue(item.sealing),
    degreasing: cleanValue(item.degreasing),
    option: cleanValue(item.option),
    newCode: cleanValue(item.new_code),
    price: cleanValue(item.price),
    certification: cleanValue(item.certification),
    valveInsert: cleanValue(item.mat_valve_insert ?? item.valve_insert ?? item.valve_insert_material),
    seatMaterial: cleanValue(item.mat_seat ?? item.seat ?? item.seat_material),
    workingTemp: cleanValue(item.working_temp ?? item.working_temperature),
    leakageRateInternal: cleanValue(item.leakage_rate_int ?? item.leakage_rate_internal),
    leakageRateExternal: cleanValue(item.leakage_rate_ext ?? item.leakage_rate_external),
  }))
}

function cleanValue(value: unknown) {
  if (value === null || value === undefined) return ""
  return String(value).trim()
}

export function uniqueValues(
  configurations: PrismConfiguration[],
  field: keyof PrismConfiguration
) {
  const values = configurations
    .map((item) => item[field])
    .filter((value) => value && value !== "" && value !== "null")

  return Array.from(new Set(values)).sort((a: any, b: any) => {
    const numA = parseFloat(String(a))
    const numB = parseFloat(String(b))

    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB
    }

    return String(a).localeCompare(String(b), undefined, { numeric: true })
  })
}

export function filterConfigurations(
  configurations: PrismConfiguration[],
  filters: Partial<PrismConfiguration>
) {
  return configurations.filter((item) => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true
      return item[key as keyof PrismConfiguration] === value
    })
  })
}
