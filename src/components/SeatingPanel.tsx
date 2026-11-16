import React, { useEffect, useMemo, useRef, useState } from 'react';
import { onValue, push, ref, update } from 'firebase/database';
import {
  AlertTriangle,
  Armchair,
  CheckCircle,
  Clock,
  Minus,
  Plus,
  RotateCw,
  Search,
  Trash2,
  UserMinus,
  Users,
  X,
} from 'lucide-react';
import { realtimeDb } from '../lib/firebase';
import { useGuests } from '../context/GuestContext';
import {
  FIXTURE_TYPES,
  ROOM_HEIGHT,
  ROOM_WIDTH,
  SEAT_RADIUS,
  TABLE_CAPACITIES,
  TABLE_LAYOUTS,
  getFixtureType,
  getLayout,
  getTableGeometry,
} from '../data/seatingLayouts';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface SeatingTable {
  id: string;
  number: number;
  name?: string;
  layoutId: string;
  x: number;
  y: number;
  rotation: number;
}

interface SeatValue {
  personKey: string;
  guestId: string;
  name: string;
}

interface Fixture {
  id: string;
  type: string;
  x: number;
  y: number;
  rotation: number;
}

type TablesMap = Record<string, SeatingTable>;
type SeatsMap = Record<string, Record<string, SeatValue>>;
type FixturesMap = Record<string, Fixture>;

interface Person {
  key: string;
  guestId: string;
  guestName: string;
  name: string;
  status: 'confirmed' | 'pending';
}

