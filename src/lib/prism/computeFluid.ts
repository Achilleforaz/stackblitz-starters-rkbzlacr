export const ETHYLENE_REF_DENSITY = 1.26
 
export type PrismFluid = {
  id: string
  name: string
  chemical_symbol?: string | null
  density_nm3: number
  gas_speed_high: number
  gas_speed_low?: number | null
}
 
export type ComputedFluidValues = {
  density: number
  specificGravity: number
  gasSpeed: number
}
 
export function getGasSpeedForOutletPressure(
  fluid: PrismFluid,
  outletPressureBarG: number
) {
  if (outletPressureBarG > 1) {
    return fluid.gas_speed_high
  }
 
  if (typeof fluid.gas_speed_low === "number") {
    return fluid.gas_speed_low
  }
 
  return fluid.gas_speed_high / 3
}
 
export function computeFluidValues(
  fluid: PrismFluid,
  outletPressureBarG: number
): ComputedFluidValues {
  const density = fluid.density_nm3
 
  return {
    density,
    specificGravity: density / ETHYLENE_REF_DENSITY,
    gasSpeed: getGasSpeedForOutletPressure(fluid, outletPressureBarG),
  }
}
