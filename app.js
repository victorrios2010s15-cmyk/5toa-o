const evaluaciones = [
    {
    id: "05",
    fecha: "2026-11-13",
    materia: "Musica",
    tipo: "Taller Grupal",
    descripcion: "El Pentagrama",
    criterio: "Taller en grupo de 5 o 6 integrantes, en el cual se debe traer: papel bond, regla y marcadores.",
  },
];

function obtenerFechaLocal() {
  const hoy = new Date();
  const offset = hoy.getTimezoneOffset();
  return new Date(hoy.getTime() - offset * 60 * 1000).toISOString().split("T")[0];
}

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. CUENTA REGRESIVA FIN DE AÑO ---
  const fechaFinCurso = new Date("2026-12-05T23:59:59").getTime();
  
  function actualizarContador() {
    const ahora = new Date().getTime();
    const distancia = fechaFinCurso - ahora;
    const contadorDiv = document.getElementById("countdown-timer");

    if (contadorDiv && distancia > 0) {
      const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
      const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((distancia % (1000 * 60)) / 1000);

      const dElem = document.getElementById("days");
      const hElem = document.getElementById("hours");
      const mElem = document.getElementById("minutes");
      const sElem = document.getElementById("seconds");

      if (dElem) dElem.textContent = String(dias).padStart(2, '0');
      if (hElem) hElem.textContent = String(horas).padStart(2, '0');
      if (mElem) mElem.textContent = String(minutos).padStart(2, '0');
      if (sElem) sElem.textContent = String(segundos).padStart(2, '0');
    }
  }
  
  setInterval(actualizarContador, 1000);
  actualizarContador();

  // --- 2. FRASES SARCÁSTICAS ESTUDIANTILES ---
  const frases = [
    "“Deja para mañana lo que puedas hacer hoy. att:Vitico”",
    "“Si el director dice que eres el futuro del pais, preocupate por el pais. att:Leandro”",
    "“El que estudia duda de sus conocimientos. att:Noel.”",
  ];
  const quoteText = document.getElementById("quote-text");
  const quoteBtn = document.getElementById("new-quote-btn");
  if (quoteBtn && quoteText) {
    quoteBtn.addEventListener("click", () => {
      const aleatoria = frases[Math.floor(Math.random() * frases.length)];
      quoteText.textContent = aleatoria;
    });
  }

  // --- 3. BLOC DE NOTAS RÁPIDAS Y MODAL ---
  const notesArea = document.getElementById("quick-notes");
  const notesContainer = document.getElementById("notes-container");
  const modalOverlay = document.getElementById("custom-modal-overlay");
  const modalCloseBtn = document.getElementById("modal-close-btn");

  function mostrarModalAlerta() {
    if (modalOverlay) modalOverlay.classList.add("active");
  }

  function ocultarModalAlerta() {
    if (modalOverlay) modalOverlay.classList.remove("active");
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", ocultarModalAlerta);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) ocultarModalAlerta();
    });
  }

  function cargarNotasGuardadas() {
    if (!notesContainer) return;
    const notasGuardadas = JSON.parse(localStorage.getItem("mis_notas_tarjetas")) || [];
    notesContainer.innerHTML = "";

    notasGuardadas.forEach((textoNota, index) => {
      const tarjetaNota = document.createElement("div");
      tarjetaNota.className = "note-card-item";
      tarjetaNota.innerHTML = `
        <p>${textoNota}</p>
        <button class="delete-note-btn" data-index="${index}">Borrar</button>
      `;
      notesContainer.appendChild(tarjetaNota);
    });

    document.querySelectorAll(".delete-note-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = e.target.getAttribute("data-index");
        notasGuardadas.splice(idx, 1);
        localStorage.setItem("mis_notas_tarjetas", JSON.stringify(notasGuardadas));
        cargarNotasGuardadas();
      });
    });
  }

  const saveNotesBtn = document.getElementById("save-notes-btn");
  if (saveNotesBtn) {
    saveNotesBtn.addEventListener("click", () => {
      const texto = notesArea.value.trim();
      if (texto === "") {
        mostrarModalAlerta();
        return;
      }

      const notasGuardadas = JSON.parse(localStorage.getItem("mis_notas_tarjetas")) || [];
      notasGuardadas.push(texto);
      localStorage.setItem("mis_notas_tarjetas", JSON.stringify(notasGuardadas));
      notesArea.value = "";
      cargarNotasGuardadas();
    });
  }

  cargarNotasGuardadas();

  // --- EVALUACIONES Y CRONOGRAMA ---
  const container = document.getElementById("timeline");
  const alertBanner = document.getElementById("global-alert");
  const alertText = document.getElementById("global-alert-text");

  // Toma la fecha real del sistema de forma dinámica
  const hoyStr = obtenerFechaLocal();
  const hoy = new Date(hoyStr + "T00:00:00");
  let evaluacionesUrgentes = [];

  evaluaciones.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  if (container) {
    container.innerHTML = "";

    evaluaciones.forEach((ev) => {
      const fechaEv = new Date(ev.fecha + "T00:00:00");
      const diferenciaTiempo = fechaEv - hoy;
      const diasRestantes = Math.round(diferenciaTiempo / (1000 * 60 * 60 * 24));

      if (diasRestantes < 0) return;

      const esUrgente = diasRestantes <= 2;
      if (esUrgente) {
        evaluacionesUrgentes.push(
          `${ev.materia} (${diasRestantes === 0 ? "Hoy" : diasRestantes === 1 ? "Mañana" : "En 2 días"})`
        );
      }

      const partesFecha = ev.fecha.split("-");
      const fechaFormateada = `${partesFecha[2]}/${partesFecha[1]}/${partesFecha[0]}`;

      let textoDias = `Faltan ${diasRestantes} días`;
      if (diasRestantes === 0) textoDias = "¡Es Hoy!";
      if (diasRestantes === 1) textoDias = "Es Mañana";

      const card = document.createElement("div");
      card.className = `card ${esUrgente ? "urgent" : ""}`;
      card.innerHTML = `
        <div class="card-header">
            <div class="meta-info">
                <span class="date-badge">${fechaFormateada}</span>
                <h2 class="subject-title">${ev.materia}</h2>
            </div>
            <span class="type-tag">${ev.tipo}</span>
        </div>
        <div class="countdown-text">${textoDias}</div>
        <div class="card-details">
            <div class="detail-block">
                <div class="detail-label">¿De qué trata?</div>
                <div class="detail-value">${ev.descripcion}</div>
            </div>
            <div class="detail-block">
                <div class="detail-label">¿Cómo es la evaluación?</div>
                <div class="detail-value">${ev.criterio}</div>
            </div>
        </div>
      `;

      card.addEventListener("click", () => {
        card.classList.toggle("active");
      });

      container.appendChild(card);
    });
  }

  if (alertBanner && alertText) {
    if (evaluacionesUrgentes.length > 0) {
      alertText.innerHTML = `<strong>ALERTA DE EVALUACIÓN:</strong> Tienes entregas críticas pronto: ${evaluacionesUrgentes.join(", ")}. Revisa los temarios de inmediato.`;
      alertBanner.style.display = "flex";
    } else {
      alertBanner.style.display = "none";
    }
  }

  // --- CALENDARIO ---
  let fechaActualSistema = new Date();
  let mesActual = fechaActualSistema.getMonth();
  let anioActual = fechaActualSistema.getFullYear();
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const fechasEvaluaciones = evaluaciones.map(e => e.fecha);

  function renderizarCalendario() {
    const contenedorDias = document.getElementById("calendar-days");
    const textoMesAnio = document.getElementById("calendar-month-year");
    if (!contenedorDias || !textoMesAnio) return;

    contenedorDias.innerHTML = "";
    textoMesAnio.textContent = `${meses[mesActual]} ${anioActual}`;

    const primerDiaIndex = new Date(anioActual, mesActual, 1).getDay();
    const totalDias = new Date(anioActual, mesActual + 1, 0).getDate();

    for (let i = 0; i < primerDiaIndex; i++) {
      const divVacio = document.createElement("div");
      divVacio.style.background = "transparent";
      divVacio.style.cursor = "default";
      contenedorDias.appendChild(divVacio);
    }

    for (let dia = 1; dia <= totalDias; dia++) {
      const divDia = document.createElement("div");
      divDia.textContent = dia;

      const mesFormateado = String(mesActual + 1).padStart(2, '0');
      const diaFormateado = String(dia).padStart(2, '0');
      const fechaClave = `${anioActual}-${mesFormateado}-${diaFormateado}`;

      // Comprueba dinámicamente el día, mes y año real de hoy
      if (dia === fechaActualSistema.getDate() && mesActual === fechaActualSistema.getMonth() && anioActual === fechaActualSistema.getFullYear()) {
        divDia.classList.add("hoy");
      }

      if (fechasEvaluaciones.includes(fechaClave)) {
        divDia.classList.add("tiene-evaluacion");
      }

      contenedorDias.appendChild(divDia);
    }
  }

  const btnPrev = document.getElementById("prev-month");
  const btnNext = document.getElementById("next-month");

  if (btnPrev && btnNext) {
    btnPrev.addEventListener("click", () => {
      mesActual--;
      if (mesActual < 0) { mesActual = 11; anioActual--; }
      renderizarCalendario();
    });
    btnNext.addEventListener("click", () => {
      mesActual++;
      if (mesActual > 11) { mesActual = 0; anioActual++; }
      renderizarCalendario();
    });
  }

  renderizarCalendario();
});