type Selection = { kind: 'person'; key: string } | { kind: 'group'; guestId: string } | null;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const seatKey = (index: number) => `s${index}`;
const seatIndexOf = (key: string) => Number(key.slice(1));
const tableLabel = (t: SeatingTable) => t.name?.trim() || `Mesa ${t.number}`;
const snap = (v: number) => Math.round(v * 4) / 4;
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const initials = (name: string) => {
  const parts = name.replace(/·.*/, '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

/** Mesa(s) de cada invitado según las asignaciones, para sincronizar mesa_asignada. */
const computeTableNamesByGuest = (tables: TablesMap, seats: SeatsMap) => {
  const result = new Map<string, SeatingTable[]>();
  Object.entries(seats).forEach(([tableId, tableSeats]) => {
    const table = tables[tableId];
    if (!table) return;
    Object.values(tableSeats || {}).forEach((seat) => {
      if (!seat?.guestId) return;
      const list = result.get(seat.guestId) ?? [];
      if (!list.includes(table)) list.push(table);
      result.set(seat.guestId, list);
    });
  });
  const names = new Map<string, string>();
  result.forEach((list, guestId) => {
    names.set(
      guestId,
      list
        .sort((a, b) => a.number - b.number)
        .map(tableLabel)
        .join(', ')
    );
  });
  return names;
};

// ─── Componente ───────────────────────────────────────────────────────────────
export const SeatingPanel: React.FC = () => {
  const { guests } = useGuests();

  const [tables, setTables] = useState<TablesMap>({});
  const [seats, setSeats] = useState<SeatsMap>({});
  const [fixtures, setFixtures] = useState<FixturesMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selection, setSelection] = useState<Selection>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedFixtureId, setSelectedFixtureId] = useState<string | null>(null);
  const [listFilter, setListFilter] = useState<'unseated' | 'pending' | 'seated'>('unseated');
  const [search, setSearch] = useState('');
  const [zoom, setZoom] = useState(1);
  const [newCapacity, setNewCapacity] = useState<number>(8);
  const [newLayoutId, setNewLayoutId] = useState<string>('l8-heads');
  const [nameDraft, setNameDraft] = useState('');

  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<{
    kind: 'table' | 'fixture';
    id: string;
    dx: number;
    dy: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);

  // ── Suscripción en tiempo real ──────────────────────────────────────────────
  useEffect(() => {
    return onValue(
      ref(realtimeDb, 'seating'),
      (snapshot) => {
        if (dragRef.current) return; // no pisar la posición mientras se arrastra
        const val = (snapshot.val() || {}) as {
          tables?: TablesMap;
          seats?: SeatsMap;
          fixtures?: FixturesMap;
        };
        const t: TablesMap = {};
        Object.entries(val.tables || {}).forEach(([id, table]) => (t[id] = { ...table, id }));
        const f: FixturesMap = {};
        Object.entries(val.fixtures || {}).forEach(([id, fx]) => (f[id] = { ...fx, id }));
        setTables(t);
        setSeats(val.seats || {});
        setFixtures(f);
        setIsLoading(false);
      },
      (err) => {
        console.error('Error cargando mesas:', err);
        setError('No se pudieron cargar las mesas. Recarga el panel.');
        setIsLoading(false);
      }
    );
  }, []);

  // ── Personas (una por asiento) derivadas de los invitados ──────────────────
  const { people, peopleByKey, guestsById } = useMemo(() => {
    const list: Person[] = [];
    guests.forEach((g) => {
      if (g.confirmado && g.asistira === true) {
        const names = (g.asistentes_nombres || []).map((n) => n.trim()).filter(Boolean);
        const count = Math.max(g.cupos_confirmados || 0, names.length);
        for (let i = 0; i < count; i++) {
          list.push({
            key: `${g.id}__${i}`,
            guestId: g.id,
            guestName: g.nombre_principal,
            name: names[i] || `${g.nombre_principal} · invitado ${i + 1}`,
            status: 'confirmed',
          });
        }
      } else if (!g.confirmado) {
        for (let i = 0; i < (g.cupos_totales || 0); i++) {
          list.push({
            key: `${g.id}__${i}`,
            guestId: g.id,
            guestName: g.nombre_principal,
            name: `${g.nombre_principal} · cupo ${i + 1}`,
            status: 'pending',
          });
        }
      }
    });
    return {
      people: list,
      peopleByKey: new Map(list.map((p) => [p.key, p])),
      guestsById: new Map(guests.map((g) => [g.id, g])),
    };
  }, [guests]);

  const seatOfPerson = useMemo(() => {
    const map = new Map<string, { tableId: string; index: number }>();
    Object.entries(seats).forEach(([tableId, tableSeats]) => {
      if (!tables[tableId]) return;
      Object.entries(tableSeats || {}).forEach(([key, seat]) => {
        if (seat?.personKey) map.set(seat.personKey, { tableId, index: seatIndexOf(key) });
      });
    });
    return map;
  }, [seats, tables]);

  const sortedTables = useMemo(
    () => Object.values(tables as TablesMap).sort((a, b) => a.number - b.number),
    [tables]
  );

  // ── Estadísticas y avisos ───────────────────────────────────────────────────
  const stats = useMemo(() => {
    const confirmed = people.filter((p) => p.status === 'confirmed');
    const seatedConfirmed = confirmed.filter((p) => seatOfPerson.has(p.key)).length;
    const seatedPending = people.filter((p) => p.status === 'pending' && seatOfPerson.has(p.key)).length;
    const capacity = sortedTables.reduce((s, t) => s + getLayout(t.layoutId).capacity, 0);
    return { confirmedTotal: confirmed.length, seatedConfirmed, seatedPending, capacity };
  }, [people, seatOfPerson, sortedTables]);

  const orphanSeats = useMemo(() => {
    const list: Array<{ tableId: string; index: number; seat: SeatValue }> = [];
    Object.entries(seats).forEach(([tableId, tableSeats]) => {
      if (!tables[tableId]) return;
      Object.entries(tableSeats || {}).forEach(([key, seat]) => {
        if (seat && !peopleByKey.has(seat.personKey)) {
          list.push({ tableId, index: seatIndexOf(key), seat });
        }
      });
    });
    return list;
  }, [seats, tables, peopleByKey]);

  const splitGroups = useMemo(() => {
    const byGuest = new Map<string, Set<string>>();
    people.forEach((p) => {
      const s = seatOfPerson.get(p.key);
      if (!s) return;
      const set = byGuest.get(p.guestId) ?? new Set<string>();
      set.add(s.tableId);
      byGuest.set(p.guestId, set);
    });
    return Array.from(byGuest.entries())
      .filter(([, set]) => set.size > 1)
      .map(([guestId, set]) => ({
        guestName: guestsById.get(guestId)?.nombre_principal ?? 'Invitado',
        tables: Array.from(set)
          .map((id) => tables[id])
          .filter(Boolean)
          .sort((a, b) => a.number - b.number)
          .map(tableLabel),
      }));
  }, [people, seatOfPerson, guestsById, tables]);

  // ── Escritura en Firebase (con sincronización de mesa_asignada) ────────────
  const commit = async (
    nextTables: TablesMap,
    nextSeats: SeatsMap,
    paths: Record<string, unknown>
  ) => {
    const before = computeTableNamesByGuest(tables, seats);
    const after = computeTableNamesByGuest(nextTables, nextSeats);
    new Set([...before.keys(), ...after.keys()]).forEach((guestId) => {
      const prev = before.get(guestId) ?? '';
      const next = after.get(guestId) ?? '';
      if (prev !== next && guestsById.has(guestId)) {
        paths[`guests/${guestId}/mesa_asignada`] = next || 'Por asignar';
      }
    });

    setTables(nextTables);
    setSeats(nextSeats);
    setError(null);
    try {
      await update(ref(realtimeDb), paths);
    } catch (err) {
      console.error('Error guardando mesas:', err);
      setError('No se pudo guardar el cambio. Revisa tu conexión e inténtalo de nuevo.');
    }
  };

  const writeSeat = (
    nextSeats: SeatsMap,
    paths: Record<string, unknown>,
    tableId: string,
    index: number,
    value: SeatValue | null
  ) => {
    const tableSeats = { ...(nextSeats[tableId] || {}) };
    if (value) tableSeats[seatKey(index)] = value;
    else delete tableSeats[seatKey(index)];
    nextSeats[tableId] = tableSeats;
    paths[`seating/seats/${tableId}/${seatKey(index)}`] = value;
  };

  const toSeatValue = (p: Person): SeatValue => ({ personKey: p.key, guestId: p.guestId, name: p.name });

  // ── Acciones de asientos ────────────────────────────────────────────────────
  const assignPerson = (person: Person, tableId: string, index: number) => {
    const prevSeat = seatOfPerson.get(person.key);
    if (prevSeat && prevSeat.tableId === tableId && prevSeat.index === index) return;

    const occupant = seats[tableId]?.[seatKey(index)];
    const nextSeats: SeatsMap = { ...seats };
    const paths: Record<string, unknown> = {};

    if (prevSeat) {
      // Si el asiento destino estaba ocupado, se intercambian
      writeSeat(nextSeats, paths, prevSeat.tableId, prevSeat.index, occupant ?? null);
    }
    writeSeat(nextSeats, paths, tableId, index, toSeatValue(person));
    void commit(tables, nextSeats, paths);
  };

  const seatGroup = (guestId: string, tableId: string, startIndex: number) => {
    const table = tables[tableId];
    if (!table) return;
    const capacity = getLayout(table.layoutId).capacity;
    const pending = people.filter((p) => p.guestId === guestId && !seatOfPerson.has(p.key));
    const nextSeats: SeatsMap = { ...seats };
    const paths: Record<string, unknown> = {};
    let placed = 0;
    for (let step = 0; step < capacity && placed < pending.length; step++) {
      const idx = (startIndex + step) % capacity;
      if (!nextSeats[tableId]?.[seatKey(idx)]) {
        writeSeat(nextSeats, paths, tableId, idx, toSeatValue(pending[placed]));
        placed++;
      }
    }
    if (placed < pending.length) {
      setError(
        `${tableLabel(table)} no tenía espacio para todo el grupo: quedaron ${pending.length - placed} persona(s) sin asiento.`
      );
    }
    if (placed > 0) void commit(tables, nextSeats, paths);
  };

  const clearSeat = (tableId: string, index: number) => {
    const nextSeats: SeatsMap = { ...seats };
    const paths: Record<string, unknown> = {};
    writeSeat(nextSeats, paths, tableId, index, null);
    void commit(tables, nextSeats, paths);
  };

  const unseatPerson = (personKey: string) => {
    const s = seatOfPerson.get(personKey);
    if (s) clearSeat(s.tableId, s.index);
    setSelection(null);
  };

  const handleSeatClick = (tableId: string, index: number) => {
    setSelectedTableId(tableId);
    setSelectedFixtureId(null);
    const occupant = seats[tableId]?.[seatKey(index)];

    if (selection?.kind === 'person') {
      const person = peopleByKey.get(selection.key);
      if (person) assignPerson(person, tableId, index);
      setSelection(null);
      return;
    }
    if (selection?.kind === 'group') {
      seatGroup(selection.guestId, tableId, index);
      setSelection(null);
      return;
    }
    if (occupant && peopleByKey.has(occupant.personKey)) {
      setSelection({ kind: 'person', key: occupant.personKey });
    }
  };

  // ── Acciones de mesas ───────────────────────────────────────────────────────
  const addTable = () => {
    const id = push(ref(realtimeDb, 'seating/tables')).key;
    if (!id) return;
    const number = sortedTables.reduce((max, t) => Math.max(max, t.number), 0) + 1;
    const i = sortedTables.length;
    const table: SeatingTable = {
      id,
      number,
      name: `Mesa ${number}`,
      layoutId: newLayoutId,
      x: 2 + (i % 6) * 3,
      y: 2 + (Math.floor(i / 6) % 3) * 3,
      rotation: 0,
    };
    const { id: _omit, ...data } = table;
    void commit({ ...tables, [id]: table }, seats, { [`seating/tables/${id}`]: data });
    setSelectedTableId(id);
    setSelectedFixtureId(null);
    setNameDraft(table.name ?? '');
  };

  const updateTable = (id: string, changes: Partial<SeatingTable>) => {
    const current = tables[id];
    if (!current) return;
    const next = { ...current, ...changes };
    const paths: Record<string, unknown> = {};
    Object.entries(changes).forEach(([k, v]) => (paths[`seating/tables/${id}/${k}`] = v));
    const nextSeats: SeatsMap = { ...seats };

    if (changes.layoutId) {
      const newCap = getLayout(changes.layoutId).capacity;
      const overflow = Object.keys(seats[id] || {}).filter((k) => seatIndexOf(k) >= newCap);
      if (overflow.length > 0) {
        if (!confirm(`Al cambiar la mesa quedarán ${overflow.length} persona(s) sin asiento. ¿Continuar?`)) return;
        overflow.forEach((k) => writeSeat(nextSeats, paths, id, seatIndexOf(k), null));
      }
    }
    void commit({ ...tables, [id]: next }, nextSeats, paths);
  };

  const deleteTable = (id: string) => {
    const table = tables[id];
    if (!table) return;
    const occupied = Object.keys(seats[id] || {}).length;
    const msg = occupied
      ? `¿Eliminar ${tableLabel(table)}? ${occupied} persona(s) quedarán sin asiento.`
      : `¿Eliminar ${tableLabel(table)}?`;
    if (!confirm(msg)) return;
    const nextTables = { ...tables };
    delete nextTables[id];
    const nextSeats = { ...seats };
    delete nextSeats[id];
    void commit(nextTables, nextSeats, {
      [`seating/tables/${id}`]: null,
      [`seating/seats/${id}`]: null,
    });
    setSelectedTableId(null);
  };

  const saveTableName = () => {
    if (!selectedTableId || !tables[selectedTableId]) return;
    const table = tables[selectedTableId];
    const name = nameDraft.trim() || `Mesa ${table.number}`;
    if (name !== table.name) updateTable(selectedTableId, { name });
    setNameDraft(name);
  };

  // ── Elementos fijos ─────────────────────────────────────────────────────────
  const addFixture = (type: string) => {
    const id = push(ref(realtimeDb, 'seating/fixtures')).key;
    if (!id) return;
    const ft = getFixtureType(type);
    const fixture: Fixture = { id, type, x: ROOM_WIDTH / 2, y: ft.height / 2 + 0.5, rotation: 0 };
    setFixtures((prev) => ({ ...prev, [id]: fixture }));
    const { id: _omit, ...data } = fixture;
    void update(ref(realtimeDb), { [`seating/fixtures/${id}`]: data }).catch(() =>
      setError('No se pudo agregar el elemento.')
    );
    setSelectedFixtureId(id);
    setSelectedTableId(null);
  };

  const updateFixture = (id: string, changes: Partial<Fixture>) => {
    setFixtures((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], ...changes } } : prev));
    const paths: Record<string, unknown> = {};
    Object.entries(changes).forEach(([k, v]) => (paths[`seating/fixtures/${id}/${k}`] = v));
    void update(ref(realtimeDb), paths).catch(() => setError('No se pudo guardar el elemento.'));
  };

  const deleteFixture = (id: string) => {
    setFixtures((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    void update(ref(realtimeDb), { [`seating/fixtures/${id}`]: null });
    setSelectedFixtureId(null);
  };

  // ── Arrastrar en el plano ───────────────────────────────────────────────────
  const toRoomCoords = (e: React.PointerEvent) => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  };

  const startDrag = (e: React.PointerEvent, kind: 'table' | 'fixture', id: string, x: number, y: number) => {
    e.stopPropagation();
    const p = toRoomCoords(e);
    dragRef.current = { kind, id, dx: p.x - x, dy: p.y - y, startX: e.clientX, startY: e.clientY, moved: false };
    svgRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < 5) return;
    drag.moved = true;
    const p = toRoomCoords(e);
    const x = clamp(snap(p.x - drag.dx), 0, ROOM_WIDTH);
    const y = clamp(snap(p.y - drag.dy), 0, ROOM_HEIGHT);
    if (drag.kind === 'table') {
      setTables((prev) => (prev[drag.id] ? { ...prev, [drag.id]: { ...prev[drag.id], x, y } } : prev));
    } else {
      setFixtures((prev) => (prev[drag.id] ? { ...prev, [drag.id]: { ...prev[drag.id], x, y } } : prev));
    }
  };

  const onPointerUp = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;
    if (drag.kind === 'table') {
      const t = tables[drag.id];
      if (drag.moved && t) {
        void update(ref(realtimeDb), {
          [`seating/tables/${drag.id}/x`]: t.x,
          [`seating/tables/${drag.id}/y`]: t.y,
        }).catch(() => setError('No se pudo guardar la posición de la mesa.'));
      } else if (t) {
        setSelectedTableId(drag.id);
        setSelectedFixtureId(null);
        setNameDraft(t.name ?? `Mesa ${t.number}`);
      }
    } else {
      const f = fixtures[drag.id];
      if (drag.moved && f) updateFixture(drag.id, { x: f.x, y: f.y });
      else {
        setSelectedFixtureId(drag.id);
        setSelectedTableId(null);
      }
    }
  };

  // ── Lista lateral ───────────────────────────────────────────────────────────
  const groupedList = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = people.filter((p) => {
      const seated = seatOfPerson.has(p.key);
      if (listFilter === 'unseated' && (seated || p.status !== 'confirmed')) return false;
      if (listFilter === 'pending' && p.status !== 'pending') return false;
      if (listFilter === 'seated' && !seated) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.guestName.toLowerCase().includes(q)) return false;
      return true;
    });
    const groups = new Map<string, Person[]>();
    filtered.forEach((p) => groups.set(p.guestId, [...(groups.get(p.guestId) ?? []), p]));
    return Array.from(groups.entries())
      .map(([guestId, members]) => ({ guestId, guestName: members[0].guestName, members }))
      .sort((a, b) => a.guestName.localeCompare(b.guestName));
  }, [people, seatOfPerson, listFilter, search]);

  const counts = useMemo(
    () => ({
      unseated: people.filter((p) => p.status === 'confirmed' && !seatOfPerson.has(p.key)).length,
      pending: people.filter((p) => p.status === 'pending').length,
      seated: people.filter((p) => seatOfPerson.has(p.key)).length,
    }),
    [people, seatOfPerson]
  );

  const selectedPerson = selection?.kind === 'person' ? peopleByKey.get(selection.key) : undefined;
  const selectedGroupGuest = selection?.kind === 'group' ? guestsById.get(selection.guestId) : undefined;
  const highlightGuestId = selectedPerson?.guestId ?? (selection?.kind === 'group' ? selection.guestId : null);
  const selectedTable = selectedTableId ? tables[selectedTableId] : undefined;
  const selectedFixture = selectedFixtureId ? fixtures[selectedFixtureId] : undefined;

  const locationLabel = (personKey: string) => {
    const s = seatOfPerson.get(personKey);
    if (!s || !tables[s.tableId]) return null;
    return `${tableLabel(tables[s.tableId])} · asiento ${s.index + 1}`;
  };

  if (isLoading) {
    return <p className="py-12 text-center text-sm text-[#6B6B56]">Cargando mesas…</p>;
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-[#8D8741]/40 bg-[#F7F3E9] p-5 shadow-sm">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#8D8741]">Con asiento</p>
          <p className="font-serif-display text-3xl font-bold text-[#5A5A40] sm:text-4xl">
            {stats.seatedConfirmed}
            <span className="text-lg text-[#6B6B56]"> / {stats.confirmedTotal}</span>
          </p>
          <p className="mt-1 text-[11px] font-medium text-[#6B6B56]">confirmados ya ubicados</p>
        </div>
        <div className="rounded-2xl border border-[#BC986A]/40 bg-[#F7F3E9] p-5 shadow-sm">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#BC986A]">Sin asiento</p>
          <p className="font-serif-display text-3xl font-bold text-[#333333] sm:text-4xl">{counts.unseated}</p>
          <p className="mt-1 text-[11px] font-medium text-[#6B6B56]">confirmados por ubicar</p>
        </div>
        <div className="rounded-2xl border border-[#E0D8C3] bg-[#F7F3E9] p-5 shadow-sm">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#6B6B56]">Mesas</p>
          <p className="font-serif-display text-3xl font-bold text-[#5A5A40] sm:text-4xl">{sortedTables.length}</p>
          <p className="mt-1 text-[11px] font-medium text-[#6B6B56]">{stats.capacity} asientos en total</p>
        </div>
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 shadow-sm">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-800">Pendientes</p>
          <p className="font-serif-display text-3xl font-bold text-amber-900 sm:text-4xl">{counts.pending}</p>
          <p className="mt-1 text-[11px] font-medium text-amber-800">
            cupos sin confirmar · {stats.seatedPending} con asiento tentativo
          </p>
        </div>
      </div>

      {/* Avisos */}
      {(error ||
        orphanSeats.length > 0 ||
        splitGroups.length > 0 ||
        stats.capacity < stats.confirmedTotal) && (
        <div className="space-y-2 rounded-2xl border border-[#E0D8C3] bg-white p-4 text-sm shadow-sm">
          {error && (
            <p className="flex items-start gap-2 text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="flex-1">{error}</span>
              <button onClick={() => setError(null)} aria-label="Cerrar aviso">
                <X className="h-4 w-4" />
              </button>
            </p>
          )}
          {stats.capacity < stats.confirmedTotal && sortedTables.length > 0 && (
            <p className="flex items-start gap-2 text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              Faltan asientos: hay {stats.confirmedTotal} confirmados y {stats.capacity} asientos en las mesas.
            </p>
          )}
          {orphanSeats.map(({ tableId, index, seat }) => (
            <p key={`${tableId}-${index}`} className="flex flex-wrap items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span className="flex-1">
                <strong>{seat.name}</strong> ya no está confirmado/a, pero sigue en{' '}
                {tableLabel(tables[tableId])} (asiento {index + 1}).
              </span>
              <button
                onClick={() => clearSeat(tableId, index)}
                className="rounded-lg border border-red-300 px-2 py-0.5 text-xs font-semibold hover:bg-red-50"
              >
                Liberar asiento
              </button>
            </p>
          ))}
          {splitGroups.map((g) => (
            <p key={g.guestName} className="flex items-start gap-2 text-[#6B6B56]">
              <Users className="mt-0.5 h-4 w-4 shrink-0 text-[#BC986A]" />
              <span>
                <strong className="text-[#333333]">{g.guestName}</strong> está repartido en {g.tables.join(' y ')}.
              </span>
            </p>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* ── Columna plano ── */}
        <div className="order-2 min-w-0 space-y-4 lg:order-1">
          {/* Barra de herramientas */}
          <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-[#E0D8C3] bg-white p-4 shadow-sm">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#5A5A40]">
              Personas
              <select
                value={newCapacity}
                onChange={(e) => {
                  const cap = Number(e.target.value);
                  setNewCapacity(cap);
                  setNewLayoutId(TABLE_LAYOUTS.find((l) => l.capacity === cap)!.id);
                }}
                className="mt-1 block rounded-xl border border-[#E0D8C3] bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#333333]"
              >
                {TABLE_CAPACITIES.map((c) => (
                  <option key={c} value={c}>
                    {c} personas
                  </option>
                ))}
              </select>
            </label>
            <label className="min-w-0 flex-1 text-[11px] font-semibold uppercase tracking-wider text-[#5A5A40]">
              Distribución
              <select
                value={newLayoutId}
                onChange={(e) => setNewLayoutId(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-[#E0D8C3] bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#333333]"
              >
                {TABLE_LAYOUTS.filter((l) => l.capacity === newCapacity).map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              onClick={addTable}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#5A5A40] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm hover:bg-[#474732]"
            >
              <Plus className="h-4 w-4" /> Agregar mesa
            </button>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#5A5A40]">
              Elemento del salón
              <select
                value=""
                onChange={(e) => e.target.value && addFixture(e.target.value)}
                className="mt-1 block rounded-xl border border-[#E0D8C3] bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#333333]"
              >
                <option value="">+ Agregar…</option>
                {FIXTURE_TYPES.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={() => setZoom((z) => Math.max(1, z - 0.5))}
                className="rounded-lg border border-[#E0D8C3] p-2 text-[#5A5A40] hover:bg-[#EAE7DC]"
                aria-label="Alejar"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center text-xs font-semibold text-[#5A5A40]">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom((z) => Math.min(3, z + 0.5))}
                className="rounded-lg border border-[#E0D8C3] p-2 text-[#5A5A40] hover:bg-[#EAE7DC]"
                aria-label="Acercar"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Barra de selección */}
          {(selectedPerson || selectedGroupGuest) && (
            <div className="sticky top-28 z-30 flex flex-wrap items-center gap-2 rounded-2xl border-2 border-[#BC986A] bg-[#FDFCF0] p-3 text-sm shadow-md">
              <Armchair className="h-4 w-4 text-[#8D8741]" />
              <span className="flex-1">
                {selectedPerson ? (
                  <>
                    <strong>{selectedPerson.name}</strong>
                    {locationLabel(selectedPerson.key) ? ` (${locationLabel(selectedPerson.key)})` : ''} — toca un
                    asiento para ubicarlo/a. Si está ocupado, se intercambian.
                  </>
                ) : (
                  <>
                    Grupo <strong>{selectedGroupGuest!.nombre_principal}</strong> — toca el asiento donde empieza el
                    grupo; se llenan los asientos libres siguientes.
                  </>
                )}
              </span>
              {selectedPerson && seatOfPerson.has(selectedPerson.key) && (
                <button
                  onClick={() => unseatPerson(selectedPerson.key)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-300 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                >
                  <UserMinus className="h-3.5 w-3.5" /> Quitar del asiento
                </button>
              )}
              <button
                onClick={() => setSelection(null)}
                className="rounded-lg border border-[#E0D8C3] px-2 py-1 text-xs font-semibold text-[#5A5A40] hover:bg-[#EAE7DC]"
              >
                Cancelar
              </button>
            </div>
          )}

          {/* Plano */}
          <div className="overflow-auto rounded-2xl border border-[#E0D8C3] bg-white p-2 shadow-sm">
            <svg
              ref={svgRef}
              viewBox={`-0.6 -0.6 ${ROOM_WIDTH + 1.2} ${ROOM_HEIGHT + 1.2}`}
              style={{ width: `${zoom * 100}%`, minWidth: `${720 * zoom}px` }}
              className="block select-none"
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              {/* Salón */}
              <rect
                onPointerDown={() => {
                  setSelectedTableId(null);
                  setSelectedFixtureId(null);
                }}
                x={0} y={0} width={ROOM_WIDTH} height={ROOM_HEIGHT} fill="#FBF8F1" stroke="#BC986A" strokeWidth={0.06} />
              {Array.from({ length: ROOM_WIDTH - 1 }, (_, i) => (
                <line key={`v${i}`} x1={i + 1} y1={0} x2={i + 1} y2={ROOM_HEIGHT} stroke="#E8DFCF" strokeWidth={0.02} pointerEvents="none" />
              ))}
              {Array.from({ length: ROOM_HEIGHT - 1 }, (_, i) => (
                <line key={`h${i}`} x1={0} y1={i + 1} x2={ROOM_WIDTH} y2={i + 1} stroke="#E8DFCF" strokeWidth={0.02} pointerEvents="none" />
              ))}
              <text x={ROOM_WIDTH / 2} y={-0.2} fontSize={0.3} textAnchor="middle" fill="#8D8741">
                20 m
              </text>
              <text x={-0.25} y={ROOM_HEIGHT / 2} fontSize={0.3} textAnchor="middle" fill="#8D8741" transform={`rotate(-90 -0.25 ${ROOM_HEIGHT / 2})`}>
                10 m
              </text>

              {/* Elementos fijos */}
              {Object.values(fixtures as FixturesMap).map((f) => {
                const ft = getFixtureType(f.type);
                const w = f.rotation === 90 ? ft.height : ft.width;
                const h = f.rotation === 90 ? ft.width : ft.height;
                const isSel = f.id === selectedFixtureId;
                return (
                  <g
                    key={f.id}
                    transform={`translate(${f.x} ${f.y})`}
                    style={{ cursor: 'move', touchAction: 'none' }}
                    onPointerDown={(e) => startDrag(e, 'fixture', f.id, f.x, f.y)}
                  >
                    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={0.1} fill={ft.fill} stroke={isSel ? '#5A5A40' : '#BC986A'} strokeWidth={isSel ? 0.08 : 0.03} strokeDasharray={f.type === 'pista' ? '0.15 0.1' : undefined} />
                    <text y={0.1} fontSize={Math.min(0.3, h * 0.6)} textAnchor="middle" fill="#5A5A40" pointerEvents="none">
                      {ft.label}
                    </text>
                  </g>
                );
              })}

              {/* Mesas */}
              {sortedTables.map((t) => {
                const layout = getLayout(t.layoutId);
                const geo = getTableGeometry(layout, t.rotation);
                const tableSeats = seats[t.id] || {};
                const occupied = Object.keys(tableSeats).filter((k) => seatIndexOf(k) < layout.capacity).length;
                const isSel = t.id === selectedTableId;
                return (
                  <g key={t.id} transform={`translate(${t.x} ${t.y})`}>
                    <g style={{ cursor: 'move', touchAction: 'none' }} onPointerDown={(e) => startDrag(e, 'table', t.id, t.x, t.y)}>
                      <rect
                        x={-geo.width / 2}
                        y={-geo.height / 2}
                        width={geo.width}
                        height={geo.height}
                        rx={0.08}
                        fill={isSel ? '#EAE7DC' : '#FFFFFF'}
                        stroke={isSel ? '#5A5A40' : '#BC986A'}
                        strokeWidth={isSel ? 0.08 : 0.04}
                      />
                      <text y={-0.02} fontSize={0.22} fontWeight="bold" textAnchor="middle" fill="#333333" pointerEvents="none">
                        {tableLabel(t).length > 14 ? `${tableLabel(t).slice(0, 13)}…` : tableLabel(t)}
                      </text>
                      <text y={0.24} fontSize={0.17} textAnchor="middle" fill={occupied === layout.capacity ? '#8D8741' : '#6B6B56'} pointerEvents="none">
                        {occupied}/{layout.capacity}
                      </text>
                    </g>
                    {geo.seats.map((pos, idx) => {
                      const seat = tableSeats[seatKey(idx)];
                      const person = seat ? peopleByKey.get(seat.personKey) : undefined;
                      const name = person?.name ?? seat?.name;
                      const fill = !seat ? '#FFFFFF' : !person ? '#FCA5A5' : person.status === 'pending' ? '#FCD34D' : '#5A5A40';
                      const textFill = !seat ? '#BC986A' : person?.status === 'confirmed' ? '#FFFFFF' : '#333333';
                      const isHighlighted = (seat && highlightGuestId && seat.guestId === highlightGuestId) || (selection?.kind === 'person' && seat?.personKey === selection.key);
                      return (
                        <g
                          key={idx}
                          transform={`translate(${pos.x} ${pos.y})`}
                          style={{ cursor: 'pointer' }}
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSeatClick(t.id, idx);
                          }}
                        >
                          <title>{name ? `${name} — asiento ${idx + 1}` : `Asiento ${idx + 1} libre`}</title>
                          <circle r={SEAT_RADIUS} fill={fill} stroke={isHighlighted ? '#D4AF37' : '#BC986A'} strokeWidth={isHighlighted ? 0.09 : 0.03} />
                          <text y={0.06} fontSize={seat ? 0.16 : 0.14} fontWeight={seat ? 'bold' : 'normal'} textAnchor="middle" fill={textFill} pointerEvents="none">
                            {name ? initials(name) : idx + 1}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </svg>
          </div>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#6B6B56]">
            <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded-full border border-[#BC986A] bg-white" /> Libre</span>
            <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-[#5A5A40]" /> Confirmado</span>
            <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-[#FCD34D]" /> Pendiente (tentativo)</span>
            <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-[#FCA5A5]" /> Ya no confirmado</span>
            <span>Arrastra las mesas para moverlas. Cada cuadro de la grilla mide 1 m.</span>
          </p>

          {/* Detalle de mesa */}
          {selectedTable && (
            <div className="space-y-4 rounded-2xl border border-[#E0D8C3] bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-end gap-3">
                <label className="min-w-[10rem] flex-1 text-[11px] font-semibold uppercase tracking-wider text-[#5A5A40]">
                  Nombre de la mesa #{selectedTable.number}
                  <input
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    onBlur={saveTableName}
                    onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLInputElement).blur()}
                    placeholder={`Mesa ${selectedTable.number}`}
                    className="mt-1 block w-full rounded-xl border border-[#E0D8C3] px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#333333]"
                  />
                </label>
                <label className="min-w-[12rem] flex-1 text-[11px] font-semibold uppercase tracking-wider text-[#5A5A40]">
                  Tipo de mesa
                  <select
                    value={selectedTable.layoutId}
                    onChange={(e) => updateTable(selectedTable.id, { layoutId: e.target.value })}
                    className="mt-1 block w-full rounded-xl border border-[#E0D8C3] bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#333333]"
                  >
                    {TABLE_CAPACITIES.map((c) => (
                      <optgroup key={c} label={`${c} personas`}>
                        {TABLE_LAYOUTS.filter((l) => l.capacity === c).map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </label>
                <button
                  onClick={() => updateTable(selectedTable.id, { rotation: selectedTable.rotation === 90 ? 0 : 90 })}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#5A5A40] px-3 py-2 text-xs font-semibold text-[#5A5A40] hover:bg-[#EAE7DC]"
                >
                  <RotateCw className="h-4 w-4" /> Girar
                </button>
                <button
                  onClick={() => deleteTable(selectedTable.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" /> Eliminar
                </button>
              </div>
              <ol className="grid gap-1.5 sm:grid-cols-2">
                {Array.from({ length: getLayout(selectedTable.layoutId).capacity }, (_, idx) => {
                  const seat = seats[selectedTable.id]?.[seatKey(idx)];
                  const person = seat ? peopleByKey.get(seat.personKey) : undefined;
                  return (
                    <li key={idx} className="flex items-center gap-2 rounded-xl bg-[#F7F3E9] px-3 py-1.5 text-sm">
                      <span className="w-5 text-right text-xs font-bold text-[#BC986A]">{idx + 1}</span>
                      {seat ? (
                        <>
                          <span className={`flex-1 truncate ${person ? 'text-[#333333]' : 'text-red-700 line-through'}`}>
                            {person?.name ?? seat.name}
                          </span>
                          {person?.status === 'pending' && (
                            <span className="rounded bg-amber-100 px-1.5 text-[10px] font-semibold text-amber-800">pendiente</span>
                          )}
                          <button onClick={() => clearSeat(selectedTable.id, idx)} className="text-[#6B6B56] hover:text-red-700" aria-label="Quitar del asiento">
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <span className="flex-1 italic text-[#6B6B56]/70">Libre</span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          {selectedFixture && (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#E0D8C3] bg-white p-4 shadow-sm">
              <span className="flex-1 text-sm font-semibold text-[#333333]">{getFixtureType(selectedFixture.type).label}</span>
              <button
                onClick={() => updateFixture(selectedFixture.id, { rotation: selectedFixture.rotation === 90 ? 0 : 90 })}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#5A5A40] px-3 py-2 text-xs font-semibold text-[#5A5A40] hover:bg-[#EAE7DC]"
              >
                <RotateCw className="h-4 w-4" /> Girar
              </button>
              <button
                onClick={() => deleteFixture(selectedFixture.id)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" /> Eliminar
              </button>
            </div>
          )}
        </div>

        {/* ── Lista de invitados ── */}
        <aside className="order-1 flex max-h-[70vh] flex-col overflow-hidden rounded-2xl border border-[#E0D8C3] bg-white shadow-sm lg:order-2 lg:sticky lg:top-32 lg:max-h-[calc(100vh-9rem)]">
          <div className="space-y-3 border-b border-[#E0D8C3] bg-[#F7F3E9] p-4">
            <div className="grid grid-cols-3 gap-1">
              {([
                ['unseated', 'Sin asiento', counts.unseated],
                ['pending', 'Pendientes', counts.pending],
                ['seated', 'Sentados', counts.seated],
              ] as const).map(([key, label, n]) => (
                <button
                  key={key}
                  onClick={() => setListFilter(key)}
                  className={`rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-all ${
                    listFilter === key ? 'bg-[#5A5A40] text-white shadow-sm' : 'border border-[#E0D8C3] bg-white text-[#5A5A40] hover:bg-[#EAE7DC]'
                  }`}
                >
                  {label} ({n})
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6B6B56]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar persona o familia…"
                className="w-full rounded-xl border border-[#E0D8C3] bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#5A5A40]"
              />
            </div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {groupedList.length === 0 && (
              <p className="py-8 text-center text-sm italic text-[#6B6B56]">
                {listFilter === 'unseated' ? '¡Todos los confirmados tienen asiento! 🎉' : 'No hay personas en esta lista.'}
              </p>
            )}
            {groupedList.map((group) => {
              const unseatedInGroup = people.filter((p) => p.guestId === group.guestId && !seatOfPerson.has(p.key)).length;
              const isGroupSel = selection?.kind === 'group' && selection.guestId === group.guestId;
              return (
                <div key={group.guestId} className={`rounded-xl border p-2.5 ${isGroupSel ? 'border-[#BC986A] bg-[#FDFCF0]' : 'border-[#E0D8C3]'}`}>
                  <div className="mb-1.5 flex items-center gap-2">
                    {group.members[0].status === 'pending' ? (
                      <Clock className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                    ) : (
                      <CheckCircle className="h-3.5 w-3.5 shrink-0 text-[#8D8741]" />
                    )}
                    <span className="flex-1 truncate text-xs font-bold text-[#333333]">{group.guestName}</span>
                    {unseatedInGroup > 1 && (
                      <button
                        onClick={() => setSelection(isGroupSel ? null : { kind: 'group', guestId: group.guestId })}
                        className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                          isGroupSel ? 'bg-[#BC986A] text-white' : 'border border-[#BC986A] text-[#8D8741] hover:bg-[#EAE7DC]'
                        }`}
                      >
                        Sentar grupo ({unseatedInGroup})
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.members.map((p) => {
                      const isSel = selection?.kind === 'person' && selection.key === p.key;
                      const loc = locationLabel(p.key);
                      return (
                        <button
                          key={p.key}
                          onClick={() => setSelection(isSel ? null : { kind: 'person', key: p.key })}
                          title={loc ?? 'Sin asiento'}
                          className={`rounded-lg px-2 py-1 text-left text-xs transition-all ${
                            isSel
                              ? 'bg-[#5A5A40] text-white shadow'
                              : p.status === 'pending'
                              ? 'border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
                              : 'border border-[#E0D8C3] bg-[#F7F3E9] text-[#333333] hover:bg-[#EAE7DC]'
                          }`}
                        >
                          {p.name}
                          {loc && <span className={`block text-[10px] ${isSel ? 'text-white/80' : 'text-[#8D8741]'}`}>{loc}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
};
