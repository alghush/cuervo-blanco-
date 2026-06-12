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
  manana:    { cafe: "ti-coffee", ejecutivo: "ti-bowl-spoon", carta: "ti-tools-kitchen-2", bebidas: "ti-glass-full" },
  ejecutivo: { cafe: "ti-coffee", ejecutivo: "ti-bowl-spoon", carta: "ti-tools-kitchen-2", bebidas: "ti-glass-full" },
  carta:     { cafe: "ti-coffee", ejecutivo: "ti-bowl-spoon", carta: "ti-tools-kitchen-2", bebidas: "ti-glass-full" },
  tarde:     { cafe: "ti-coffee", ejecutivo: "ti-bowl-spoon", carta: "ti-tools-kitchen-2", bebidas: "ti-glass-full" },
  cena:      { cafe: "ti-moon",   ejecutivo: "ti-bowl-spoon", carta: "ti-notebook",        bebidas: "ti-martini"    },
};

// ── PALETA DE COLORES POR TURNO ──────────────
const PALETAS = {
  manana: {
    '--color-principal': '#0d1a0a',
    '--color-traslucer': '#1e2e1a86',
    '--color-primary':   '#22391789',
    '--color-secundary': '#8aab7a',
    '--color-hover':     '#4a6741',
  },
  tarde: {
    '--color-principal': '#0d1a0a',
    '--color-traslucer': '#1e2e1a86',
    '--color-primary':   '#22391789',
    '--color-secundary': '#8aab7a',
    '--color-hover':     '#4a6741',
  },
  ejecutivo: {
    '--color-principal': '#050000',
    '--color-traslucer': '#2e2d2d86',
    '--color-primary':   '#22391789',
    '--color-secundary': '#a5a5a5',
    '--color-hover':     'rgb(193, 199, 199)',
  },
  carta: {
    '--color-principal': '#050000',
    '--color-traslucer': '#2e2d2d86',
    '--color-primary':   '#22391789',
    '--color-secundary': '#a5a5a5',
    '--color-hover':     'rgb(138, 136, 136)',
  },
  cena: {
    '--color-principal': '#050000',
    '--color-traslucer': '#2e2d2d86',
    '--color-primary':   '#22391789',
    '--color-secundary': '#a5a5a5',
    '--color-hover':     'rgb(139, 137, 137)',
  },
};

// ── SCROLL AUTOMÁTICO POR TURNO ──────────────
const MAPA_SECCIONES = {
  manana:    "cafe-section",
  ejecutivo: "ejecutivo-section",
  carta:     "almuerzo-section",
  tarde:     "cafe-section",
  cena:      "almuerzo-section",
};

// ── HELPER: fecha como string "YYYY-MM-DD" ──
function fechaStr(d) {
  return d.toISOString().slice(0, 10);
}

// ── HELPER: hora como número decimal ────────
function horaDecimal(d) {
  return d.getHours() + d.getMinutes() / 60;
}

// ── DETECTAR TURNO ACTUAL ────────────────────
function getTurno() {
  const ahora       = new Date();
  const hora        = horaDecimal(ahora);
  const diaSemana   = ahora.getDay();
  const esFeriado   = FERIADOS.includes(fechaStr(ahora));
  const esFinDeSemana = diaSemana === 0 || diaSemana === 5 || diaSemana === 6;

  if (hora >= 6  && hora < 12) return "manana";
  if (hora >= 12 && hora < 16) return (esFinDeSemana || esFeriado) ? "carta" : "ejecutivo";
  if (hora >= 16 && hora < 20) return "tarde";
  return "cena";
}

// ── ACORDEONES: cerrar al abrir otro ────────
document.addEventListener("DOMContentLoaded", () => {
  const toggles = document.querySelectorAll(".checkbox__submenu");
  toggles.forEach(toggle => {
    toggle.addEventListener("change", () => {
      if (toggle.checked) {
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

  // 1. Videos
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
    videoActivo.play().catch(() => {});
  }

  // 2. Logos splash
  const divPrincipal = document.getElementById("logo-principal")?.closest(".splash__logo");
  const divCafe      = document.getElementById("logo-cafe")?.closest(".splash__logo");
  if (divPrincipal) divPrincipal.style.display = assets.mostrarPrincipal ? "block" : "none";
  if (divCafe)      divCafe.style.display      = assets.mostrarPrincipal ? "none"  : "block";

  // 3. Logos nav
  const logoNavPrincipal = document.getElementById("logo-nav-principal");
  const logoNavCafe      = document.getElementById("logo-nav-cafe");
  if (logoNavPrincipal) logoNavPrincipal.style.display = assets.mostrarPrincipal ? "block" : "none";
  if (logoNavCafe)      logoNavCafe.style.display      = assets.mostrarPrincipal ? "none"  : "block";

  // 4. Íconos del acordeón
  const items = document.querySelectorAll(".splash__acordeon-item");
  const claves = ["cafe", "ejecutivo", "carta", "bebidas"];
  items.forEach((item, i) => {
    const icono = item.querySelector("i");
    if (!icono || !claves[i]) return;
    icono.className = icono.className.replace(/ti-[^\s]+/, iconos[claves[i]]);
  });

  // 5. Highlight ítem activo
  items.forEach(item => item.classList.remove("activo", "proxima"));
  const mapaItem = { manana: 0, ejecutivo: 1, carta: 2, tarde: 0, cena: 2 };
  if (items[mapaItem[turno]]) items[mapaItem[turno]].classList.add("activo");
  if (turno === "manana" && items[1]) items[1].classList.add("proxima");

  // 6. Paleta de colores
  const paleta = PALETAS[turno];
  Object.entries(paleta).forEach(([variable, valor]) => {
    document.documentElement.style.setProperty(variable, valor);
  });

  // 7. Scroll automático a la sección
  const seccionId = MAPA_SECCIONES[turno];
  const seccion   = document.getElementById(seccionId);
  if (seccion) seccion.scrollIntoView({ behavior: "smooth" });

  // Log
  console.log(`[Cuervo Blanco] Turno activo: ${turno} | ${new Date().toLocaleTimeString("es-AR")}`);
}

// ── INIT ─────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  aplicarTurno();
  setInterval(aplicarTurno, 60 * 1000);
});