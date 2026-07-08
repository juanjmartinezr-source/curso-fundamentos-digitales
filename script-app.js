/* =========================================================
   USUARIOS VÁLIDOS (necesario para validar la sesión guardada)
========================================================= */
const USUARIOS = {
  juan:   "1234",
  camilo: "4321",
  jose:   "4567",
  maria:  "7890"
};

const TEMAS = [
  "Sistemas de numeración y conversiones",
  "Compuertas básicas y tablas de verdad",
  "Álgebra de Boole: teoremas y simplificación",
  "Mapas de Karnaugh (2, 3 y 4 variables)",
  "Multiplexores y decodificadores",
  "Sumador completo",
  "Flip-flops D y JK",
  "Contadores básicos"
];

// Los 8 pasos del recorrido solicitado
const PASOS = [
  { id: "curso",         nombre: "Ingresar al curso" },
  { id: "anuncio",       nombre: "Leer el anuncio inicial" },
  { id: "documento",     nombre: "Descargar un documento" },
  { id: "video",         nombre: "Ver un video" },
  { id: "foro",          nombre: "Participar en un foro" },
  { id: "tarea",         nombre: "Entregar una tarea" },
  { id: "cuestionario",  nombre: "Presentar un cuestionario" },
  { id: "calificacion",  nombre: "Revisar la calificación" }
];

const VIDEO_ID = "VwOkqM4j-ts"; // Tablero eléctrico domiciliario explicado

const PREGUNTAS = [
  {
    texto: "¿Cuál es la función principal del breaker (interruptor automático)?",
    opciones: [
      "Cortar la corriente ante sobrecarga o corto circuito",
      "Aumentar el voltaje de la casa",
      "Decorar el tablero eléctrico",
      "Medir el consumo de agua"
    ],
    correcta: 0
  },
  {
    texto: "¿Qué cable se considera normalmente el 'vivo' o de fase?",
    opciones: ["El verde", "El blanco", "El negro o rojo", "El transparente"],
    correcta: 2
  },
  {
    texto: "¿Para qué sirve el cable neutro?",
    opciones: [
      "Cierra el circuito y regresa la corriente a la red",
      "Solo sirve de adorno",
      "Aumenta la potencia del circuito",
      "Conecta la casa a internet"
    ],
    correcta: 0
  },
  {
    texto: "En una conexión en serie, si un punto de luz se funde, ¿qué pasa con los demás del mismo circuito?",
    opciones: [
      "No pasa nada, siguen encendidos",
      "También se apagan porque el circuito se interrumpe",
      "Se vuelven más brillantes",
      "Se apagan solo los de otro cuarto"
    ],
    correcta: 1
  },
  {
    texto: "¿Qué tipo de conexión se usa normalmente en las instalaciones domésticas de tomas e iluminación?",
    opciones: ["En serie", "En paralelo", "Mixta obligatoria", "Ninguna, van sueltas"],
    correcta: 1
  },
  {
    texto: "¿Qué debes hacer antes de instalar un interruptor o una toma?",
    opciones: [
      "Nada, se puede trabajar con corriente",
      "Apagar el breaker del circuito y verificar con multímetro",
      "Solo avisar a un vecino",
      "Mojar los cables para verificar"
    ],
    correcta: 1
  },
  {
    texto: "Para cambiar una bombilla de forma segura, primero debes:",
    opciones: [
      "Apagar el interruptor de esa luz (o el breaker si vas a manipular cables)",
      "Quitarla con las manos mojadas",
      "Dejarla encendida para verla mejor",
      "Cambiarla mientras alguien más usa el interruptor"
    ],
    correcta: 0
  },
  {
    texto: "¿Qué instrumento se usa comúnmente para medir voltaje y verificar si hay corriente?",
    opciones: ["Un martillo", "Un multímetro", "Un destornillador plano", "Una cinta métrica"],
    correcta: 1
  },
  {
    texto: "¿Cuál es la fórmula correcta para calcular el consumo de un electrodoméstico en kWh/día?",
    opciones: [
      "Potencia (W) × Horas ÷ 1000",
      "Potencia (W) ÷ Horas × 1000",
      "Horas ÷ Potencia (W)",
      "Potencia (W) + Horas"
    ],
    correcta: 0
  },
  {
    texto: "¿Por qué nunca se debe asumir que el cable neutro está 'sin corriente'?",
    opciones: [
      "Porque puede tener tensión respecto a tierra y representar riesgo",
      "Porque el neutro no existe en la práctica",
      "Porque es solo un cable decorativo",
      "Porque el neutro siempre está frío al tacto"
    ],
    correcta: 0
  }
];

