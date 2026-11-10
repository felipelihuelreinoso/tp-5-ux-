import { solicitud as s, catalogo, get, set, irAPaso, reiniciar } from './estado.js';
import { faltantes } from './validaciones.js';
import { render, renderResumen, mostrarError, actualizarBotones } from './render.js';
import { simularPago, generarPoliza } from './pago.js';

const leer = (el) => el.type === 'checkbox' ? el.checked
  : el.dataset.bind === 'equipo.valor' ? Number(el.value.replace(/\D/g, '')) : el.value;

document.addEventListener('input', (e) => {
  const p = e.target.dataset?.bind;
  if (!p) return;
  set(p, leer(e.target));
  if (p === 'plan') renderResumen();
  actualizarBotones();
  if (['radio', 'checkbox'].includes(e.target.type) || e.target.closest('[data-invalid]')) mostrarError(p);
});
document.addEventListener('focusout', (e) => { if (e.target.dataset?.bind) mostrarError(e.target.dataset.bind); });
document.addEventListener('submit', (e) => e.preventDefault());

function mostrarFaltantes(mal) {
  mal.forEach(mostrarError);
  document.querySelector(`[data-bind="${mal[0]}"]`).focus();
}
function avanzar() {
  const mal = [1, 3].includes(s.paso) ? faltantes(s.paso, get) : [];
  if (mal.length) return mostrarFaltantes(mal);
  irAPaso(s.paso + 1);
}
async function pagar(btn) {
  const mal = faltantes(4, get);
  if (mal.length) return mostrarFaltantes(mal);
  btn.disabled = true;
  btn.textContent = 'Procesando…';
  const r = await simularPago(s.pago.tarjeta);
  btn.disabled = false;
  btn.textContent = 'Pagar y contratar';
  if (r.ok) { s.poliza = generarPoliza(); irAPaso(5); }
  else { s.error = r.motivo; irAPaso(6); }
}
const acciones = {
  iniciar: () => irAPaso(1),
  atras: () => irAPaso(s.paso - 1),
  sig: avanzar,
  pagar,
  reintentar: () => irAPaso(4),
  cambiar: () => { Object.assign(s.pago, { tarjeta: '', vencimiento: '', cvv: '' }); irAPaso(4); },
  inicio: reiniciar,
};
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-action]');
  if (b) acciones[b.dataset.action](b);
});

try {
  catalogo.push(...(await (await fetch('data/planes.json')).json()));
} catch {
  document.querySelector('main').insertAdjacentHTML('afterbegin',
    '<div class="alert" data-variant="destructive"><p>No se pudieron cargar los planes. Abrí el sitio con un servidor local (npx serve).</p></div>');
}
render();
