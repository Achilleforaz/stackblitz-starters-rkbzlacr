import { supabase } from "./supabase"
import { getTechnicalDataByNewCode, pickTechnicalValue } from "./prism-technical-data"

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
  certification: string
  valveInsert: string
  seat: string
  workingTemp: string
  leakageRate: string
  leakageRateInternal: string
  leakageRateExternal: string
  newCode: string
  price: string
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

  return (data ?? []).map((item) => {
    const newCode = cleanValue(item.new_code ?? item["New Code"])
    const technicalData = getTechnicalDataByNewCode(newCode)

    return {
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
      certification: pickTechnicalValue(item.certification, item["Certification"], technicalData.certification),
      valveInsert: pickTechnicalValue(
        item.mat_valve_insert,
        item.valve_insert,
        item.material_valve_insert,
        item["MAT. Valve Insert"],
        technicalData.valveInsert
      ),
      seat: pickTechnicalValue(item.mat_seat, item.seat, item.material_seat, item["MAT. Seat"], technicalData.seat),
      workingTemp: pickTechnicalValue(
        item.working_temp,
        item.temperature_range,
        item.working_temperature,
        item["Working Temp"],
        technicalData.workingTemp
      ),
      leakageRate: pickTechnicalValue(
        item.leakage_rate,
        item.leakage_rate_int,
        item.leakage_rate_internal,
        item["Leakage Rate Int."],
        technicalData.leakageRateInternal
      ),
      leakageRateInternal: pickTechnicalValue(
        item.leakage_rate_int,
        item.leakage_rate_internal,
        item["Leakage Rate Int."],
        technicalData.leakageRateInternal
      ),
      leakageRateExternal: pickTechnicalValue(
        item.leakage_rate_ext,
        item.leakage_rate_external,
        item["Leakage Rate Ext."],
        technicalData.leakageRateExternal
      ),
      newCode,
      price: cleanValue(item.price),
    }
  })
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