/* =========================================================
   ESTADO / ALMACENAMIENTO
========================================================= */
let usuarioActual = null;

function claveProgreso(u){ return `progreso_${u}`; }
function claveTarea(u){ return `tarea_${u}`; }
function claveQuiz(u){ return `quiz_${u}`; }

function progresoInicial(){
  const p = {};
  PASOS.forEach(paso => p[paso.id] = false);
  return p;
}

function cargarProgreso(u){
  const raw = localStorage.getItem(claveProgreso(u));
  return raw ? JSON.parse(raw) : progresoInicial();
}

function guardarProgreso(u, progreso){
  localStorage.setItem(claveProgreso(u), JSON.stringify(progreso));
}

function cargarForo(){
  const raw = localStorage.getItem("foro_posts");
  return raw ? JSON.parse(raw) : [];
}
function guardarForo(posts){
  localStorage.setItem("foro_posts", JSON.stringify(posts));
}

/* =========================================================
   GUARDIA DE SESIÓN
   Si no hay sesión válida guardada, regresa a index.html
========================================================= */
function iniciarApp(usuario){
  usuarioActual = usuario;

  document.getElementById("usuario-actual").textContent =
    usuario.charAt(0).toUpperCase() + usuario.slice(1);

  const progreso = cargarProgreso(usuario);
  progreso.curso = true; // entrar al curso ya cuenta como paso 1 completado
  guardarProgreso(usuario, progreso);

  construirListaTemas();
  construirSwitches();
  construirQuiz();
  renderForo();
  restaurarTarea();
  actualizarUI();
  irAPaso("curso");
}

document.getElementById("btn-logout").addEventListener("click", () => {
  localStorage.removeItem("sesion_activa");
  window.location.href = "index.html";
});

window.addEventListener("DOMContentLoaded", () => {
  const sesion = localStorage.getItem("sesion_activa");
  if (sesion && USUARIOS[sesion]) {
    iniciarApp(sesion);
  } else {
    window.location.href = "index.html";
  }
});

/* =========================================================
   LISTA DE TEMAS (paso 1)
========================================================= */
function construirListaTemas(){
  const ul = document.getElementById("lista-temas");
  ul.innerHTML = "";
  TEMAS.forEach(t => {
    const li = document.createElement("li");
    li.textContent = t;
    ul.appendChild(li);
  });
}

/* =========================================================
   SWITCHES DEL TABLERO (navegación)
========================================================= */
function construirSwitches(){
  const cont = document.getElementById("lista-switches");
  cont.innerHTML = "";
  PASOS.forEach((paso, i) => {
    const btn = document.createElement("button");
    btn.className = "switch-fila";
    btn.dataset.paso = paso.id;
    btn.innerHTML = `
      <span class="switch-num">${String(i+1).padStart(2,"0")}</span>
      <span class="switch-toggle" aria-hidden="true"></span>
      <span class="switch-texto">
        <span class="switch-nombre">${paso.nombre}</span>
        <span class="switch-estado">OFF</span>
      </span>
    `;
    btn.addEventListener("click", () => {
      if (btn.classList.contains("bloqueado")) return;
      irAPaso(paso.id);
    });
    cont.appendChild(btn);
  });
}

function pasoDesbloqueado(id){
  const progreso = cargarProgreso(usuarioActual);
  const idx = PASOS.findIndex(p => p.id === id);
  if (idx === 0) return true;
  const anterior = PASOS[idx - 1].id;
  return !!progreso[anterior];
}

function actualizarUI(){
  const progreso = cargarProgreso(usuarioActual);

  // switches
  document.querySelectorAll(".switch-fila").forEach(fila => {
    const id = fila.dataset.paso;
    const completado = !!progreso[id];
    const desbloqueado = pasoDesbloqueado(id);
    fila.classList.toggle("completado", completado);
    fila.classList.toggle("bloqueado", !desbloqueado);
    fila.querySelector(".switch-estado").textContent = completado ? "ON" : "OFF";
  });

  // medidor
  const total = PASOS.length;
  const hechos = PASOS.filter(p => progreso[p.id]).length;
  const pct = Math.round((hechos/total)*100);
  document.getElementById("medidor-fill").style.width = pct + "%";
  document.getElementById("medidor-valor").textContent = pct + "%";
}

function marcarPasoCompleto(id){
  const progreso = cargarProgreso(usuarioActual);
  progreso[id] = true;
  guardarProgreso(usuarioActual, progreso);
  actualizarUI();
}

