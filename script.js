// URL del Apps Script
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzuW4JO02uLfOIUVGWxW5sY80Wicsn2_avTy2iArR8zG9dqqRDbh22dGZqTq89MG8xp/exec';

let currentStep = 0;
const pasos = document.querySelectorAll('.form-paso');
const btnSiguiente = document.querySelectorAll('.btn-siguiente');
const btnAnterior = document.querySelectorAll('.btn-anterior');
const btnRegistrar = document.querySelector('.btn-registrar');
const formulario = document.getElementById('formularioAsistencia');
const mensajeExito = document.getElementById('mensajeExito');
const btnCerrarMensaje = document.querySelector('.btn-cerrar');

let ubicacion = { lat: null, lng: null };

// Al cargar
document.addEventListener('DOMContentLoaded', () => {
  mostrarPaso(0);
  actualizarFechaHora();
  obtenerGeolocalizacion();

  btnSiguiente.forEach(btn => btn.addEventListener('click', () => avanzarPaso()));
  btnAnterior.forEach(btn => btn.addEventListener('click', () => retrocederPaso()));
  formulario.addEventListener('submit', enviarFormulario);
  btnCerrarMensaje.addEventListener('click', () => mensajeExito.classList.remove('active'));
});

function mostrarPaso(indice) {
  pasos.forEach((paso, i) => paso.classList.toggle('active', i === indice));
  currentStep = indice;
}

function avanzarPaso() {
  if (!validarPaso(currentStep)) return;
  if (currentStep < pasos.length - 1) mostrarPaso(currentStep + 1);
}

function retrocederPaso() {
  if (currentStep > 0) mostrarPaso(currentStep - 1);
}

function actualizarFechaHora() {
  const ahora = new Date();
  document.getElementById('fecha').value = ahora.toISOString().split('T')[0];
  document.getElementById('hora').value = ahora.toTimeString().split(':').slice(0, 2).join(':');
}

function obtenerGeolocalizacion() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        ubicacion.lat = position.coords.latitude;
        ubicacion.lng = position.coords.longitude;
      },
      error => console.error("Ubicación no disponible:", error),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }
}

function validarPaso(indice) {
  const pasoActual = pasos[indice];
  const campos = pasoActual.querySelectorAll('[required]');
  let valido = true;

  campos.forEach(campo => {
    if (!campo.value.trim() || (campo.type === 'checkbox' && !campo.checked)) {
      campo.classList.add('shake');
      setTimeout(() => campo.classList.remove('shake'), 500);
      valido = false;
    }
  });

  return valido;
}

function enviarFormulario(e) {
  e.preventDefault();
  if (!validarPaso(currentStep)) return;

  btnRegistrar.disabled = true;
  btnRegistrar.textContent = 'Registrando...';

  const datos = {
    fecha: document.getElementById('fecha')?.value,
    hora: document.getElementById('hora')?.value,
    latitud: ubicacion.lat,
    longitud: ubicacion.lng,
    area: document.getElementById('area')?.value,
    departamento: document.getElementById('departamento')?.value,
    tipoActividad: document.getElementById('tipoActividad')?.value,
    temaPrincipal: document.getElementById('temaPrincipal')?.value,
    actividad: document.getElementById('actividad')?.value,
    encargado: document.getElementById('encargado')?.value,
    nombre: document.getElementById('nombre')?.value,
    cedula: document.getElementById('cedula')?.value,
    cargo: document.getElementById('cargo')?.value,
    comentario: document.getElementById('comentario')?.value,
    correo: document.getElementById('correo')?.value
  };

  fetch(SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  })
    .then(res => {
      if (!res.ok) throw new Error(`Error HTTP ${res.status} - ${res.statusText}`);
      return res.json();
    })
    .then(() => mostrarExito())
    .catch(err => {
      console.error('Error en el envío:', err);
      alert(`⚠️ Ocurrió un error al enviar el formulario:\n${err.message}`);
      btnRegistrar.disabled = false;
      btnRegistrar.textContent = 'Registrar Asistencia';
    });
}

function mostrarExito() {
  mensajeExito.classList.add('active');
  formulario.reset();
  mostrarPaso(0);
  btnRegistrar.disabled = true;
  btnRegistrar.textContent = 'Registrado';
}