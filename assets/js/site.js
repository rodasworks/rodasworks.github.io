// Rodas Works — interacción del índice: universos de color, filtros y vista lista/grilla.
(() => {
  const indice = document.querySelector(".indice");
  if (!indice) return;

  const body = document.body;
  const proyectos = [...indice.querySelectorAll(".proyecto")];
  const conPuntero = window.matchMedia("(hover: hover) and (pointer: fine)");

  // ---------- Universos ----------
  let activo = null;
  let salida = null;

  const entrar = (li) => {
    clearTimeout(salida);
    if (activo === li) return;
    if (activo) activo.classList.remove("activo");
    activo = li;
    li.classList.add("activo");
    const estilo = getComputedStyle(li);
    body.style.setProperty("--u-fondo", estilo.getPropertyValue("--fondo").trim());
    body.style.setProperty("--u-tinta", estilo.getPropertyValue("--tinta").trim());
    body.classList.add("en-universo");
  };

  const salir = () => {
    clearTimeout(salida);
    // Pequeña espera para que pasar de una fila a otra no parpadee.
    salida = setTimeout(() => {
      if (activo) activo.classList.remove("activo");
      activo = null;
      body.style.removeProperty("--u-fondo");
      body.style.removeProperty("--u-tinta");
      body.classList.remove("en-universo");
    }, 120);
  };

  proyectos.forEach((li) => {
    const a = li.querySelector("a");
    a.addEventListener("pointerenter", () => {
      if (conPuntero.matches) entrar(li);
    });
    a.addEventListener("pointerleave", () => {
      if (conPuntero.matches) salir();
    });
    a.addEventListener("focus", () => entrar(li));
    a.addEventListener("blur", salir);
  });

  // En celulares (sin puntero): el proyecto que pasa por el centro de la pantalla tiñe la página.
  const menosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!conPuntero.matches && !menosMovimiento.matches && "IntersectionObserver" in window) {
    const enCentro = new Set();
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => (e.isIntersecting ? enCentro.add(e.target) : enCentro.delete(e.target)));
        const visible = [...enCentro].find((li) => !li.hidden);
        if (visible) entrar(visible);
        else salir();
      },
      { rootMargin: "-46% 0px -46% 0px" }
    );
    proyectos.forEach((li) => observador.observe(li));
  }

  // Al volver con el botón "atrás", partir siempre desde el paraguas neutro.
  window.addEventListener("pageshow", () => {
    activo = null;
    proyectos.forEach((li) => li.classList.remove("activo"));
    body.style.removeProperty("--u-fondo");
    body.style.removeProperty("--u-tinta");
    body.classList.remove("en-universo");
  });

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
      proyectos.forEach((li) => {
        const coincide = filtro === "todo" || li.dataset.disciplinas.split(" ").includes(filtro);
        li.hidden = !coincide;
        if (coincide) visibles++;
      });
      if (vacio) vacio.hidden = visibles > 0;
    });
  }

  // ---------- Lista / grilla ----------
  const selector = document.querySelector(".vista-selector");
  const aplicarVista = (vista) => {
    indice.dataset.vista = vista;
    selector?.querySelectorAll("button").forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.vista === vista))
    );
  };

  if (selector) {
    selector.hidden = false;
    try {
      const guardada = localStorage.getItem("rw-vista");
      if (guardada === "lista" || guardada === "grilla") aplicarVista(guardada);
    } catch (_) {}
    selector.addEventListener("click", (e) => {
      const boton = e.target.closest("button[data-vista]");
      if (!boton) return;
      const cambiar = () => aplicarVista(boton.dataset.vista);
      // Transición suave entre vistas donde el navegador lo permite.
      if (document.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        document.startViewTransition(cambiar);
      } else {
        cambiar();
      }
      try {
        localStorage.setItem("rw-vista", boton.dataset.vista);
      } catch (_) {}
    });
  }
})();
