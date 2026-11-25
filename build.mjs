// Genera index.html y las páginas de cada proyecto a partir de contenido/proyectos.mjs.
// Uso: node build.mjs
import { writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { categorias, proyectos } from "./contenido/proyectos.mjs";

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
const plano = (s) => (/^pendiente/i.test(String(s)) ? "" : String(s));

const nombreCategoria = (slug) => categorias.find((c) => c.slug === slug)?.nombre ?? slug;

const SITIO = "https://rodasworks.github.io/";

const head = ({ titulo, descripcion, raiz, ruta = "" }) => `<!doctype html>
<html lang="es-CL">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descripcion)}">
<meta name="color-scheme" content="light">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_CL">
<meta property="og:site_name" content="Rodas Works">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(descripcion)}">
<meta property="og:url" content="${SITIO}${ruta}">
<meta property="og:image" content="${SITIO}og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Logo de Rodas Works junto al titular del portafolio.">
<meta name="twitter:card" content="summary_large_image">
<link rel="preload" href="${raiz}assets/fonts/figtree.woff2" as="font" type="font/woff2" crossorigin>
<link rel="icon" href="${raiz}favicon.png" type="image/png">
<link rel="stylesheet" href="${raiz}assets/css/site.css">
<script src="${raiz}assets/js/site.js" defer></script>
</head>`;

const cabeceraSitio = (raiz) => `<a class="saltar" href="#contenido">Ir al contenido</a>
<header class="sitio">
  <a class="marca" href="${raiz}" aria-label="Rodas Works, inicio">
    <span class="marca-oscura"><img class="marca-rw" src="${raiz}assets/img/rodasworks-rw.png" alt="" width="240" height="107"><img class="marca-nombre" src="${raiz}assets/img/rodasworks-wordmark.png" alt="" width="640" height="92"></span>
    <span class="marca-blanca"><img class="marca-rw" src="${raiz}assets/img/rodasworks-rw-blanco.png" alt="" width="240" height="107"><img class="marca-nombre" src="${raiz}assets/img/rodasworks-wordmark-blanco.png" alt="" width="640" height="92"></span>
  </a>
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

// ---------- Inicio ----------
const conProyectos = categorias
  .map((c) => ({ ...c, lista: proyectos.filter((p) => p.categoria === c.slug) }))
  .filter((c) => c.lista.length);

const saltos = `<nav class="saltos" aria-label="Categorías">
  ${conProyectos.map((c) => `<a href="#${c.slug}">${esc(c.nombre)} <span class="n">${c.lista.length}</span></a>`).join("\n  ")}
</nav>`;

const banda = (c, i) => {
  const tarjetas = c.lista
    .map(
      (p) => `<li>
          <a class="tarjeta ${p.imagenes[0]?.formato ?? "ancha"}${p.categoria === "editorial" ? " libro" : ""}" href="proyectos/${p.slug}/" style="${universo(p)}">
            <span class="tarjeta-anio">${plano(p.anio) ? esc(p.anio) : "&nbsp;"}</span>
            <span class="tarjeta-img" aria-hidden="true"><span>Imagen pendiente</span></span>
            <span class="tarjeta-nombre" style="view-transition-name:t-${p.slug}">${esc(p.nombre)}</span>
            <span class="tarjeta-resumen">${plano(p.resumen) ? esc(p.resumen) : `Cliente: ${esc(plano(p.cliente) || "por completar")}`}</span>
          </a>
        </li>`
    )
    .join("\n        ");
  return `<section class="banda${i === 0 ? " destacada" : ""}" id="${c.slug}" aria-labelledby="b-${c.slug}">
    <div class="banda-texto">
      <h2 id="b-${c.slug}">${esc(c.nombre)}</h2>
      <p class="resumen">${esc(c.descripcion)}</p>
      <p class="conteo" aria-label="${c.lista.length} proyectos">(${c.lista.length})</p>
    </div>
    <div class="serie" role="region" aria-label="Proyectos de ${esc(c.nombre)}" tabindex="0">
      <ul>
        ${tarjetas}
      </ul>
    </div>
    <div class="banda-pie">
      <div class="puntos" role="group" aria-label="Proyectos de ${esc(c.nombre)}: elegir cuál ver" hidden></div>
    </div>
  </section>`;
};

const indice = `${head({
  titulo: "Rodas Works — Patricio Rodas, diseño y marca",
  descripcion:
    "Portafolio de Patricio Rodas (Rodas Works): audiovisual, branding, diseño editorial y proyectos interactivos.",
  raiz: "./",
})}
<body class="inicio">
${cabeceraSitio("./")}
<main id="contenido">
  <div class="portada">
  <section class="intro" aria-labelledby="intro-titulo">
    <h1 id="intro-titulo">Diseño identidades y las llevo a la <span class="junto"><span class="t-palabra t-pantalla especial">pantalla</span>,</span> al <span class="t-palabra t-papel especial">papel</span> y al <span class="junto"><span class="t-palabra t-movimiento especial">movimiento</span>.</span></h1>
    <p class="quien">¡Hola! Soy Patricio Rodas, un diseñador gráfico de Santiago de Chile.</p>
  </section>
  ${saltos}
  </div>

  <section id="proyectos" class="proyectos" aria-label="Proyectos">
  ${conProyectos.map(banda).join("\n  ")}
  </section>

  <section id="sobre-mi" class="sobre" aria-labelledby="sobre-titulo">
    <div class="sobre-lateral">
      <h2 id="sobre-titulo">Sobre mí</h2>
      <figure class="foto-pendiente"><span>Foto pendiente</span></figure>
    </div>
    <div class="sobre-texto">
      <p>Diseñador gráfico de la Universidad Andrés Bello (2018). Desde 2022 llevo los medios digitales de TOP Underwear: campañas, redes sociales, mailing, pauta en Meta y Google, y producción de imagen y video con IA.</p>
      <p>Me interesa que cada punto de contacto de una marca se sienta parte de lo mismo: el logo, el post, el correo y el anuncio. Por eso trabajo entre el diseño, la comunicación y la estrategia.</p>
      <p>Antes, en Terrafirma, también fui Encargado de Medios Digitales: mantenía las gráficas del sitio web y comunicaba los estrenos en redes sociales.</p>
      <p><a class="boton" href="./assets/cv/CV-Patricio-Rodas.pdf" download>Descargar CV (PDF)</a></p>
    </div>
    <dl class="herramientas">
      <div><dt>Diseño</dt><dd>Illustrator, Photoshop, InDesign, After Effects, Blender</dd></div>
      <div><dt>Marketing</dt><dd>Meta Ads, Google Ads, Klaviyo, Shopify</dd></div>
      <div><dt>IA</dt><dd>Higgsfield y Magnific, con modelos como Seedream, Nano Banana y Seedance</dd></div>
    </dl>
  </section>

  <section id="dato-curioso" class="marca-historia" aria-labelledby="logo-titulo">
    <div class="post-it">
    <h2 id="logo-titulo">Dato curioso</h2>
    <div class="marca-historia-cuerpo">
      <img src="./assets/img/rodasworks-logo.png" alt="Logo de Rodas Works: las letras RW en bloques, sobre el nombre Rodas Works." width="720" height="478" loading="lazy">
      <div class="sobre-texto">
        <p class="dato-pregunta">¿Encontraste la P?</p>
        <p>Mi nombre completo es Patricio Hogmin Rodas Weng. Sí, PHRW. El logo dice RW por Rodas Works, pero los cortes del dibujo esconden tres letras: una P, una R y una W.</p>
        <p>Si ya las viste todas, ahora no vas a poder dejar de verlas.</p>
      </div>
    </div>
    </div>
  </section>

  <section id="contacto" class="contacto" aria-labelledby="contacto-titulo">
    <h2 id="contacto-titulo">Contacto</h2>
    <p class="contacto-frase">¿Tienes un proyecto en mente? Escríbeme.</p>
    <ul class="contacto-links">
      <li><a href="mailto:rodas.works@gmail.com">rodas.works@gmail.com</a></li>
      <li><a href="https://www.linkedin.com/in/patecorodas/" rel="me">LinkedIn</a></li>
      <li><a href="https://www.instagram.com/rodas_works/" rel="me">Instagram</a></li>
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
    descripcion: `${p.nombre}. ${plano(p.resumen)}`.trim(),
    raiz,
    ruta: `proyectos/${p.slug}/`,
  })}
<body class="caso" style="${universo(p)}">
${cabeceraSitio(raiz)}
<main id="contenido">
  <header class="caso-cabecera">
    <p class="caso-categoria"><a href="${raiz}#${p.categoria}">${esc(nombreCategoria(p.categoria))}</a></p>
    <h1 style="view-transition-name:t-${p.slug}">${esc(p.nombre)}</h1>
    <p class="caso-resumen">${txt(p.resumen)}</p>
  </header>

  <dl class="ficha">
    <div><dt>Cliente</dt><dd>${txt(p.cliente)}</dd></div>
    <div><dt>Año</dt><dd>${txt(p.anio)}</dd></div>
    <div><dt>Mi rol</dt><dd>${txt(p.rol)}</dd></div>
    <div><dt>Categoría</dt><dd>${esc(nombreCategoria(p.categoria))}</dd></div>
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

  <nav class="siguiente" aria-label="Siguiente proyecto">
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
