/** Geometry for the crop & rotate photo editor, kept pure so it can be tested. */
export type Rotation = 0 | 90 | 180 | 270;
export interface Pan { x: number; y: number }

export function rotate(r: Rotation, dir: 1 | -1): Rotation {
  return (((r + dir * 90) % 360) + 360) % 360 as Rotation;
}

/** Size of the image once rotated: 90° and 270° swap width and height. */
export function rotatedSize(w: number, h: number, r: Rotation) {
  return r % 180 ? { w: h, h: w } : { w, h };
}

/** Smallest scale at which the rotated image fully covers the frame (no empty edges). */
export function coverScale(imgW: number, imgH: number, frameW: number, frameH: number, r: Rotation) {
  const s = rotatedSize(imgW, imgH, r);
  return Math.max(frameW / s.w, frameH / s.h);
}

/** Keeps the dragged photo covering the frame at the current zoom. */
export function clampPan(pan: Pan, imgW: number, imgH: number, frameW: number, frameH: number, r: Rotation, zoom: number): Pan {
  const s = rotatedSize(imgW, imgH, r);
  const scale = coverScale(imgW, imgH, frameW, frameH, r) * zoom;
  const maxX = Math.max(0, (s.w * scale - frameW) / 2);
  const maxY = Math.max(0, (s.h * scale - frameH) / 2);
  const clamp = (v: number, m: number) => Math.min(m, Math.max(-m, v));
  return { x: clamp(pan.x, maxX), y: clamp(pan.y, maxY) };
}
