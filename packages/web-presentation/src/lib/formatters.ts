// Formateadores unificados en es-AR (coma decimal, separador de miles con punto)
// y moneda consistente en millones de dolares/pesos para eliminar simbolos sueltos.

export function formatArNumber(value: number, decimals = 1): string {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatArSigned(value: number, decimals = 1): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatArNumber(value, decimals)}`;
}

export function formatArUsdMillions(value: number, decimals = 1): string {
  const num = Number.isInteger(value) && decimals === 1 ? formatArNumber(value, 0) : formatArNumber(value, decimals);
  return `US$ ${num} M`;
}