function irAPaso(id){
  if (!pasoDesbloqueado(id)) return;

  document.querySelectorAll(".paso").forEach(p => p.classList.remove("paso-activo"));
  document.getElementById(`paso-${id}`).classList.add("paso-activo");

  const idx = PASOS.findIndex(p => p.id === id);
  document.getElementById("topbar-eyebrow").textContent = `PASO ${idx+1} DE ${PASOS.length}`;
  document.getElementById("topbar-titulo").textContent = PASOS[idx].nombre;

  document.querySelectorAll(".switch-fila").forEach(f =>
    f.classList.toggle("activo", f.dataset.paso === id)
  );

  if (id === "video") cargarVideo();
  if (id === "cuestionario") { /* ya construido */ }
  if (id === "calificacion") mostrarCalificacion();

  actualizarUI();
  window.scrollTo({top:0, behavior:"smooth"});
}

// Botones "Continuar" / "Entrar al curso"
document.querySelectorAll("[data-ir]").forEach(btn => {
  btn.addEventListener("click", () => {
    // el paso actual (de donde viene el botón) se marca completo
    const pasoActualEl = btn.closest(".paso");
    const idActual = pasoActualEl.id.replace("paso-", "");
    marcarPasoCompleto(idActual);
    irAPaso(btn.dataset.ir);
  });
});

/* =========================================================
   PASO 3: DOCUMENTO
========================================================= */
document.getElementById("link-descarga").addEventListener("click", () => {
  document.getElementById("descarga-confirmacion").hidden = false;
  document.getElementById("btn-continuar-documento").disabled = false;
  marcarPasoCompleto("documento");
});

/* =========================================================
   PASO 4: VIDEO
========================================================= */
function cargarVideo(){
  const frame = document.getElementById("video-frame");
  if (!frame.src) {
    frame.src = `https://www.youtube.com/embed/${VIDEO_ID}`;
  }
}
document.getElementById("btn-marcar-video").addEventListener("click", () => {
  document.getElementById("video-confirmacion").hidden = false;
  document.getElementById("btn-continuar-video").disabled = false;
  marcarPasoCompleto("video");
});

/* =========================================================
   PASO 5: FORO
========================================================= */
function renderForo(){
  const cont = document.getElementById("foro-lista");
  const posts = cargarForo();
  cont.innerHTML = "";

  if (posts.length === 0) {
    cont.innerHTML = `<p style="color:var(--text-muted); font-size:13.5px;">Aún no hay publicaciones. ¡Sé el primero en participar!</p>`;
  }

  posts.slice().reverse().forEach(post => {
    const div = document.createElement("div");
    div.className = "foro-post";
    const fecha = new Date(post.fecha).toLocaleString("es-CO", {
      day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit"
    });
    div.innerHTML = `
      <div class="foro-post-cabecera">
        <span class="foro-post-autor">${post.autor}</span>
        <span>${fecha}</span>
      </div>
      <p class="foro-post-texto"></p>
    `;
    div.querySelector(".foro-post-texto").textContent = post.texto;
    cont.appendChild(div);
  });
}

document.getElementById("form-foro").addEventListener("submit", (e) => {
  e.preventDefault();
  const textarea = document.getElementById("foro-texto");
  const texto = textarea.value.trim();
  if (!texto) return;

  const posts = cargarForo();
  posts.push({
    autor: usuarioActual.charAt(0).toUpperCase() + usuarioActual.slice(1),
    texto,
    fecha: Date.now()
  });
  guardarForo(posts);
  textarea.value = "";
  renderForo();

  document.getElementById("btn-continuar-foro").disabled = false;
  marcarPasoCompleto("foro");
});

/* =========================================================
   PASO 6: TAREA
========================================================= */
const potenciaInput = document.getElementById("tarea-potencia");
const horasInput = document.getElementById("tarea-horas");
const resultadoValor = document.getElementById("tarea-resultado-valor");

function calcularConsumo(){
  const p = parseFloat(potenciaInput.value);
  const h = parseFloat(horasInput.value);
  if (!isNaN(p) && !isNaN(h)) {
    const kwh = (p * h) / 1000;
    resultadoValor.textContent = `${kwh.toFixed(2)} kWh/día`;
  } else {
    resultadoValor.textContent = "— kWh/día";
  }
}
potenciaInput.addEventListener("input", calcularConsumo);
horasInput.addEventListener("input", calcularConsumo);

function restaurarTarea(){
  const raw = localStorage.getItem(claveTarea(usuarioActual));
  if (!raw) return;
  const data = JSON.parse(raw);
  document.getElementById("tarea-aparato").value = data.aparato || "";
  potenciaInput.value = data.potencia || "";
  horasInput.value = data.horas || "";
  document.getElementById("tarea-comentario").value = data.comentario || "";
  calcularConsumo();
  if (data.entregada) {
    document.getElementById("tarea-confirmacion").hidden = false;
    document.getElementById("btn-continuar-tarea").disabled = false;
  }
}

