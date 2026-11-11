// Redondear flotantes en JS es un parto porque 0.1 + 0.2 te mete basura decimal
// en todos los graficos de la UI si no lo cortamos de raiz en cada paso del motor.

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function logisticCurve(x: number, midpoint: number, steepness: number): number {
  const exponent = clamp(-steepness * (x - midpoint), -20, 20);
  return 1 / (1 + Math.exp(exponent));
}

