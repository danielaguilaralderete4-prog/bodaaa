import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Gift,
  Heart,
  Loader2,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
  X,
  XCircle,
} from 'lucide-react';
import { useGiftContext } from '../context/GiftContext';
import { GiftItem, GiftReservation } from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatCLP = (value: number) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value);

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface CartEntry {
  giftId: string;
  giftName: string;
  quantity: number;
  amount: number;
  pricePerCup: number;
}

type PaymentStatus = 'approved' | 'failed' | 'pending' | null;

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Barra de progreso de cupos */
const CuposBar: React.FC<{ available: number; total: number }> = ({ available, total }) => {
  const pct = total > 0 ? Math.round((available / total) * 100) : 0;
  const color = pct > 50 ? '#18243D' : pct > 20 ? '#BC986A' : '#B04A3A';
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-[#536078]">
        <span>Disponibles</span>
        <span className="font-semibold text-[#18243D]">
          {available}/{total}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#E8DFCF]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.max(4, pct)}%`, background: color }}
        />
      </div>
    </div>
  );
};

/** Contador de cupos +/- */
const QuantitySelector: React.FC<{
  value: number;
  max: number;
  onChange: (next: number) => void;
}> = ({ value, max, onChange }) => {
  if (max === 0) {
    return (
      <span className="rounded-full bg-[#E8DFCF] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#536078]">
        Agotado
      </span>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-full border border-[#D8C29A] bg-white px-2 py-1">
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1, 0, max))}
        className="flex h-7 w-7 items-center justify-center rounded-full text-[#18243D] hover:bg-[#E8DFCF] transition disabled:opacity-30"
        disabled={value <= 0}
        aria-label="Reducir cantidad"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-5 text-center text-sm font-semibold text-[#18243D]">{value}</span>
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1, 0, max))}
        className="flex h-7 w-7 items-center justify-center rounded-full text-[#18243D] hover:bg-[#E8DFCF] transition disabled:opacity-30"
        disabled={value >= max}
        aria-label="Aumentar cantidad"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

