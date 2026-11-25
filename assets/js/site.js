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
    // Da 4 vueltas y se detiene para siempre en las tipografías especiales.
    const VUELTAS = 4;
    const ciclo = async () => {
      let vueltas = 0;
      while (vueltas < VUELTAS) {
        await espera(3000);
        if (!visible || document.hidden) continue;
        await domino(true);
        vueltas++;
        if (vueltas === VUELTAS) break;
        await espera(2000);
        await domino(false);
      }
    };
    ciclo();
  }

  // ---------- Series: puntitos que muestran qué proyecto se está viendo ----------
  bandas.forEach((banda) => {
    const serie = banda.querySelector(".serie");
    const puntos = banda.querySelector(".puntos");
    if (!serie || !puntos) return;
    const items = [...serie.querySelectorAll("li")];

    const botones = items.map((li, i) => {
      const b = document.createElement("button");
      b.type = "button";
      const nombre = li.querySelector(".tarjeta-nombre")?.textContent ?? `Proyecto ${i + 1}`;
      b.setAttribute("aria-label", `Ver ${nombre}`);
      b.addEventListener("click", () => {
        serie.scrollTo({
          left: li.offsetLeft - items[0].offsetLeft,
          behavior: menosMovimiento.matches ? "auto" : "smooth",
        });
      });
      puntos.appendChild(b);
      return b;
    });

    const actualizar = () => {
      const max = serie.scrollWidth - serie.clientWidth;
      puntos.hidden = max <= 4;
      // El activo es el proyecto más cercano al borde izquierdo; al llegar al final, el último.
      let activo = 0;
      if (serie.scrollLeft >= max - 4) activo = items.length - 1;
      else {
        let menor = Infinity;
        items.forEach((li, i) => {
          const d = Math.abs(li.offsetLeft - items[0].offsetLeft - serie.scrollLeft);
          if (d < menor) (menor = d), (activo = i);
        });
      }
      botones.forEach((b, i) => b.setAttribute("aria-current", String(i === activo)));
      serie.classList.toggle("hay-antes", serie.scrollLeft > 4);
      serie.classList.toggle("hay-despues", serie.scrollLeft < max - 4);
    };

    serie.addEventListener("scroll", actualizar, { passive: true });
    new ResizeObserver(actualizar).observe(serie);
    actualizar();
  });
})();
