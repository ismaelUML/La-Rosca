import fs from 'node:fs';
import path from 'node:path';

// Descargador de logos oficiales reales de partidos politicos e instituciones argentinas
// desde Wikimedia Commons hacia packages/web-presentation/public/logos/.

const OUT_DIR = path.resolve('packages/web-presentation/public/logos');
fs.mkdirSync(OUT_DIR, { recursive: true });

const LOGO_ASSETS = [
  // Partidos y frentes politicos actuales (2025-2027)
  { out: 'partido-lla.svg', title: 'File:Logo La Libertad Avanza (sin águila).svg' },
  { out: 'partido-lla-emblema.svg', title: 'File:La Libertad Avanza provinciales 2023.svg' },
  { out: 'partido-pro-2026.png', title: 'File:Logo Propuesta Republicana 2026.png' },
  { out: 'partido-pro.svg', title: 'File:Logo PRO Argentina.svg' },
  { out: 'partido-fuerza-patria.svg', title: 'File:Logo de Fuerza Patria.svg' },
  { out: 'partido-fuerza-patria-png.png', title: 'File:Homeland Force logo.png' },
  { out: 'partido-uxp.svg', title: 'File:Logo Union por la Patria (corto).svg' },
  { out: 'partido-pj.svg', title: 'File:Partido Justicialista emblema.svg' },
  { out: 'partido-ucr.svg', title: 'File:Escudo de la UCR.svg' },
  { out: 'partido-ucr-modern.svg', title: 'File:Ucr modern logo.svg' },
  { out: 'partido-provincias-unidas.svg', title: 'File:Logo de "Provincias Unidas".svg' },
  { out: 'partido-hacemos.svg', title: 'File:Logo Hacemos por nuestro pais (corto).svg' },
  { out: 'partido-innovacion-federal.png', title: 'File:Innovación Federal.png' },
  { out: 'partido-fitu.svg', title: 'File:Logo Frente de Izquierda y de Trabajadores-Unidad.svg' },
  { out: 'partido-cc-ari.svg', title: 'File:Coalicion Civica.svg' },

  // Organismos oficiales del Estado Argentino
  { out: 'estado-escudo-nacional.svg', title: 'File:Coat of arms of Argentina.svg' },
  { out: 'estado-presidencia.svg', title: 'File:Casa rosada presidencia logo.svg' },
  { out: 'estado-boletin-oficial.png', title: 'File:Logo Boletín Oficial Argentina.png' },
  { out: 'estado-diputados.svg', title: 'File:Cámara de diputados de Argentina.svg' },
  { out: 'estado-diputados-tv.png', title: 'File:Logo Diputados TV.png' },
  { out: 'estado-senado.svg', title: 'File:Logo del Senado de Argentina.svg' },
  { out: 'estado-senado-inverse.svg', title: 'File:Logo del Senado de Argentina (Inverse).svg' },
  { out: 'estado-bcra.svg', title: 'File:BCRA logo.svg' },
  { out: 'estado-corte-suprema.png', title: 'File:Corte suprema argentina logo.png' }
];

const UA = { 'User-Agent': 'ArgentinaSim2027/1.0 (https://github.com/ismaelUML/La-Rosca)' };

async function run() {
  const titles = LOGO_ASSETS.map((a) => a.title);
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url|size|mime&format=json&titles=' +
    encodeURIComponent(titles.join('|'));

  const metaRes = await fetch(url, { headers: UA });
  const metaJson = await metaRes.json();
  const pages = Object.values(metaJson.query.pages);
  const urlByTitle = new Map();
  for (const p of pages) {
    const rawUrl = p.imageinfo?.[0]?.url;
    if (rawUrl) urlByTitle.set(p.title, rawUrl.split('?')[0]);
  }

  // Also check normalized titles from Wikimedia
  const normalizedMap = new Map();
  for (const n of metaJson.query.normalized ?? []) {
    normalizedMap.set(n.from, n.to);
  }

  for (const item of LOGO_ASSETS) {
    const targetPath = path.join(OUT_DIR, item.out);
    if (fs.existsSync(targetPath) && fs.statSync(targetPath).size > 200) {
      console.log('SKIP (exists):', item.out);
      continue;
    }
    const resolvedTitle = normalizedMap.get(item.title) ?? item.title;
    const downloadUrl = urlByTitle.get(resolvedTitle);
    if (!downloadUrl) {
      console.log('MISSING:', item.title);
      continue;
    }
    const res = await fetch(downloadUrl, { headers: UA });
    if (!res.ok) {
      console.log('HTTP ERROR:', item.out, res.status, downloadUrl);
      await new Promise((r) => setTimeout(r, 1500));
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(targetPath, buf);
    console.log('SAVED:', item.out, `(${buf.length} bytes)`, '<-', downloadUrl);
    await new Promise((r) => setTimeout(r, 1500));
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
