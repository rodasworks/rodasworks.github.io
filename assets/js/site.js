// Rodas Works — filtros por disciplina y botones de las series horizontales.
(() => {
  const bandas = [...document.querySelectorAll(".banda")];
  const menosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)");

  // ---------- Filtros ----------
  const filtros = document.querySelector(".filtros");
  const vacio = document.querySelector(".sin-resultados");

  if (filtros) {
    filtros.hidden = false;
    filtros.addEventListener("click", (e) => {
      const boton = e.target.closest("button[data-filtro]");
      if (!boton) return;
      const filtro = boton.dataset.filtro;
      filtros.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === boton)));
      let visibles = 0;
      bandas.forEach((banda) => {
        const coincide = filtro === "todo" || banda.dataset.disciplinas.split(" ").includes(filtro);
        banda.hidden = !coincide;
        if (coincide) visibles++;
      });
      if (vacio) vacio.hidden = visibles > 0;
    });
  }

  // ---------- Cabecera sobre la portada ----------
  const cabecera = document.querySelector(".inicio .sitio");
  const portada = document.querySelector(".portada");
  if (cabecera && portada) {
    const medir = () => portada.style.setProperty("--alto-header", cabecera.offsetHeight + "px");
    medir();
    new ResizeObserver(medir).observe(cabecera);
    // Apenas se empieza a bajar, la cabecera flotante pasa a su versión blanca.
    const actualizarCabecera = () => {
      cabecera.classList.toggle("sobre-claro", window.scrollY > 8);
    };
    window.addEventListener("scroll", actualizarCabecera, { passive: true });
    actualizarCabecera();
  }

  // ---------- Titular: las tres palabras alternan tipografía en efecto dominó ----------
  const palabras = [...document.querySelectorAll(".t-palabra")];
  if (palabras.length && !menosMovimiento.matches) {
    const PASO = 250; // separación entre una palabra y la siguiente
    const espera = (ms) => new Promise((r) => setTimeout(r, ms));
    let visible = true;
    const intro = document.querySelector(".intro");
    if (intro && "IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(intro);
    }
    const FUNDIDO = 350; // igual a la transición de opacidad en el CSS
    const cambiar = async (p, especial) => {
      p.classList.add("volteando"); // se desvanece
      await espera(FUNDIDO);
      p.classList.toggle("especial", especial);
      p.classList.remove("volteando"); // vuelve a aparecer con la otra tipografía
    };
    const domino = async (especial) => {
      for (const p of palabras) {
        cambiar(p, especial);
        await espera(PASO);
      }
      await espera(FUNDIDO * 2);
    };
    // Reposo en la tipografía original 3 s, dominó a las especiales, 2 s así y dominó de vuelta.
    // (Sin animación, por ejemplo con "reducir movimiento", quedan fijas las especiales.)
    palabras.forEach((p) => p.classList.remove("especial"));
    const ciclo = async () => {
      for (;;) {
        await espera(3000);
        if (!visible || document.hidden) continue;
        await domino(true);
        await espera(2000);
        await domino(false);
      }
    };
    ciclo();
  }

  // ---------- Series ----------
  bandas.forEach((banda) => {
    const serie = banda.querySelector(".serie");
    const botones = banda.querySelector(".serie-botones");
    if (!serie || !botones) return;

    const [anterior, siguiente] = botones.querySelectorAll("button");

    const actualizar = () => {
      const max = serie.scrollWidth - serie.clientWidth;
      botones.hidden = max <= 4;
      anterior.disabled = serie.scrollLeft <= 4;
      siguiente.disabled = serie.scrollLeft >= max - 4;
    };

    botones.addEventListener("click", (e) => {
      const boton = e.target.closest("button[data-dir]");
      if (!boton) return;
      serie.scrollBy({
        left: Number(boton.dataset.dir) * serie.clientWidth * 0.8,
        behavior: menosMovimiento.matches ? "auto" : "smooth",
      });
    });

    serie.addEventListener("scroll", actualizar, { passive: true });
    new ResizeObserver(actualizar).observe(serie);
    actualizar();
  });
})();
