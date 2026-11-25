// Genera index.html y las páginas de cada proyecto a partir de contenido/proyectos.mjs.
// Uso: node build.mjs
import { writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { disciplinas, proyectos } from "./contenido/proyectos.mjs";

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Un texto que empieza con "pendiente" se marca visualmente para completarlo después.
const txt = (s) => {
  const v = String(s ?? "");
  if (/^pendiente/i.test(v)) {
    const resto = v.replace(/^pendiente:?\s*/i, "");
    return `<span class="pendiente">${resto ? "Por completar: " + esc(resto) : "Por completar"}</span>`;
  }
  return esc(v);
};

const slugDisc = (d) =>
  d.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-");

const head = ({ titulo, descripcion, raiz, extraStyle = "" }) => `<!doctype html>
<html lang="es-CL">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descripcion)}">
<meta name="color-scheme" content="light">
<link rel="stylesheet" href="${raiz}assets/css/site.css">
${extraStyle}
<script src="${raiz}assets/js/site.js" defer></script>
</head>`;

const cabeceraSitio = (raiz, actual) => `<a class="saltar" href="#contenido">Ir al contenido</a>
<header class="sitio">
  <a class="marca" href="${raiz}" ${actual === "inicio" ? 'aria-current="page"' : ""}>Rodas Works</a>
  <nav aria-label="Principal">
    <a href="${raiz}#proyectos">Proyectos</a>
    <a href="${raiz}#sobre-mi">Sobre mí</a>
    <a href="${raiz}#contacto">Contacto</a>
  </nav>
</header>`;

const pie = `<footer class="pie">
  <p>Rodas Works, Santiago de Chile. ${new Date().getFullYear()}.</p>
</footer>`;

const universo = (p) => `--fondo:${p.fondo};--tinta:${p.tinta}`;

// ---------- Índice ----------
const conteo = Object.fromEntries(
  disciplinas.map((d) => [d, proyectos.filter((p) => p.disciplinas.includes(d)).length])
);

const filtros = `<div class="filtros" role="group" aria-label="Filtrar proyectos por disciplina" hidden>
  <button type="button" data-filtro="todo" aria-pressed="true">Todo <span class="n">${proyectos.length}</span></button>
  ${disciplinas
    .filter((d) => conteo[d] > 0)
    .map(
      (d) =>
        `<button type="button" data-filtro="${slugDisc(d)}" aria-pressed="false">${esc(d)} <span class="n">${conteo[d]}</span></button>`
    )
    .join("\n  ")}
</div>`;

const bandas = proyectos
  .map((p, i) => {
    const piezas = p.imagenes
      .map(
        (img) => `<li><figure class="pieza ${img.formato}">
          <div class="pieza-img"><span>Imagen pendiente</span></div>
          <figcaption>${esc(img.texto)}</figcaption>
        </figure></li>`
      )
      .join("\n        ");
    return `<section class="banda${i === 0 ? " destacada" : ""}" data-disciplinas="${p.disciplinas.map(slugDisc).join(" ")}" style="${universo(p)}" aria-labelledby="b-${p.slug}">
    <div class="banda-texto">
      <h3 id="b-${p.slug}"><a href="proyectos/${p.slug}/" style="view-transition-name:t-${p.slug}">${esc(p.nombre)}</a></h3>
      <p class="resumen">${esc(p.resumen)}</p>
      <p class="conteo" aria-label="${p.imagenes.length} piezas">(${p.imagenes.length})</p>
    </div>
    <div class="serie" role="region" aria-label="Piezas de ${esc(p.nombre)}" tabindex="0">
      <ul>
        ${piezas}
      </ul>
    </div>
    <div class="banda-pie">
      <ul class="etiquetas" aria-label="Disciplinas">${p.disciplinas.map((d) => `<li>${esc(d)}</li>`).join("")}<li class="anio">${txt(p.anio)}</li></ul>
      <div class="serie-botones" hidden>
        <button type="button" data-dir="-1">Anterior</button>
        <button type="button" data-dir="1">Siguiente</button>
      </div>
      <a class="ver" href="proyectos/${p.slug}/">Ver proyecto</a>
    </div>
  </section>`;
  })
  .join("\n  ");

const indice = `${head({
  titulo: "Rodas Works — Patricio Rodas, diseño y marca",
  descripcion:
    "Portafolio de Patricio Rodas (Rodas Works): identidad de marca, campañas, diseño editorial, animación, contenido con IA y proyectos interactivos.",
  raiz: "./",
})}
<body class="inicio">
${cabeceraSitio("./", "inicio")}
<main id="contenido">
  <section class="intro" aria-labelledby="intro-titulo">
    <h1 id="intro-titulo">Diseño de marca, campañas, libros, animación y contenido con IA.</h1>
    <p class="quien">Soy Patricio Rodas, diseñador gráfico en Santiago de Chile. Construyo marcas completas: desde el logo hasta el último anuncio.</p>
  </section>

  <section id="proyectos" class="proyectos" aria-labelledby="proyectos-titulo">
    <div class="proyectos-barra">
      <h2 id="proyectos-titulo">Proyectos</h2>
      ${filtros}
    </div>
  ${bandas}
    <p class="sin-resultados" hidden>No hay proyectos en esta disciplina todavía.</p>
  </section>

  <section id="sobre-mi" class="sobre" aria-labelledby="sobre-titulo">
    <h2 id="sobre-titulo">Sobre mí</h2>
    <div class="sobre-texto">
      <p>Diseñador gráfico de la Universidad Andrés Bello (2018). Desde 2022 llevo los medios digitales de TOP Underwear: campañas, redes sociales, mailing, pauta en Meta y Google, y producción de imagen y video con IA.</p>
      <p>Me interesa que cada punto de contacto de una marca se sienta parte de lo mismo: el logo, el post, el correo y el anuncio. Por eso trabajo entre el diseño, la comunicación y la estrategia.</p>
      <p><span class="pendiente">Por completar: experiencia anterior (Terrafirma) y trabajos freelance.</span></p>
    </div>
    <dl class="herramientas">
      <div><dt>Diseño</dt><dd><span class="pendiente">Por completar</span></dd></div>
      <div><dt>Marketing</dt><dd>Meta Ads, Google Ads, Klaviyo, Shopify</dd></div>
      <div><dt>IA</dt><dd>Seedream, Nano Banana, Veo, Higgsfield</dd></div>
    </dl>
  </section>

  <section id="contacto" class="contacto" aria-labelledby="contacto-titulo">
    <h2 id="contacto-titulo">Contacto</h2>
    <p class="contacto-frase">¿Tienes un proyecto en mente? Escríbeme.</p>
    <ul class="contacto-links">
      <li><a href="https://www.instagram.com/rodas_works/" rel="me">Instagram</a></li>
      <li><span class="pendiente">Por completar: correo</span></li>
      <li><span class="pendiente">Por completar: LinkedIn</span></li>
      <li><span class="pendiente">Por completar: WhatsApp (solo mensajes)</span></li>
    </ul>
  </section>
</main>
${pie}
</body>
</html>
`;

// ---------- Páginas de proyecto ----------
const pagina = (p, i) => {
  const sig = proyectos[(i + 1) % proyectos.length];
  const raiz = "../../";
  const galeria = p.imagenes
    .map(
      (img) => `<figure class="placeholder ${img.formato}">
        <span>Imagen pendiente: ${esc(img.texto)}</span>
      </figure>`
    )
    .join("\n      ");
  const numeros = p.numeros.length
    ? `<section class="bloque numeros" aria-labelledby="n-titulo">
      <h2 id="n-titulo">En números</h2>
      <ul>
        ${p.numeros
          .map((n) => `<li><span class="cifra">${txt(n.cifra)}</span> <span class="cifra-texto">${esc(n.texto)}</span></li>`)
          .join("\n        ")}
      </ul>
    </section>`
    : "";
  return `${head({
    titulo: `${p.nombre} — Rodas Works`,
    descripcion: `${p.nombre}: ${p.resumen}`,
    raiz,
  })}
<body class="caso" style="${universo(p)}">
${cabeceraSitio(raiz, "caso")}
<main id="contenido">
  <header class="caso-cabecera">
    <h1 style="view-transition-name:t-${p.slug}">${esc(p.nombre)}</h1>
    <p class="caso-resumen">${esc(p.resumen)}</p>
  </header>

  <dl class="ficha">
    <div><dt>Cliente</dt><dd>${txt(p.cliente)}</dd></div>
    <div><dt>Año</dt><dd>${txt(p.anio)}</dd></div>
    <div><dt>Mi rol</dt><dd>${txt(p.rol)}</dd></div>
    <div><dt>Disciplinas</dt><dd>${p.disciplinas.map(esc).join(", ")}</dd></div>
  </dl>

  <div class="caso-cuerpo">
    <section class="bloque" aria-labelledby="e-titulo">
      <h2 id="e-titulo">El encargo</h2>
      <p>${txt(p.encargo)}</p>
    </section>
    <section class="bloque" aria-labelledby="h-titulo">
      <h2 id="h-titulo">Qué hice</h2>
      <ul>
        ${p.hice.map((h) => `<li>${txt(h)}</li>`).join("\n        ")}
      </ul>
    </section>
    ${numeros}
  </div>

  <section class="galeria" aria-label="Imágenes del proyecto">
      ${galeria}
  </section>

  <nav class="siguiente" aria-label="Siguiente proyecto" style="${universo(sig)}">
    <a href="../${sig.slug}/">
      <span class="siguiente-label">Siguiente proyecto</span>
      <span class="siguiente-nombre">${esc(sig.nombre)}</span>
    </a>
  </nav>
</main>
${pie}
</body>
</html>
`;
};

writeFileSync("index.html", indice);
if (existsSync("proyectos")) rmSync("proyectos", { recursive: true });
proyectos.forEach((p, i) => {
  mkdirSync(`proyectos/${p.slug}`, { recursive: true });
  writeFileSync(`proyectos/${p.slug}/index.html`, pagina(p, i));
});
console.log(`Listo: index.html y ${proyectos.length} páginas de proyecto.`);
