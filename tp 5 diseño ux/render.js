import { solicitud as s, catalogo, get } from './estado.js';
import { calcularCuota } from './cotizador.js';
import { V, faltantes } from './validaciones.js';
const $ = (q) => document.querySelector(q);
const $$ = (q) => document.querySelectorAll(q);
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
export const ars = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
const planActual = () => catalogo.find((p) => p.id === s.plan);
const cuota = (p) => calcularCuota(s.equipo.valor, p.tasaAnual, s.equipo.antiguedad);

export function render() {
  $$('[data-paso]').forEach((e) => { e.hidden = Number(e.dataset.paso) !== s.paso; });
  $('#checkout').hidden = $('#stepper').hidden = !(s.paso >= 1 && s.paso <= 4);
  renderPlanes();
  $$('[data-bind]').forEach((el) => {
    const v = get(el.dataset.bind);
    if (el.type === 'checkbox') el.checked = v;
    else if (el.type === 'radio') el.checked = el.value === v;
    else el.value = v || '';
  });
  limpiarErrores();
  renderStepper();
  renderResumen();
  renderFinal();
  actualizarBotones();
}
function renderPlanes() {
  $('#planes').innerHTML = s.equipo.antiguedad ? catalogo.map((p) => `
    <label class="card cursor-pointer has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50 has-[:focus-visible]:ring-2">
      <input type="radio" name="plan" value="${p.id}" data-bind="plan" class="sr-only">
      <span class="flex items-center justify-between gap-2"><strong>${p.nombre}</strong>${p.recomendado ? '<span class="badge">Recomendado</span>' : ''}</span>
      <span class="text-2xl font-extrabold text-indigo-800">${ars(cuota(p))}<small class="text-xs font-normal text-slate-500"> /mes</small></span>
      <ul class="list-disc pl-4 text-sm text-slate-600">${p.coberturas.map((c) => `<li>${c}</li>`).join('')}</ul>
    </label>`).join('') : '';
}
function renderStepper() {
  const pasos = ['Cotizar', 'Plan', 'Datos', 'Pago'];
  $('#stepper').innerHTML = pasos.map((t, i) => {
    const n = i + 1, hecho = n < s.paso, activo = n === s.paso;
    const color = hecho ? 'bg-emerald-600 text-white' : activo ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700';
    return `<li class="flex items-center gap-2" ${activo ? 'aria-current="step"' : ''}>
      <span class="grid size-7 place-items-center rounded-full text-xs font-semibold ${color}">${hecho ? '✓' : n}</span>
      <span class="text-sm ${activo ? 'font-semibold' : 'text-slate-600'}">${t}</span></li>`;
  }).join('');
}
export function renderResumen() {
  const p = planActual(), t = s.titular, el = $('#resumen');
  el.hidden = s.paso < 2;
  el.innerHTML = !p || s.paso < 2 ? '' : `<header><h2>Resumen</h2></header>
    <section class="grid gap-2 text-sm">
      <p><strong>Seguro de Celular</strong></p>
      <p>${esc(s.equipo.marca)} ${esc(s.equipo.modelo)} · ${ars(s.equipo.valor)}</p>
      <p>Plan ${p.nombre}</p>
      ${t.nombre ? `<p>Titular: ${esc(t.nombre)} ${esc(t.apellido)}</p>` : ''}
      <p class="text-lg font-bold text-indigo-800">Total: ${ars(cuota(p))}/mes</p></section>`;
}
function renderFinal() {
  const p = planActual();
  if (s.poliza && p) {
    $('#exito-datos').innerHTML = `<p><strong>Póliza:</strong> ${s.poliza}</p>
      <p><strong>Titular:</strong> ${esc(s.titular.nombre)} ${esc(s.titular.apellido)}</p>
      <p><strong>Email:</strong> ${esc(s.titular.email)}</p>
      <p><strong>Detalle:</strong> Seguro de Celular · Plan ${p.nombre} · ${ars(cuota(p))}/mes</p>`;
  }
  $('#error-msg').textContent = s.error || '';
}
export function mostrarError(path) {
  if (!V[path]) return;
  const msg = V[path](get(path));
  const inputs = $$(`[data-bind="${path}"]`), grupo = inputs[0].closest('.field'), p = grupo.querySelector('p[role=alert]');
  p.id ||= 'err-' + path.replace('.', '-');
  grupo.toggleAttribute('data-invalid', !!msg);
  inputs.forEach((i) => { i.setAttribute('aria-invalid', !!msg); i.setAttribute('aria-describedby', p.id); });
  p.textContent = msg || '';
  p.hidden = !msg;
}
function limpiarErrores() {
  $$('[data-invalid]').forEach((g) => g.removeAttribute('data-invalid'));
  $$('[aria-invalid]').forEach((i) => i.removeAttribute('aria-invalid'));
  $$('.field p[role=alert]').forEach((p) => { p.hidden = true; });
}
export function actualizarBotones() {
  [1, 3].forEach((n) => {
    const falta = faltantes(n, get).length, sec = $(`[data-paso="${n}"]`);
    sec.querySelector('[data-action=sig]').disabled = falta > 0;
    const hint = sec.querySelector('[data-hint]');
    hint.hidden = falta === 0;
    hint.textContent = `Falta completar ${falta} ${falta === 1 ? 'campo' : 'campos'} para continuar`;
  });
}
