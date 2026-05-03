export type ParsedSettingRange = {
  label: string
  minBar: number
  maxBar: number
}
 
function normalizeLabel(value: string) {
  return String(value)
    .replace(/,/g, ".")
    .replace(/\s+/g, " ")
    .trim()
}
 
export function parseSettingRange(label: string): ParsedSettingRange | null {
  const normalized = normalizeLabel(label)
 
  const match = normalized.match(
    /(-?\d+(?:\.\d+)?)\s*(?:to|a|à|-)\s*(-?\d+(?:\.\d+)?)/i
  )
 
  if (!match) return null
 
  const first = Number(match[1])
  const second = Number(match[2])
 
  if (!Number.isFinite(first) || !Number.isFinite(second)) return null
 
  return {
    label: normalized,
    minBar: Math.min(first, second),
    maxBar: Math.max(first, second),
  }
}
 
export function settingContainsPressure(
  label: string,
  pressureBarG: number
) {
  const parsed = parseSettingRange(label)
  if (!parsed) return false
 
  return pressureBarG >= parsed.minBar && pressureBarG <= parsed.maxBar
}
 
export function settingContainsAllPressures(
  label: string,
  pressuresBarG: number[]
) {
  if (pressuresBarG.length === 0) return true
 
  return pressuresBarG.every((pressure) =>
    settingContainsPressure(label, pressure)
  )
}
 
export function getCompatibleSettingRanges(
  labels: string[],
  pressuresBarG: number[]
) {
  const uniqueLabels = Array.from(
    new Set(labels.map((label) => normalizeLabel(label)))
  )
 
  if (pressuresBarG.length === 0) return uniqueLabels
 
  return uniqueLabels.filter((label) =>
    settingContainsAllPressures(label, pressuresBarG)
  )
}
