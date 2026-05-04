import {
  getGasSpeedForOutletPressure,
  type PrismFluid,
} from "./computeFluid"

export type PrismCondition = {
  inletPressure: number
  outletPressure: number
  flowRateGs: number
  temperature: number
}

export type PrismCapacityStatus = "OK" | "Near limit" | "Exceeds" | "Not calculated"

export type PrismHardwareSizing = {
  seatSizeMm?: number
  portBoreMm?: number
}

export type PrismSizingResult = {
  flowNm3h: number
  deltaP: number
  gasSpeed: number
  seatSizeMm: number
  outletBoreMm: number
  maxFlowDeltaP: number
  maxFlowSeat: number
  maxFlowPort: number
  maxAdmissibleFlow: number
  expectedOutletVelocity: number
  utilizationPercent: number
  capacityMarginPercent: number
  status: PrismCapacityStatus
}

export type DnSizingProfile = {
  requiredSeatMm: number
  recommendedDnMm: number
  recommendedDnLabel: string
  compatibleDnValues: number[]
  compatibleDnLabels: string[]
  maxUsefulDnMm: number
}

const ATMOSPHERIC_PRESSURE_BAR = 1.013
const EXCEL_EXPECTED_VELOCITY_PRESSURE_OFFSET_BAR = 1.1013
const NEAR_LIMIT_UTILIZATION_PERCENT = 90
const DN_OVERSIZE_RATIO_LIMIT = 1.8
const DN_OVERSIZE_ABSOLUTE_LIMIT_MM = 8

function toAbsoluteBar(pressureBarG: number) {
  return pressureBarG + ATMOSPHERIC_PRESSURE_BAR
}

function isFinitePositive(value: number) {
  return Number.isFinite(value) && value > 0
}

function isSubCritical(condition: PrismCondition) {
  return (
    condition.outletPressure > 0 &&
    condition.inletPressure / condition.outletPressure < 2
  )
}

function minPositive(values: number[]) {
  const positives = values.filter(isFinitePositive)
  if (positives.length === 0) return 0
  return Math.min(...positives)
}

function computeCapacityStatus(
  requestedFlowNm3h: number,
  maxAdmissibleFlowNm3h: number
): {
  utilizationPercent: number
  capacityMarginPercent: number
  status: PrismCapacityStatus
} {
  if (!isFinitePositive(requestedFlowNm3h) || !isFinitePositive(maxAdmissibleFlowNm3h)) {
    return {
      utilizationPercent: 0,
      capacityMarginPercent: 0,
      status: "Not calculated",
    }
  }

  const utilizationPercent = (requestedFlowNm3h / maxAdmissibleFlowNm3h) * 100
  const capacityMarginPercent =
    ((maxAdmissibleFlowNm3h - requestedFlowNm3h) / requestedFlowNm3h) * 100

  return {
    utilizationPercent,
    capacityMarginPercent,
    status:
      utilizationPercent > 100
        ? "Exceeds"
        : utilizationPercent >= NEAR_LIMIT_UTILIZATION_PERCENT
          ? "Near limit"
          : "OK",
  }
}

