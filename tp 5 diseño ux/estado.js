import { render } from './render.js';
export const solicitud = {
  paso: 0, // 0 = inicio, 1..4 = checkout, 5 = éxito, 6 = error
  equipo: { marca: '', modelo: '', valor: 0, antiguedad: '' },
  plan: 'plus',
  titular: { nombre: '', apellido: '', dni: '', nacimiento: '', email: '', celular: '', terminos: false },
  pago: { metodo: 'credito', tarjeta: '', vencimiento: '', cvv: '', titular: '' },
  poliza: null,
  error: null,
};
export const catalogo = [];
const inicial = structuredClone(solicitud);
export const get = (p) => p.split('.').reduce((o, k) => o[k], solicitud);
export function set(p, v) {
  const k = p.split('.'), ultimo = k.pop();
  k.reduce((o, x) => o[x], solicitud)[ultimo] = v;
}
export function irAPaso(n) { solicitud.paso = n; render(); scrollTo(0, 0); }
export function reiniciar() { Object.assign(solicitud, structuredClone(inicial)); irAPaso(0); }
