import * as THREE from 'three';

// Texturas PBR generadas en Canvas 2D con cache en memoria para dar acabado realista
// a fachadas arquitectonicas, silos corrugados, madera de caoba, pantallas financieras y diarios.

const textureCache = new Map<string, THREE.CanvasTexture>();

function getOrCreateCanvasTexture(
  key: string,
  width: number,
  height: number,
  drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
): THREE.CanvasTexture {
  const existing = textureCache.get(key);
  if (existing) return existing;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    drawFn(ctx, width, height);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  textureCache.set(key, tex);
  return tex;
}

export function getCasaRosadaFacadeTexture(): THREE.CanvasTexture {
  return getOrCreateCanvasTexture('casa_rosada_facade', 256, 128, (ctx, w, h) => {
    ctx.fillStyle = '#c86475';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#e28b9a';
    ctx.fillRect(0, 0, w, 12);
    ctx.fillRect(0, h - 10, w, 10);

    for (let row = 0; row < 3; row += 1) {
      const y = 20 + row * 34;
      for (let col = 0; col < 10; col += 1) {
        const x = 10 + col * 24;
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(x - 2, y - 2, 14, 22);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x, y, 10, 18);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(x + 2, y + 4, 6, 10);
      }
    }
  });
}

export function getTravertineStoneTexture(): THREE.CanvasTexture {
  return getOrCreateCanvasTexture('travertine_stone', 128, 256, (ctx, w, h) => {
    ctx.fillStyle = '#e7e5e4';
    ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 16) {
      ctx.fillStyle = y % 32 === 0 ? '#d6d3d1' : '#f5f5f4';
      ctx.fillRect(0, y, w, 14);
      ctx.fillStyle = '#a8a29e';
      ctx.fillRect(0, y + 14, w, 2);
    }
  });
}

export function getCorrugatedSiloTexture(): THREE.CanvasTexture {
  return getOrCreateCanvasTexture('corrugated_silo', 128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 8) {
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(0, y, w, 3);
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(0, y + 3, w, 2);
    }
  });
}

export function getMahoganyWoodTexture(): THREE.CanvasTexture {
  return getOrCreateCanvasTexture('mahogany_wood', 256, 256, (ctx, w, h) => {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#3b1106');
    grad.addColorStop(0.5, '#521908');
    grad.addColorStop(1, '#2e0c03');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(20, 5, 2, 0.35)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 28; i += 1) {
      ctx.beginPath();
      ctx.moveTo(0, i * 9);
      ctx.bezierCurveTo(w * 0.3, i * 9 + 6, w * 0.7, i * 9 - 6, w, i * 9 + 2);
      ctx.stroke();
    }
  });
}

export function getBloombergTerminalTexture(): THREE.CanvasTexture {
  return getOrCreateCanvasTexture('bloomberg_terminal', 256, 128, (ctx, w, h) => {
    ctx.fillStyle = '#040810';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#b45309';
    ctx.fillRect(0, 0, w, 16);
    ctx.fillStyle = '#fef3c7';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('SIOPEL · BCRA MULC · CCL / EMBI+', 8, 12);

    ctx.strokeStyle = '#1e293b';
    for (let y = 28; y < h; y += 22) {
      ctx.beginPath();
      ctx.moveTo(8, y);
      ctx.lineTo(w - 8, y);
      ctx.stroke();
    }

    const heights = [62, 54, 68, 48, 42, 55, 36, 30, 44, 26, 22, 34];
    for (let i = 0; i < heights.length; i += 1) {
      const x = 14 + i * 19;
      const top = heights[i] ?? 40;
      const isGreen = i % 2 === 1;
      ctx.fillStyle = isGreen ? '#10b981' : '#f43f5e';
      ctx.fillRect(x, top, 11, 28);
      ctx.fillRect(x + 5, top - 8, 2, 44);
    }
  });
}

export function getNewspaperStackTexture(): THREE.CanvasTexture {
  return getOrCreateCanvasTexture('newspaper_stack', 256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#f5f0e1';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(14, 14, w - 28, 28);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 16px serif';
    ctx.fillText('LA ROSCA NACIONAL', 28, 34);

    ctx.fillStyle = '#991b1b';
    ctx.fillRect(14, 48, w - 28, 18);

    ctx.fillStyle = '#334155';
    ctx.fillRect(14, 74, 110, 75);

    for (let y = 76; y < 236; y += 10) {
      const startX = y < 156 ? 132 : 14;
      ctx.fillRect(startX, y, w - startX - 14, 5);
    }
  });
}