export function computePrismSizing(
  condition: PrismCondition,
  fluid: PrismFluid,
  hardwareSizing: PrismHardwareSizing = {}
): PrismSizingResult {
  const density = fluid.density_nm3

  const inletPressureBarG = condition.inletPressure
  const outletPressureBarG = condition.outletPressure
  const temperatureC = condition.temperature
  const flowRateGs = condition.flowRateGs

  const inletPressureBarA = toAbsoluteBar(inletPressureBarG)
  const outletPressureBarA = toAbsoluteBar(outletPressureBarG)
  const absoluteTemperatureK = temperatureC + 273

  const deltaP = inletPressureBarG - outletPressureBarG
  const flowNm3h = density > 0 ? (flowRateGs * 3.6) / density : 0
  const gasSpeed = getGasSpeedForOutletPressure(fluid, outletPressureBarG)

  let seatSizeMm = 0

  if (
    flowNm3h > 0 &&
    inletPressureBarG > 0 &&
    outletPressureBarG >= 0 &&
    deltaP > 0 &&
    absoluteTemperatureK > 0 &&
    density > 0
  ) {
    if (isSubCritical(condition)) {
      seatSizeMm =
        0.283 *
        Math.sqrt(flowNm3h) *
        Math.pow(
          (density * absoluteTemperatureK) /
            outletPressureBarA /
            deltaP,
          0.25
        )
    } else {
      seatSizeMm =
        0.4 *
        Math.sqrt(flowNm3h / inletPressureBarA) *
        Math.pow(density * absoluteTemperatureK, 0.25)
    }
  }

  let outletBoreMm = 0

  if (flowNm3h > 0 && gasSpeed > 0 && outletPressureBarA > 0) {
    outletBoreMm =
      1.13 *
      Math.sqrt(
        (flowNm3h * absoluteTemperatureK) /
          gasSpeed /
          outletPressureBarA
      )
  }

  const selectedSeatSizeMm = hardwareSizing.seatSizeMm || seatSizeMm
  const selectedPortBoreMm = hardwareSizing.portBoreMm || outletBoreMm

  let maxFlowDeltaP = 0
  let maxFlowSeat = 0
  let maxFlowPort = 0
  let expectedOutletVelocity = 0

  if (
    isFinitePositive(selectedSeatSizeMm) &&
    density > 0 &&
    deltaP > 0 &&
    absoluteTemperatureK > 0
  ) {
    if (isSubCritical(condition)) {
      maxFlowSeat =
        (12.5 *
          Math.pow(selectedSeatSizeMm, 2) *
          Math.sqrt(outletPressureBarA) *
          deltaP) /
        density /
        absoluteTemperatureK
    } else {
      maxFlowSeat =
        (6.22 * Math.pow(selectedSeatSizeMm, 2) * inletPressureBarA) /
        Math.sqrt(density * absoluteTemperatureK)
    }
  }

  maxFlowDeltaP = deltaP > 0 ? deltaP : 0

  if (
    isFinitePositive(selectedPortBoreMm) &&
    gasSpeed > 0 &&
    outletPressureBarA > 0 &&
    absoluteTemperatureK > 0
  ) {
    maxFlowPort =
      (gasSpeed * outletPressureBarA * Math.pow(selectedPortBoreMm, 2)) /
      1.28 /
      absoluteTemperatureK
  }

  if (
    flowNm3h > 0 &&
    isFinitePositive(selectedPortBoreMm) &&
    absoluteTemperatureK > 0
  ) {
    expectedOutletVelocity =
      (Math.pow(1.13, 2) * flowNm3h * absoluteTemperatureK) /
      ((outletPressureBarG + EXCEL_EXPECTED_VELOCITY_PRESSURE_OFFSET_BAR) *
        Math.pow(selectedPortBoreMm, 2))
  }

  const maxAdmissibleFlow = minPositive([maxFlowSeat, maxFlowPort])
  const capacity = computeCapacityStatus(flowNm3h, maxAdmissibleFlow)

  return {
    flowNm3h,
    deltaP,
    gasSpeed,
    seatSizeMm,
    outletBoreMm,
    maxFlowDeltaP,
    maxFlowSeat,
    maxFlowPort,
    maxAdmissibleFlow,
    expectedOutletVelocity,
    utilizationPercent: capacity.utilizationPercent,
    capacityMarginPercent: capacity.capacityMarginPercent,
    status: capacity.status,
  }
}

export function getRequiredConnector(outletBoreMm: number) {
  const connectors = [
    { label: '1/4"', boreMm: 6.35 },
    { label: '3/8"', boreMm: 9.525 },
    { label: '1/2"', boreMm: 12.7 },
    { label: '3/4"', boreMm: 19.05 },
    { label: '1"', boreMm: 25.4 },
    { label: '1 1/2"', boreMm: 38.1 },
    { label: '2"', boreMm: 50.8 },
    { label: '3"', boreMm: 76.2 },
  ]

  return (
    connectors.find((connector) => connector.boreMm >= outletBoreMm) ??
    connectors[connectors.length - 1]
  )
}

export function formatDnLabel(valueMm: number) {
  if (!Number.isFinite(valueMm) || valueMm <= 0) return "-"
  return `${Math.round(valueMm * 10) / 10} mm`
}

export function buildDnSizingProfile(
  requiredSeatMm: number,
  availableDnValues: number[]
): DnSizingProfile {
  const normalizedDnValues = Array.from(
    new Set(
      availableDnValues
        .filter((value) => Number.isFinite(value) && value > 0)
        .map((value) => Math.round(value * 10) / 10)
    )
  ).sort((a, b) => a - b)

  const candidates = normalizedDnValues.filter((value) => value >= requiredSeatMm)
  const recommendedDnMm = candidates[0] || 0
  const maxUsefulDnMm = recommendedDnMm
    ? Math.max(
        recommendedDnMm * DN_OVERSIZE_RATIO_LIMIT,
        requiredSeatMm + DN_OVERSIZE_ABSOLUTE_LIMIT_MM
      )
    : 0

  const compatibleDnValues = candidates.filter(
    (value) => !maxUsefulDnMm || value <= maxUsefulDnMm
  )

  return {
    requiredSeatMm,
    recommendedDnMm,
    recommendedDnLabel: recommendedDnMm ? formatDnLabel(recommendedDnMm) : "-",
    compatibleDnValues,
    compatibleDnLabels: compatibleDnValues.map(formatDnLabel),
    maxUsefulDnMm,
  }
}

export function isDnInUsefulRange(dnMm: number, profile: DnSizingProfile) {
  if (!Number.isFinite(dnMm) || dnMm <= 0) return false
  if (dnMm < profile.requiredSeatMm) return false
  if (!profile.maxUsefulDnMm) return true
  return dnMm <= profile.maxUsefulDnMm
}
