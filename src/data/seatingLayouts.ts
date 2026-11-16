// Distribuciones de asientos y geometría del plano de mesas.
// Todas las medidas están en metros.

export const ROOM_WIDTH = 20;
export const ROOM_HEIGHT = 10;

const SEAT_SPACING = 0.6;
const TABLE_DEPTH = 0.9;
const SEAT_OFFSET = 0.32;
export const SEAT_RADIUS = 0.24;

export interface TableLayout {
  id: string;
  capacity: number;
  label: string;
  top: number;
  right: number;
  bottom: number;
  left: number;
  square?: boolean;
}

export const TABLE_CAPACITIES = [4, 6, 8, 10, 12] as const;

export const TABLE_LAYOUTS: TableLayout[] = [
  { id: 'l4-square', capacity: 4, label: 'Cuadrada · 1 por lado', top: 1, right: 1, bottom: 1, left: 1, square: true },
  { id: 'l4-2x2', capacity: 4, label: 'Rectangular · 2 + 2', top: 2, right: 0, bottom: 2, left: 0 },

  { id: 'l6-square', capacity: 6, label: 'Cuadrada · 2 + 1 + 2 + 1', top: 2, right: 1, bottom: 2, left: 1, square: true },
  { id: 'l6-3x3', capacity: 6, label: 'Rectangular · 3 + 3', top: 3, right: 0, bottom: 3, left: 0 },
  { id: 'l6-heads', capacity: 6, label: 'Rectangular · 2 + 2 + cabeceras', top: 2, right: 1, bottom: 2, left: 1 },

  { id: 'l8-square', capacity: 8, label: 'Cuadrada · 2 por lado', top: 2, right: 2, bottom: 2, left: 2, square: true },
  { id: 'l8-4x4', capacity: 8, label: 'Rectangular · 4 + 4', top: 4, right: 0, bottom: 4, left: 0 },
  { id: 'l8-heads', capacity: 8, label: 'Rectangular · 3 + 3 + cabeceras', top: 3, right: 1, bottom: 3, left: 1 },

  { id: 'l10-square', capacity: 10, label: 'Cuadrada · 3 + 2 + 3 + 2', top: 3, right: 2, bottom: 3, left: 2, square: true },
  { id: 'l10-5x5', capacity: 10, label: 'Rectangular · 5 + 5', top: 5, right: 0, bottom: 5, left: 0 },
  { id: 'l10-heads', capacity: 10, label: 'Rectangular · 4 + 4 + cabeceras', top: 4, right: 1, bottom: 4, left: 1 },

  { id: 'l12-square', capacity: 12, label: 'Cuadrada · 3 por lado', top: 3, right: 3, bottom: 3, left: 3, square: true },
  { id: 'l12-6x6', capacity: 12, label: 'Rectangular · 6 + 6', top: 6, right: 0, bottom: 6, left: 0 },
  { id: 'l12-heads', capacity: 12, label: 'Rectangular · 5 + 5 + cabeceras', top: 5, right: 1, bottom: 5, left: 1 },
];

export const getLayout = (id: string): TableLayout =>
  TABLE_LAYOUTS.find((l) => l.id === id) ?? TABLE_LAYOUTS[0];

export interface SeatPosition {
  x: number;
  y: number;
}

export interface TableGeometry {
  width: number;
  height: number;
  seats: SeatPosition[]; // relativas al centro de la mesa
}

const sideLength = (count: number) => (count >= 2 ? count * SEAT_SPACING + 0.3 : TABLE_DEPTH);

/** Geometría de una mesa. Los asientos se numeran en sentido horario
 * empezando arriba a la izquierda, así asientos consecutivos quedan juntos. */
export const getTableGeometry = (layout: TableLayout, rotation: number): TableGeometry => {
  let w = sideLength(Math.max(layout.top, layout.bottom));
  let h = sideLength(Math.max(layout.left, layout.right));
  if (layout.square) {
    const s = Math.max(w, h);
    w = s;
    h = s;
  }

  const seats: SeatPosition[] = [];
  const along = (n: number, length: number) =>
    Array.from({ length: n }, (_, i) => -length / 2 + ((i + 0.5) * length) / n);

  along(layout.top, w).forEach((x) => seats.push({ x, y: -h / 2 - SEAT_OFFSET }));
  along(layout.right, h).forEach((y) => seats.push({ x: w / 2 + SEAT_OFFSET, y }));
  along(layout.bottom, w)
    .reverse()
    .forEach((x) => seats.push({ x, y: h / 2 + SEAT_OFFSET }));
  along(layout.left, h)
    .reverse()
    .forEach((y) => seats.push({ x: -w / 2 - SEAT_OFFSET, y }));

  if (rotation === 90) {
    return {
      width: h,
      height: w,
      seats: seats.map(({ x, y }) => ({ x: -y, y: x })),
    };
  }
  return { width: w, height: h, seats };
};

export interface FixtureType {
  id: string;
  label: string;
  width: number;
  height: number;
  fill: string;
}

export const FIXTURE_TYPES: FixtureType[] = [
  { id: 'novios', label: 'Mesa de novios', width: 3, height: 0.9, fill: '#F3E5AB' },
  { id: 'pista', label: 'Pista de baile', width: 5, height: 4, fill: '#E8DFCF' },
  { id: 'dj', label: 'DJ / Música', width: 2, height: 1, fill: '#D9D4C3' },
  { id: 'barra', label: 'Barra', width: 3, height: 0.8, fill: '#D9D4C3' },
  { id: 'entrada', label: 'Entrada', width: 2, height: 0.3, fill: '#C9D8CC' },
];

export const getFixtureType = (id: string): FixtureType =>
  FIXTURE_TYPES.find((f) => f.id === id) ?? FIXTURE_TYPES[0];