// ─── Payment Result Page ──────────────────────────────────────────────────────
const PaymentResultPage: React.FC<{
  status: PaymentStatus;
  orderId: string | null;
  onBack: () => void;
}> = ({ status, orderId, onBack }) => {
  const { fetchOrderStatus } = useGiftContext();
  const [order, setOrder] = useState<GiftReservation | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setChecking(false);
      return;
    }
    // Poll up to 5 times to allow the webhook to update the status
    let attempts = 0;
    const poll = async () => {
      const result = await fetchOrderStatus(orderId);
      attempts++;
      if (result?.status === 'paid' || attempts >= 5) {
        setOrder(result);
        setChecking(false);
      } else {
        setTimeout(poll, 2000);
      }
    };
    void poll();
  }, [orderId, fetchOrderStatus]);

  const isApproved = status === 'approved' || order?.status === 'paid';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F4EC] px-4 py-16">
      <div className="w-full max-w-md text-center">
        {checking ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-[#18243D]" />
            <p className="text-sm text-[#536078]">Verificando tu pago…</p>
          </div>
        ) : isApproved ? (
          <>
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#E8DFCF] mx-auto">
              <CheckCircle2 className="h-10 w-10 text-[#18243D]" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8D8741]">
              Pago confirmado
            </span>
            <h2 className="font-serif-display mt-2 text-4xl font-bold text-[#18243D]">
              ¡Muchas gracias!
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#536078]">
              Tu regalo fue registrado con éxito. Bárbara y Daniel te lo agradecen de corazón. 💛
            </p>
            {order && (
              <div className="mt-6 rounded-2xl border border-[#D8C29A] bg-[#FBF8F1] p-5 text-left text-sm text-[#18243D]">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8D8741]">
                  Resumen
                </p>
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between border-b border-[#E8DFCF] py-2 last:border-0">
                    <span>
                      {item.giftName}
                      <span className="ml-1 text-[#536078]">×{item.quantity}</span>
                    </span>
                    <span className="font-semibold">{formatCLP(item.amount)}</span>
                  </div>
                ))}
                <div className="mt-3 flex justify-between font-semibold">
                  <span>Total pagado</span>
                  <span className="text-lg">{formatCLP(order.totalAmount)}</span>
                </div>
              </div>
            )}
            <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-[#EEF3F0] px-4 py-3 text-xs text-[#18243D]">
              <ShieldCheck className="h-4 w-4 text-[#18243D]" />
              <span>Pago procesado de forma segura por Mercado Pago</span>
            </div>
          </>
        ) : status === 'pending' ? (
          <>
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF8E7] mx-auto">
              <Clock className="h-10 w-10 text-[#BC986A]" />
            </div>
            <h2 className="font-serif-display mt-2 text-3xl font-bold text-[#18243D]">
              Pago en proceso
            </h2>
            <p className="mt-4 text-base text-[#536078]">
              Tu pago está siendo procesado. Te notificaremos cuando esté confirmado.
            </p>
          </>
        ) : (
          <>
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 mx-auto">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="font-serif-display mt-2 text-3xl font-bold text-[#18243D]">
              Pago no completado
            </h2>
            <p className="mt-4 text-base text-[#536078]">
              No pudimos completar tu pago. Puedes intentarlo nuevamente.
            </p>
          </>
        )}

        <button
          type="button"
          onClick={onBack}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#18243D] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#283653]"
        >
          <ChevronLeft className="h-4 w-4" />
          {isApproved ? 'Ver más regalos' : 'Volver a la lista'}
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const GiftRegistryPage: React.FC = () => {
  const { giftItems, isLoading, initiateGiftPayment } = useGiftContext();

  // URL params para resultado de pago
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(null);
  const [returnOrderId, setReturnOrderId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('payment_status') as PaymentStatus;
    const orderId = params.get('order_id');
    if (status) {
      setPaymentStatus(status);
      setReturnOrderId(orderId);
    }
  }, []);

  // Cart state
  const [cart, setCart] = useState<Record<string, number>>({});
  const [showCart, setShowCart] = useState(false);

  // Form — solo Nombre y Mensaje a gusto del invitado
  const [form, setForm] = useState({ guestName: '', message: '' });
  const [formErrors, setFormErrors] = useState<{ guestName?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Selected gift modal
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);

  const sortedGifts = useMemo(
    () => [...giftItems].filter((g) => g.active !== false).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [giftItems]
  );

  const cartEntries = useMemo<CartEntry[]>(
    () =>
      sortedGifts
        .filter((g) => cart[g.id] && cart[g.id] > 0)
        .map((g) => ({
          giftId: g.id,
          giftName: g.name,
          quantity: cart[g.id],
          amount: g.pricePerCup * cart[g.id],
          pricePerCup: g.pricePerCup,
        })),
    [cart, sortedGifts]
  );

  const totalAmount = cartEntries.reduce((s, e) => s + e.amount, 0);
  const totalItems = cartEntries.reduce((s, e) => s + e.quantity, 0);

  const setQuantity = useCallback(
    (gift: GiftItem, qty: number) => {
      if (qty <= 0) {
        setCart((p) => { const c = { ...p }; delete c[gift.id]; return c; });
      } else {
        setCart((p) => ({ ...p, [gift.id]: clamp(qty, 1, gift.availableCupos) }));
      }
    },
    []
  );

  // Validation: solo el nombre es necesario
  const validate = () => {
    const errors: { guestName?: string } = {};
    if (!form.guestName.trim()) errors.guestName = 'Por favor ingresa tu nombre';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (cartEntries.length === 0) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { checkoutUrl } = await initiateGiftPayment({
        guestName: form.guestName.trim(),
        email: 'invitado@boda.cl',
        message: form.message.trim(),
        items: cartEntries,
        totalAmount,
      });

      // Redirect to Mercado Pago checkout
      window.location.href = checkoutUrl;
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al procesar el pago. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearPaymentResult = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('payment_status');
    url.searchParams.delete('order_id');
    window.history.replaceState({}, '', url);
    setPaymentStatus(null);
    setReturnOrderId(null);
    setCart({});
    setForm({ guestName: '', message: '' });
  };

  // ── Payment result view ────────────────────────────────────────────────────
  if (paymentStatus) {
    return (
      <PaymentResultPage
        status={paymentStatus}
        orderId={returnOrderId}
        onBack={clearPaymentResult}
      />
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F4EC]">
        <div className="flex items-center gap-3 rounded-full border border-[#D8C29A] bg-white px-6 py-3 text-sm font-medium text-[#18243D] shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando regalos…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F4EC] px-4 py-10 text-[#18243D] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* ── Header ── */}
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#E8DFCF] shadow-sm">
            <Gift className="h-7 w-7 text-[#18243D]" />
          </div>
          <span className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#8D8741]">
            Lista de regalos simbólicos
          </span>
          <h1 className="font-serif-display text-4xl font-bold text-[#18243D] sm:text-5xl">
            Nuestra lista de novios
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#536078]">
            El mejor regalo es compartir este día con nosotros. Si desean acompañarnos en este nuevo
            comienzo, pueden colaborar con un regalo simbólico y elegir cuántos cupos aportar.
          </p>
        </div>

        {/* ── Trust badges ── */}
        <div className="mb-8 grid gap-4 rounded-[2rem] border border-[#D8C29A] bg-[#FBF8F1] p-5 shadow-sm md:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl bg-white p-4">
            <ShieldCheck className="h-5 w-5 shrink-0 text-[#18243D]" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#8D8741]">Seguridad</p>
              <p className="text-sm font-medium text-[#18243D]">Checkout seguro Mercado Pago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white p-4">
            <Heart className="h-5 w-5 shrink-0 text-[#18243D]" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#8D8741]">Cupos</p>
              <p className="text-sm font-medium text-[#18243D]">Reserva uno o varios cupos</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white p-4">
            <Sparkles className="h-5 w-5 shrink-0 text-[#18243D]" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#8D8741]">Pago digital</p>
              <p className="text-sm font-medium text-[#18243D]">Tarjeta, débito y más</p>
            </div>
          </div>
        </div>

        {/* ── Gift grid ── */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {sortedGifts.length === 0 ? (
            <div className="col-span-full py-16 text-center text-[#536078]">
              <Gift className="mx-auto mb-4 h-10 w-10 text-[#D8C29A]" />
              <p className="font-serif-display text-xl">Pronto agregaremos los regalos</p>
            </div>
          ) : (
            sortedGifts.map((gift) => {
              const qty = cart[gift.id] ?? 0;
              const isAgotado = gift.availableCupos === 0;
              return (
                <article
                  key={gift.id}
                  className="overflow-hidden rounded-[2rem] border border-[#D8C29A] bg-[#FBF8F1] shadow-sm transition hover:shadow-md"
                >
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={gift.imageUrl}
                      alt={gift.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#18243D]/25 to-transparent" />
                    {isAgotado && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#18243D]/50 backdrop-blur-[2px]">
                        <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#18243D]">
                          Cupos agotados
                        </span>
                      </div>
                    )}
                    {qty > 0 && (
                      <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#18243D] text-xs font-bold text-white shadow">
                        {qty}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="space-y-4 p-6">
                    <div>
                      <h2 className="font-serif-display text-2xl font-semibold text-[#18243D]">
                        {gift.name}
                      </h2>
                      <p className="mt-1 text-sm leading-relaxed text-[#536078]">
                        {gift.description}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#EEF3F0] p-3">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-[#536078]">
                        Monto por cupo
                      </p>
                      <p className="mt-0.5 text-2xl font-semibold text-[#18243D]">
                        {formatCLP(gift.pricePerCup)}
                      </p>
                    </div>

                    <CuposBar available={gift.availableCupos} total={gift.totalCupos} />

                    {/* Controls */}
                    <div className="flex items-center gap-3">
                      <QuantitySelector
                        value={qty}
                        max={gift.availableCupos}
                        onChange={(n) => setQuantity(gift, n)}
                      />
                      {qty > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedGift(gift)}
                          className="flex-1 rounded-full bg-[#18243D] py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#283653]"
                        >
                          Ver detalle
                        </button>
                      )}
                      {qty === 0 && !isAgotado && (
                        <button
                          type="button"
                          onClick={() => setQuantity(gift, 1)}
                          className="flex-1 rounded-full border border-[#18243D] py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#18243D] transition hover:bg-[#18243D] hover:text-white"
                        >
                          Agregar
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* ── Floating cart button (mobile) ── */}
        {cartEntries.length > 0 && !showCart && (
          <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 md:hidden">
            <button
              type="button"
              onClick={() => setShowCart(true)}
              className="flex items-center gap-3 rounded-full bg-[#18243D] px-6 py-3 text-sm font-semibold text-white shadow-xl"
            >
              <Gift className="h-4 w-4" />
              {totalItems} regalo{totalItems > 1 ? 's' : ''} · {formatCLP(totalAmount)}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ── Cart + Checkout form ── */}
        {cartEntries.length > 0 && (
          <div className="mt-10 rounded-[2rem] border border-[#D8C29A] bg-[#FBF8F1] p-6 shadow-sm md:p-8">
            {/* Cart header */}
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#8D8741]">Resumen</p>
                <h3 className="font-serif-display text-2xl text-[#18243D]">Tu selección</h3>
              </div>
              <span className="rounded-full bg-[#E8DFCF] px-3 py-1 text-sm font-semibold text-[#18243D]">
                {totalItems} cupo{totalItems > 1 ? 's' : ''}
              </span>
            </div>

            {/* Cart items */}
            <div className="mb-5 space-y-2">
              {cartEntries.map((entry) => (
                <div
                  key={entry.giftId}
                  className="flex items-center justify-between rounded-2xl bg-white p-3 text-sm text-[#18243D]"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{entry.giftName}</span>
                    <span className="text-[#536078]">×{entry.quantity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{formatCLP(entry.amount)}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setCart((p) => { const c = { ...p }; delete c[entry.giftId]; return c; })
                      }
                      className="rounded-full p-1 text-[#536078] hover:bg-[#E8DFCF] transition"
                      aria-label="Quitar del carrito"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mb-6 flex items-center justify-between rounded-2xl bg-[#E8DFCF] px-5 py-4">
              <span className="text-sm font-medium text-[#18243D]">Total</span>
              <span className="font-serif-display text-2xl font-semibold text-[#18243D]">
                {formatCLP(totalAmount)}
              </span>
            </div>

            {/* Checkout form — solo Nombre y Mensaje a gusto del invitado */}
            <form onSubmit={handlePayment} className="space-y-4" noValidate>
              <h4 className="font-serif-display text-lg text-[#18243D]">Tus datos</h4>

              <div>
                {/* Nombre */}
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#18243D]">
                    ¿Quién envía este regalo? (Tu nombre o familia) *
                  </span>
                  <input
                    type="text"
                    autoComplete="name"
                    value={form.guestName}
                    onChange={(e) => setForm({ ...form, guestName: e.target.value })}
                    placeholder="Ej: María Pérez o Familia Rodríguez Morales"
                    className={`mt-1.5 w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-[#18243D] ${
                      formErrors.guestName ? 'border-red-400' : 'border-[#D8C29A]'
                    }`}
                  />
                  {formErrors.guestName && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.guestName}
                    </p>
                  )}
                </label>
              </div>

              <div>
                {/* Mensaje */}
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#18243D]">
                    Mensaje o dedicatoria para los novios (opcional)
                  </span>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="¡Muchas felicidades en este gran paso! Con todo nuestro cariño…"
                    rows={3}
                    className="mt-1.5 w-full resize-none rounded-2xl border border-[#D8C29A] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#18243D]"
                  />
                </label>
              </div>

              {submitError && (
                <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Info MP */}
              <div className="flex items-start gap-3 rounded-2xl bg-[#EEF3F0] p-4 text-xs text-[#18243D]">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <strong className="block mb-0.5">Pago 100% seguro con Mercado Pago</strong>
                  <span className="text-[#536078]">
                    Al hacer clic en "Ir al pago", serás redirigido al entorno seguro de Mercado Pago
                    donde podrás pagar con tarjeta de crédito, débito y más medios de pago.
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#18243D] py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#283653] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Preparando pago…
                  </>
                ) : (
                  <>
                    Ir al pago · {formatCLP(totalAmount)}
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ── Gift detail modal ── */}
      {selectedGift && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#18243D]/60 backdrop-blur-sm sm:items-center"
          onClick={() => setSelectedGift(null)}
        >
          <div
            className="w-full max-w-md rounded-t-[2rem] bg-[#FBF8F1] p-6 shadow-2xl sm:rounded-[2rem]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#8D8741]">Regalo seleccionado</p>
                <h3 className="font-serif-display text-2xl text-[#18243D]">{selectedGift.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGift(null)}
                className="rounded-full bg-[#E8DFCF] p-2 text-[#18243D]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <img
              src={selectedGift.imageUrl}
              alt={selectedGift.name}
              className="mb-4 h-44 w-full rounded-2xl object-cover"
            />

            <p className="mb-4 text-sm leading-relaxed text-[#536078]">{selectedGift.description}</p>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#EEF3F0] p-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#536078]">Por cupo</p>
                <p className="mt-0.5 text-xl font-semibold text-[#18243D]">
                  {formatCLP(selectedGift.pricePerCup)}
                </p>
              </div>
              <div className="rounded-2xl bg-[#E8DFCF] p-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#536078]">Tu aporte</p>
                <p className="mt-0.5 text-xl font-semibold text-[#18243D]">
                  {formatCLP(selectedGift.pricePerCup * (cart[selectedGift.id] ?? 1))}
                </p>
              </div>
            </div>

            <div className="mb-5 flex items-center justify-between">
              <span className="text-sm text-[#536078]">Cupos seleccionados:</span>
              <QuantitySelector
                value={cart[selectedGift.id] ?? 1}
                max={selectedGift.availableCupos}
                onChange={(n) => setQuantity(selectedGift, n)}
              />
            </div>

            <button
              type="button"
              onClick={() => setSelectedGift(null)}
              className="w-full rounded-full bg-[#18243D] py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#283653]"
            >
              Listo — ver mi selección
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
