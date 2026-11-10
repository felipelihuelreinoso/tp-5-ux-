// Funciones puras: reciben un valor y devuelven un mensaje de error o null
const req = (m) => (v) => (String(v).trim() ? null : m);
const min2 = (m) => (v) => (v.trim().length >= 2 ? null : m);
export const V = {
  'equipo.marca': req('Elegí una marca'),
  'equipo.modelo': (v) => (v.trim().length >= 2 && v.trim().length <= 40 ? null : 'Ingresá el modelo del equipo'),
  'equipo.valor': (v) => (v >= 100000 && v <= 2500000 ? null : 'El valor debe estar entre $100.000 y $2.500.000'),
  'equipo.antiguedad': req('Indicá la antigüedad'),
  'titular.nombre': min2('Ingresá tu nombre'),
  'titular.apellido': min2('Ingresá tu apellido'),
  'titular.dni': (v) => (/^\d{7,8}$/.test(v) ? null : 'El DNI debe tener 7 u 8 números'),
  'titular.nacimiento': (v) => {
    const lim = new Date(); lim.setFullYear(lim.getFullYear() - 18);
    return v && new Date(v) <= lim ? null : 'Tenés que ser mayor de edad';
  },
  'titular.email': (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Ingresá un email válido'),
  'titular.celular': (v) => {
    const d = v.replace(/[\s-]/g, '');
    return /^[1-9]\d{9}$/.test(d) && !d.startsWith('15') ? null : 'Ej.: 11 5555-1234';
  },
  'titular.terminos': (v) => (v ? null : 'Tenés que aceptar los términos'),
  'pago.tarjeta': (v) => (/^\d{16}$/.test(v.replace(/\s/g, '')) ? null : 'Número de tarjeta inválido'),
  'pago.vencimiento': (v) => {
    const m = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(v);
    return m && new Date(2000 + Number(m[2]), Number(m[1]), 1) > new Date() ? null : 'Vencimiento inválido';
  },
  'pago.cvv': (v) => (/^\d{3}$/.test(v) ? null : 'CVV inválido'),
  'pago.titular': req('Ingresá el nombre del titular'),
};
export const FIELDS = {
  1: ['equipo.marca', 'equipo.modelo', 'equipo.valor', 'equipo.antiguedad'],
  3: ['titular.nombre', 'titular.apellido', 'titular.dni', 'titular.nacimiento', 'titular.email', 'titular.celular', 'titular.terminos'],
  4: ['pago.tarjeta', 'pago.vencimiento', 'pago.cvv', 'pago.titular'],
};
export const faltantes = (paso, get) => FIELDS[paso].filter((p) => V[p](get(p)));
