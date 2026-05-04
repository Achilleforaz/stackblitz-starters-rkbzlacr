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

export type PrismSizingResult = {
  flowNm3h: number
  deltaP: number
  gasSpeed: number
  seatSizeMm: number
  outletBoreMm: number
  maxFlowDeltaP: number
  maxFlowSeat: number
  maxFlowPort: number
  expectedOutletVelocity: number
}

const ATMOSPHERIC_PRESSURE_BAR = 1.013

function toAbsoluteBar(pressureBarG: number) {
  return pressureBarG + ATMOSPHERIC_PRESSURE_BAR
}

export function computePrismSizing(
  condition: PrismCondition,
  fluid: PrismFluid
): PrismSizingResult {
  const density = fluid.density_nm3

  const inletPressureBarG = condition.inletPressure
  const outletPressureBarG = condition.outletPressure
  const temperatureC = condition.temperature
  const flowRateGs = condition.flowRateGs

  const inletPressureBarA = toAbsoluteBar(inletPressureBarG)
  const outletPressureBarA = toAbsoluteBar(outletPressureBarG)

  const deltaP = inletPressureBarG - outletPressureBarG

  const flowNm3h =
    density > 0 ? (flowRateGs * 3.6) / density : 0

  const gasSpeed = getGasSpeedForOutletPressure(fluid, outletPressureBarG)

  let seatSizeMm = 0

  const isSubCritical =
    outletPressureBarG > 0 &&
    inletPressureBarG / outletPressureBarG < 2

  if (flowNm3h > 0 && deltaP > 0) {
    if (isSubCritical) {
      seatSizeMm =
        0.283 *
        Math.sqrt(flowNm3h) *
        Math.pow(
          (density * (temperatureC + 273)) /
            outletPressureBarA /
            deltaP,
          0.25
        )
    } else {
      seatSizeMm =
        0.4 *
        Math.sqrt(flowNm3h / inletPressureBarA) *
        Math.pow(density * (temperatureC + 273), 0.25)
    }
  }

  let outletBoreMm = 0

  if (flowNm3h > 0 && gasSpeed > 0) {
    outletBoreMm =
      1.13 *
      Math.sqrt(
        (flowNm3h * (temperatureC + 273)) /
          gasSpeed /
          outletPressureBarA
      )
  }

  let maxFlowDeltaP = 0
  let maxFlowSeat = 0
  let maxFlowPort = 0
  let expectedOutletVelocity = 0

  if (seatSizeMm > 0) {
    if (isSubCritical) {
      maxFlowDeltaP =
        Math.pow(
          seatSizeMm /
            (0.283 *
              Math.pow(
                (density * (temperatureC + 273)) /
                  outletPressureBarA /
                  deltaP,
                0.25
              )),
          2
        )
    } else {
      maxFlowDeltaP =
        Math.pow(
          seatSizeMm /
            (0.4 *
              Math.pow(density * (temperatureC + 273), 0.25) /
              Math.sqrt(inletPressureBarA)),
          2
        )
    }
  }

  maxFlowSeat = maxFlowDeltaP

  if (outletBoreMm > 0 && gasSpeed > 0) {
    maxFlowPort =
      (Math.pow(outletBoreMm / 1.13, 2) *
        gasSpeed *
        outletPressureBarA) /
      (temperatureC + 273)
  }

  if (flowNm3h > 0 && outletBoreMm > 0) {
    const area = Math.PI * Math.pow(outletBoreMm / 1000, 2) / 4
    expectedOutletVelocity =
      (flowNm3h * (temperatureC + 273)) /
      area /
      outletPressureBarA
  }

  return {
    flowNm3h,
    deltaP,
    gasSpeed,
    seatSizeMm,
    outletBoreMm,
    maxFlowDeltaP,
    maxFlowSeat,
    maxFlowPort,
    expectedOutletVelocity,
  }
}
