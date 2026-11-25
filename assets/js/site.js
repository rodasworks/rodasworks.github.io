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
