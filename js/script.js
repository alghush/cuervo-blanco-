// ============================================
//  CUERVO BLANCO — Lógica horaria
// ============================================

// ── FERIADOS 2025 / 2026 Argentina ──────────
const FERIADOS = [
  // 2025
  "2025-01-01", "2025-03-03", "2025-03-04", "2025-03-24",
  "2025-04-02", "2025-04-17", "2025-04-18", "2025-05-01",
  "2025-05-25", "2025-06-16", "2025-06-20", "2025-07-09",
  "2025-08-17", "2025-10-12", "2025-11-20", "2025-12-08",
  "2025-12-25",
  // 2026
  "2026-01-01", "2026-02-16", "2026-02-17", "2026-03-24",
  "2026-04-02", "2026-04-03", "2026-04-06", "2026-05-01",
  "2026-05-25", "2026-06-15", "2026-06-20", "2026-07-09",
  "2026-08-17", "2026-10-12", "2026-11-20", "2026-12-08",
  "2026-12-25"
];

// ── CONFIGURACIÓN POR TURNO ──────────────────

const ASSETS = {
  manana:    { mostrarPrincipal: false, video: "video-cafe"     }, // 06:00 – 11:59
  ejecutivo: { mostrarPrincipal: true,  video: "video-mediodia" }, // 12:00 – 15:59 L-J
  carta:     { mostrarPrincipal: true,  video: "video-mediodia" }, // 12:00 – 15:59 V-S-D-feriados
  tarde:     { mostrarPrincipal: false, video: "video-cafe"     }, // 16:00 – 19:59
  cena:      { mostrarPrincipal: true,  video: "video-cena"     }, // 20:00+
};

// ── ÍCONOS DEL ACORDEÓN POR TURNO ───────────
const ICONOS = {
  manana:    { cafe: "ti-coffee",          ejecutivo: "ti-bowl-spoon",  carta: "ti-tools-kitchen-2", bebidas: "ti-glass-full" },
  ejecutivo: { cafe: "ti-coffee",          ejecutivo: "ti-bowl-spoon",  carta: "ti-tools-kitchen-2", bebidas: "ti-glass-full" },
  carta:     { cafe: "ti-coffee",          ejecutivo: "ti-bowl-spoon",  carta: "ti-tools-kitchen-2", bebidas: "ti-glass-full" },
  tarde:     { cafe: "ti-coffee",          ejecutivo: "ti-bowl-spoon",  carta: "ti-tools-kitchen-2", bebidas: "ti-glass-full" },
  cena:      { cafe: "ti-moon",            ejecutivo: "ti-bowl-spoon",  carta: "ti-notebook",        bebidas: "ti-martini"    },
};

// ── HELPER: fecha como string "YYYY-MM-DD" ──
function fechaStr(d) {
  return d.toISOString().slice(0, 10);
}

// ── HELPER: hora como número decimal ────────
// Ej: 11:45 → 11.75
function horaDecimal(d) {
  return d.getHours() + d.getMinutes() / 60;
}

// ── DETECTAR TURNO ACTUAL ────────────────────
function getTurno() {
  const ahora    = new Date();
  const hora     = horaDecimal(ahora);
  const diaSemana = ahora.getDay(); // 0=Dom, 1=Lun … 6=Sab
  const esFeriado = FERIADOS.includes(fechaStr(ahora));
  const esFinDeSemana = diaSemana === 0 || diaSemana === 5 || diaSemana === 6; // Dom/Vie/Sab

  // Mañana: 06:00 – 11:59
  if (hora >= 6 && hora < 12) {
    return "manana";
  }

  // Almuerzo: 12:00 – 15:59
  if (hora >= 12 && hora < 16) {
    // Viernes, Sábado, Domingo o Feriado → Carta principal
    if (esFinDeSemana || esFeriado) return "carta";
    // Lunes a Jueves → Menú Ejecutivo
    return "ejecutivo";
  }

  // Tarde: 16:00 – 19:59
  if (hora >= 16 && hora < 20) {
    return "tarde";
  }

  // Noche: 20:00 – cierre (y madrugada hasta las 6)
  return "cena";
}

// ── ACORDEONES: abrir y cerrar 
document.addEventListener("DOMContentLoaded", () => {
  const toggles = document.querySelectorAll(".checkbox__submenu");
  
  toggles.forEach(toggle => {
    toggle.addEventListener("change", () => {
      if (toggle.checked) {
        // Cerrar todos los otros
        toggles.forEach(otro => {
          if (otro !== toggle) otro.checked = false;
        });
      }
    });
  });
});

// ── APLICAR TURNO ────────────────────────────
function aplicarTurno() {
  const turno  = getTurno();
  const assets = ASSETS[turno];
  const iconos = ICONOS[turno];

  // 1. Videos: ocultar todos, mostrar el del turno
  const todosLosVideos = ["video-cafe", "video-mediodia", "video-cena"];
  todosLosVideos.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove("activo");
    el.pause();
  });
  const videoActivo = document.getElementById(assets.video);
  if (videoActivo) {
    videoActivo.classList.add("activo");
    videoActivo.play().catch(() => {}); // silencia error de autoplay en algunos navegadores
  }

  // 2. Logos — mostrar/ocultar el div contenedor
  const divPrincipal = document.getElementById("logo-principal")?.closest(".splash__logo");
  const divCafe      = document.getElementById("logo-cafe")?.closest(".splash__logo");
  if (divPrincipal) divPrincipal.style.display = assets.mostrarPrincipal ? "block" : "none";
  if (divCafe)      divCafe.style.display      = assets.mostrarPrincipal ? "none"  : "block";

  // 3. Íconos del acordeón
  const items = document.querySelectorAll(".splash__acordeon-item");
  // Orden en el HTML: cafe, ejecutivo, carta, bebidas
  const claves = ["cafe", "ejecutivo", "carta", "bebidas"];
  items.forEach((item, i) => {
    const icono = item.querySelector("i");
    if (!icono || !claves[i]) return;
    // Quitamos todas las clases ti-* y ponemos la nueva
    icono.className = icono.className.replace(/ti-[^\s]+/, iconos[claves[i]]);
  });

// 4. Highlight del ítem activo en el acordeón
items.forEach(item => item.classList.remove("activo"));
const mapaItem = {
    manana:    0,
    ejecutivo: 1,
    carta:     2,
    tarde:     0,
    cena:      2,
};
if (items[mapaItem[turno]]) {
    items[mapaItem[turno]].classList.add("activo");
}

  // 5. Log en consola (útil para desarrollo)
  console.log(`[Cuervo Blanco] Turno activo: ${turno} | ${new Date().toLocaleTimeString("es-AR")}`);
}

// ── INIT ─────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  aplicarTurno();

  // Re-evaluar cada minuto por si cambia el turno mientras la página está abierta
  setInterval(aplicarTurno, 60 * 1000);
});