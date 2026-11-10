export const FACTOR = { menos1: 1, '1a2': 1.1, mas2: 1.25 };
export const calcularCuota = (valor, tasaAnual, antiguedad) =>
  Math.round((valor * tasaAnual) / 12 * FACTOR[antiguedad]);