document.getElementById("form-tarea").addEventListener("submit", (e) => {
  e.preventDefault();
  const data = {
    aparato: document.getElementById("tarea-aparato").value.trim(),
    potencia: potenciaInput.value,
    horas: horasInput.value,
    comentario: document.getElementById("tarea-comentario").value.trim(),
    entregada: true
  };
  localStorage.setItem(claveTarea(usuarioActual), JSON.stringify(data));
  document.getElementById("tarea-confirmacion").hidden = false;
  document.getElementById("btn-continuar-tarea").disabled = false;
  marcarPasoCompleto("tarea");
});

/* =========================================================
   PASO 7: CUESTIONARIO
========================================================= */
function construirQuiz(){
  const form = document.getElementById("form-quiz");
  form.innerHTML = "";
  PREGUNTAS.forEach((preg, i) => {
    const div = document.createElement("div");
    div.className = "pregunta";
    let opcionesHtml = "";
    preg.opciones.forEach((op, j) => {
      opcionesHtml += `
        <label class="opcion">
          <input type="radio" name="pregunta-${i}" value="${j}" required>
          <span></span>
        </label>`;
    });
    div.innerHTML = `<p class="pregunta-texto">${i+1}. ${preg.texto}</p>${opcionesHtml}`;
    // set option text safely (avoid HTML injection concerns, though content is static)
    div.querySelectorAll(".opcion span").forEach((span, j) => {
      span.textContent = preg.opciones[j];
    });
    form.appendChild(div);
  });
}

document.getElementById("form-quiz").addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.target;
  let correctas = 0;
  const respuestas = [];

  PREGUNTAS.forEach((preg, i) => {
    const seleccionado = form.querySelector(`input[name="pregunta-${i}"]:checked`);
    const valor = seleccionado ? parseInt(seleccionado.value) : null;
    respuestas.push(valor);
    if (valor === preg.correcta) correctas++;
  });

  const pct = Math.round((correctas / PREGUNTAS.length) * 100);
  localStorage.setItem(claveQuiz(usuarioActual), JSON.stringify({
    correctas, total: PREGUNTAS.length, pct, respuestas
  }));

  marcarPasoCompleto("cuestionario");
  irAPaso("calificacion");
});

/* =========================================================
   PASO 8: CALIFICACIÓN
========================================================= */
function mostrarCalificacion(){
  marcarPasoCompleto("calificacion");

  const quizRaw = localStorage.getItem(claveQuiz(usuarioActual));
  const quiz = quizRaw ? JSON.parse(quizRaw) : { correctas:0, total:PREGUNTAS.length, pct:0 };

  const circulo = document.getElementById("medidor-circular");
  const pctEl = document.getElementById("calificacion-porcentaje");
  const estadoEl = document.getElementById("calificacion-estado");

  const pct = quiz.pct;
  circulo.style.background = `conic-gradient(var(--safety-yellow) ${pct*3.6}deg, var(--line) 0deg)`;
  pctEl.textContent = pct + "%";

  if (pct >= 60) {
    estadoEl.textContent = "✓ Curso aprobado";
    estadoEl.style.color = "#1E8449";
  } else {
    estadoEl.textContent = "Necesitas repasar el material (mínimo 60%)";
    estadoEl.style.color = "#C0392B";
  }

  const progreso = cargarProgreso(usuarioActual);
  const resumen = document.getElementById("resumen-lista");
  resumen.innerHTML = "";
  PASOS.forEach(paso => {
    const fila = document.createElement("div");
    fila.className = "resumen-fila";
    fila.innerHTML = `<span>${paso.nombre}</span><span>${progreso[paso.id] ? "✓ Completado" : "— Pendiente"}</span>`;
    resumen.appendChild(fila);
  });

  const filaQuiz = document.createElement("div");
  filaQuiz.className = "resumen-fila";
  filaQuiz.innerHTML = `<span>Puntaje del cuestionario</span><span>${quiz.correctas} / ${quiz.total} correctas</span>`;
  resumen.appendChild(filaQuiz);
}

document.getElementById("btn-reiniciar").addEventListener("click", () => {
  if (!confirm("Esto borrará tu progreso, tarea y cuestionario. ¿Continuar?")) return;
  localStorage.removeItem(claveProgreso(usuarioActual));
  localStorage.removeItem(claveTarea(usuarioActual));
  localStorage.removeItem(claveQuiz(usuarioActual));
  location.reload();
});
