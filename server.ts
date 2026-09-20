/**
 * server.ts — Backend seguro para Lista de Regalos
 * Bárbara & Daniel 2026
 *
 * Endpoints:
 *   POST /api/gifts/create-preference  → Crea preferencia de pago en Mercado Pago
 *   POST /api/gifts/mp-webhook         → Recibe notificación de pago de MP
 *   GET  /api/gifts/status/:orderId    → Consulta estado de una orden
 *   GET  /api/gifts/catalog            → Catálogo público de regalos
 *   GET  /health                       → Health check
 */

import express, { Request, Response, NextFunction } from 'express';
import { createHmac } from 'crypto';
import * as nodemailer from 'nodemailer';
import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ─── ENV ─────────────────────────────────────────────────────────────────────
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const {
  MP_ACCESS_TOKEN,
  MP_WEBHOOK_SECRET,
  GMAIL_USER,
  GMAIL_APP_PASSWORD,
  NOTIFICATION_EMAIL,
  FIREBASE_DATABASE_URL,
  ALLOWED_ORIGINS,
  PORT,
  NODE_ENV,
} = process.env;

// Validate required env vars on startup
const REQUIRED_ENV = ['MP_ACCESS_TOKEN', 'FIREBASE_DATABASE_URL'];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`❌ Variables de entorno faltantes: ${missing.join(', ')}`);
  process.exit(1);
}

// ─── FIREBASE ADMIN ───────────────────────────────────────────────────────────
// Se inicializa una sola vez. Usa el JSON de la cuenta de servicio si está
// definido (obligatorio en Render/Railway); si no, cae a Application Default
// Credentials (solo funciona en entornos GCP como Cloud Run).
if (!getApps().length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      initializeApp({
        credential: cert(serviceAccount),
        databaseURL: FIREBASE_DATABASE_URL,
      });
    } else {
      console.warn(
        '⚠️  FIREBASE_SERVICE_ACCOUNT_JSON no está configurado. Se usará Application ' +
          'Default Credentials, que NO funciona en Render/Railway y hará que las ' +
          'peticiones a la base de datos se cuelguen. Configura esa variable en el ' +
          'panel del backend con el JSON de la cuenta de servicio de Firebase.'
      );
      initializeApp({
        credential: applicationDefault(),
        databaseURL: FIREBASE_DATABASE_URL,
      });
    }
    console.log('✅ Firebase Admin inicializado');
  } catch (err) {
    console.error('❌ Error inicializando Firebase Admin:', err);
    process.exit(1);
  }
}

const db = getDatabase();

/** Evita que una llamada a Firebase se cuelgue indefinidamente (p. ej. si las
 * credenciales no son válidas). Lanza un error claro tras `ms` milisegundos. */
function withTimeout<T>(promise: Promise<T>, label: string, ms = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `Tiempo de espera agotado (${label}). Verifica FIREBASE_SERVICE_ACCOUNT_JSON en el backend.`
            )
          ),
        ms
      )
    ),
  ]);
}


// ─── MERCADO PAGO ─────────────────────────────────────────────────────────────
const mpClient = new MercadoPagoConfig({
  accessToken: MP_ACCESS_TOKEN!,
  options: { timeout: 10000 },
});

const preferenceClient = new Preference(mpClient);
const paymentClient = new Payment(mpClient);

// ─── NODEMAILER ───────────────────────────────────────────────────────────────
const mailer = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

// ─── EXPRESS ──────────────────────────────────────────────────────────────────
const app = express();

// CORS seguro
const allowedOrigins = ALLOWED_ORIGINS
  ? ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:3000'];

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Idempotency-Key');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

// Seguridad básica de cabeceras
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// IMPORTANT: webhook de MP necesita body crudo para verificar firma
app.use('/api/gifts/mp-webhook', express.raw({ type: 'application/json' }));

// Resto usa JSON parseado
app.use(express.json({ limit: '16kb' }));

// ─── TIPOS ────────────────────────────────────────────────────────────────────
interface CartItem {
  giftId: string;
  giftName: string;
  quantity: number;
  amount: number;
}

interface GiftItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  pricePerCup: number;
  totalCupos: number;
  availableCupos: number;
  active: boolean;
  sortOrder?: number;
  goalAmount?: number;
  currentAmount?: number;
}

interface GiftOrder {
  id: string;
  guestName: string;
  email: string;
  phone?: string;
  message?: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'cancelled';
  preferenceId?: string;
  mpPaymentId?: string;
  mpOrderId?: string;
  paidAt?: string;
  createdAt: string;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/**
 * Verifica firma HMAC del webhook de Mercado Pago.
 * https://www.mercadopago.cl/developers/es/docs/your-integrations/notifications/webhooks
 */
function verifyMpSignature(req: Request, rawBody: Buffer): boolean {
  if (!MP_WEBHOOK_SECRET) {
    // En desarrollo sin secret, solo loguear y permitir
    console.warn('⚠️  MP_WEBHOOK_SECRET no configurado — saltando verificación de firma');
    return true;
  }

  try {
    const xSignature = req.headers['x-signature'] as string | undefined;
    const xRequestId = req.headers['x-request-id'] as string | undefined;

    if (!xSignature) return false;

    // Parsear ts y v1 del header
    const parts = Object.fromEntries(xSignature.split(',').map((p) => p.trim().split('=')));
    const ts = parts['ts'];
    const v1 = parts['v1'];

    if (!ts || !v1) return false;

    const manifest = `id:${req.query['data.id'] ?? ''};request-id:${xRequestId ?? ''};ts:${ts};`;
    const hmac = createHmac('sha256', MP_WEBHOOK_SECRET).update(manifest).digest('hex');

    return hmac === v1;
  } catch {
    return false;
  }
}

/**
 * Envía email de notificación al par de novios.
 */
async function sendNotificationEmail(order: GiftOrder): Promise<void> {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD || !NOTIFICATION_EMAIL) {
    console.warn('⚠️  Email no configurado — saltando notificación');
    return;
  }

  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e8dfcf;">${item.giftName}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e8dfcf;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e8dfcf;text-align:right;">
            ${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(item.amount)}
          </td>
        </tr>`
    )
    .join('');

  const totalFormatted = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(order.totalAmount);

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f8f4ec;font-family:Georgia,serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:24px;overflow:hidden;border:1px solid #d8c29a;">
    <!-- Header -->
    <div style="background:#18243d;padding:32px 40px;text-align:center;">
      <p style="color:#d8c29a;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 8px;">Bárbara &amp; Daniel · 2026</p>
      <h1 style="color:#fff;font-size:24px;margin:0;font-weight:400;">🎁 Nuevo Regalo Recibido</h1>
    </div>
    <!-- Body -->
    <div style="padding:32px 40px;">
      <p style="color:#536078;font-size:14px;margin:0 0 24px;">
        Un invitado acaba de completar su aporte en la lista de regalos.
      </p>
      <!-- Guest info -->
      <div style="background:#fbf8f1;border-radius:16px;padding:20px;margin-bottom:24px;border:1px solid #e8dfcf;">
        <table style="width:100%;font-size:13px;color:#18243d;border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0;color:#536078;font-size:11px;text-transform:uppercase;letter-spacing:0.2em;">Invitado</td>
            <td style="padding:6px 0;font-weight:bold;text-align:right;">${order.guestName}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#536078;font-size:11px;text-transform:uppercase;letter-spacing:0.2em;">Correo</td>
            <td style="padding:6px 0;text-align:right;">${order.email}</td>
          </tr>
          ${order.phone ? `<tr><td style="padding:6px 0;color:#536078;font-size:11px;text-transform:uppercase;letter-spacing:0.2em;">Teléfono</td><td style="padding:6px 0;text-align:right;">${order.phone}</td></tr>` : ''}
          ${order.message ? `<tr><td colspan="2" style="padding:12px 0 6px;"><p style="margin:0;background:#e8dfcf;border-radius:12px;padding:12px 16px;font-style:italic;color:#18243d;font-size:13px;">"${order.message}"</p></td></tr>` : ''}
        </table>
      </div>
      <!-- Items table -->
      <h3 style="color:#18243d;font-size:13px;text-transform:uppercase;letter-spacing:0.2em;margin:0 0 12px;">Regalos seleccionados</h3>
      <table style="width:100%;border-collapse:collapse;font-size:13px;color:#18243d;">
        <thead>
          <tr style="background:#e8dfcf;">
            <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;">Regalo</th>
            <th style="padding:8px 12px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;">Cupos</th>
            <th style="padding:8px 12px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;">Monto</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr style="background:#18243d;">
            <td colspan="2" style="padding:10px 12px;color:#d8c29a;font-size:11px;text-transform:uppercase;letter-spacing:0.2em;">Total pagado</td>
            <td style="padding:10px 12px;color:#fff;font-weight:bold;text-align:right;font-size:16px;">${totalFormatted}</td>
          </tr>
        </tfoot>
      </table>
      <!-- Payment info -->
      <div style="margin-top:20px;padding:12px 16px;background:#eef3f0;border-radius:12px;font-size:12px;color:#536078;">
        <strong style="color:#18243d;">Pago confirmado por Mercado Pago</strong><br/>
        ID: ${order.mpPaymentId ?? 'N/A'} · Fecha: ${order.paidAt ? new Date(order.paidAt).toLocaleString('es-CL') : 'Ahora'}
      </div>
    </div>
    <!-- Footer -->
    <div style="padding:20px 40px;border-top:1px solid #e8dfcf;text-align:center;">
      <p style="margin:0;font-size:11px;color:#8d8741;letter-spacing:0.2em;text-transform:uppercase;">Bárbara &amp; Daniel · 12 Diciembre 2026</p>
    </div>
  </div>
</body>
</html>`;

  await mailer.sendMail({
    from: `"Lista de Regalos B&D" <${GMAIL_USER}>`,
    to: NOTIFICATION_EMAIL,
    subject: `🎁 Regalo recibido de ${order.guestName} — ${totalFormatted}`,
    html,
  });

  console.log(`📧 Email de notificación enviado para orden ${order.id}`);
}

// ─── ROUTES ──────────────────────────────────────────────────────────────────

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: NODE_ENV ?? 'development',
  });
});

/**
 * GET /api/gifts/catalog
 * Catálogo público de regalos activos.
 */
app.get('/api/gifts/catalog', async (_req: Request, res: Response) => {
  try {
    const snap = await withTimeout(db.ref('giftCatalog').once('value'), 'lectura de catálogo');
    const val = snap.val() as Record<string, GiftItem> | null;

    if (!val) {
      res.json({ gifts: [] });
      return;
    }

    const gifts = Object.entries(val)
      .map(([id, g]) => ({ ...g, id }))
      .filter((g) => g.active)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    res.json({ gifts });
  } catch (err) {
    console.error('Error obteniendo catálogo:', err);
    res.status(500).json({ error: 'Error obteniendo catálogo' });
  }
});

// Rate limiter en memoria para prevenir spam o abusos en la creación de pagos
const ipRateMap = new Map<string, { count: number; resetTime: number }>();
const preferenceRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 5 * 60 * 1000; // 5 minutos
  const maxRequests = 20;

  const record = ipRateMap.get(ip);
  if (!record || now > record.resetTime) {
    ipRateMap.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (record.count >= maxRequests) {
    res.status(429).json({ error: 'Has realizado demasiados intentos. Por favor espera unos minutos.' });
    return;
  }

  record.count++;
  next();
};

/**
 * POST /api/gifts/create-preference
 * Body: { orderId, guestName, email, phone, message, items, totalAmount }
 * 1. Valida que hay cupos disponibles
 * 2. Crea/actualiza la orden en Firebase con status 'pending'
 * 3. Crea una Preference en Mercado Pago
 * 4. Retorna { preferenceId, initPoint, sandboxInitPoint }
 */
app.post('/api/gifts/create-preference', preferenceRateLimiter, async (req: Request, res: Response) => {
  try {
    const {
      orderId,
      guestName,
      email,
      phone,
      message,
      items,
      totalAmount,
    }: {
      orderId: string;
      guestName: string;
      email: string;
      phone?: string;
      message?: string;
      items: CartItem[];
      totalAmount: number;
    } = req.body;

    // ── Validar campos requeridos ──────────────────────────────────────────
    if (!orderId || !guestName?.trim() || !items?.length || !totalAmount) {
      res.status(400).json({ error: 'Datos de orden incompletos' });
      return;
    }

    const guestEmail = (email?.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      ? email.trim().toLowerCase()
      : 'invitado@boda.cl';

    // ── Validar cupos disponibles ──────────────────────────────────────────
    const catalogSnap = await withTimeout(db.ref('giftCatalog').once('value'), 'validación de cupos');
    const catalog = catalogSnap.val() as Record<string, GiftItem> | null;

    if (!catalog) {
      res.status(400).json({ error: 'Catálogo de regalos no disponible' });
      return;
    }

    for (const item of items) {
      const gift = catalog[item.giftId];
      if (!gift) {
        res.status(400).json({ error: `Regalo no encontrado: ${item.giftId}` });
        return;
      }
      if (!gift.active) {
        res.status(400).json({ error: `El regalo "${gift.name}" no está disponible` });
        return;
      }
      if (gift.availableCupos < item.quantity) {
        res.status(409).json({
          error: `Solo quedan ${gift.availableCupos} cupos disponibles para "${gift.name}"`,
        });
        return;
      }
      // Validate amount integrity (prevent price tampering)
      const expectedAmount = gift.pricePerCup * item.quantity;
      if (Math.abs(item.amount - expectedAmount) > 1) {
        res.status(400).json({ error: `Monto incorrecto para "${gift.name}"` });
        return;
      }
    }

    // ── Guardar orden en Firebase (status pending) ─────────────────────────
    const order: GiftOrder = {
      id: orderId,
      guestName: guestName.trim(),
      email: guestEmail,
      phone: phone?.trim(),
      message: message?.trim(),
      items,
      totalAmount,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await withTimeout(db.ref(`giftOrders/${orderId}`).set(order), 'guardado de orden');

    // ── Crear Preference en Mercado Pago ──────────────────────────────────
    const appBaseUrl = req.headers.origin || allowedOrigins[0];

    const mpItems = items.map((item) => ({
      id: item.giftId,
      title: item.giftName,
      description: `${item.quantity} cupo${item.quantity > 1 ? 's' : ''} — Lista de regalos Bárbara & Daniel`,
      quantity: item.quantity,
      unit_price: Math.round(item.amount / item.quantity), // price per unit in CLP
      currency_id: 'CLP',
    }));

    const preference = await preferenceClient.create({
      body: {
        items: mpItems,
        payer: {
          name: guestName.trim(),
          email: guestEmail,
        },
        back_urls: {
          success: `${appBaseUrl}/?page=regalos&payment_status=approved&order_id=${orderId}`,
          failure: `${appBaseUrl}/?page=regalos&payment_status=failed&order_id=${orderId}`,
          pending: `${appBaseUrl}/?page=regalos&payment_status=pending&order_id=${orderId}`,
        },
        auto_return: 'approved',
        notification_url: `${process.env.BACKEND_URL ?? appBaseUrl}/api/gifts/mp-webhook`,
        external_reference: orderId,
        statement_descriptor: 'BODA B&D 2026',
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
      },
    });

    // Guardar preferenceId en la orden
    await withTimeout(
      db.ref(`giftOrders/${orderId}/preferenceId`).set(preference.id),
      'guardado de preferenceId'
    );

    res.json({
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
    });

    console.log(`✅ Preference creada para orden ${orderId}: ${preference.id}`);
  } catch (err) {
    console.error('Error creando preference MP:', err);
    res.status(500).json({ error: 'Error procesando el pago. Intenta nuevamente.' });
  }
});

/**
 * POST /api/gifts/mp-webhook
 * Recibe notificaciones de Mercado Pago (IPN / Webhooks).
 * Verifica firma HMAC, consulta el pago, actualiza Firebase, descuenta cupos, envía email.
 */
app.post('/api/gifts/mp-webhook', async (req: Request, res: Response) => {
  // Responder 200 rápido para que MP no reintente (procesamos async)
  res.sendStatus(200);

  const rawBody = req.body as Buffer;

  // Verificar firma
  if (!verifyMpSignature(req, rawBody)) {
    console.warn('⚠️  Webhook con firma inválida descartado');
    return;
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody.toString());
  } catch {
    console.warn('⚠️  Webhook con body inválido');
    return;
  }

  // Solo nos interesan eventos de pago aprobado
  const type = payload.type as string | undefined;
  const action = payload.action as string | undefined;

  if (type !== 'payment' && action !== 'payment.updated') {
    return;
  }

  const dataId = (payload.data as Record<string, unknown>)?.id as string | number | undefined;
  if (!dataId) return;

  try {
    // Consultar el pago en la API de MP
    const paymentData = await paymentClient.get({ id: Number(dataId) });

    if (paymentData.status !== 'approved') {
      console.log(`ℹ️  Pago ${dataId} status: ${paymentData.status} — ignorado`);
      return;
    }

    const orderId = paymentData.external_reference;
    if (!orderId) {
      console.warn('⚠️  Pago sin external_reference — no se puede vincular a orden');
      return;
    }

    // Leer la orden actual
    const orderSnap = await withTimeout(db.ref(`giftOrders/${orderId}`).once('value'), 'lectura de orden (webhook)');
    const order = orderSnap.val() as GiftOrder | null;

    if (!order) {
      console.warn(`⚠️  Orden ${orderId} no encontrada en Firebase`);
      return;
    }

    if (order.status === 'paid') {
      console.log(`ℹ️  Orden ${orderId} ya está pagada — ignorando duplicado`);
      return;
    }

    const paidAt = new Date().toISOString();

    // Actualizar la orden a 'paid'
    await withTimeout(
      db.ref(`giftOrders/${orderId}`).update({
        status: 'paid',
        mpPaymentId: String(dataId),
        mpOrderId: String(paymentData.order?.id ?? ''),
        paidAt,
      }),
      'actualización de orden a pagada'
    );

    // Descontar cupos de cada regalo (transacción atómica)
    for (const item of order.items) {
      await withTimeout(
        db.ref(`giftCatalog/${item.giftId}`).transaction((current: GiftItem | null) => {
          if (!current) return current;
          const newAvailable = Math.max(0, (current.availableCupos ?? 0) - item.quantity);
          const newCurrent = (current.currentAmount ?? 0) + item.amount;
          return {
            ...current,
            availableCupos: newAvailable,
            currentAmount: newCurrent,
          };
        }),
        `descuento de cupos (${item.giftId})`
      );
    }

    console.log(`✅ Orden ${orderId} marcada como pagada. Cupos descontados.`);

    // Enviar email de notificación
    const updatedOrder: GiftOrder = {
      ...order,
      status: 'paid',
      mpPaymentId: String(dataId),
      paidAt,
    };

    await sendNotificationEmail(updatedOrder);
  } catch (err) {
    console.error('Error procesando webhook MP:', err);
  }
});

/**
 * GET /api/gifts/status/:orderId
 * Consulta el estado de una orden por su ID.
 */
app.get('/api/gifts/status/:orderId', async (req: Request, res: Response) => {
  const { orderId } = req.params;

  // Sanitize: solo letras, números y guiones
  if (!/^[a-zA-Z0-9_-]+$/.test(orderId)) {
    res.status(400).json({ error: 'ID de orden inválido' });
    return;
  }

  try {
    const snap = await withTimeout(db.ref(`giftOrders/${orderId}`).once('value'), 'consulta de estado de orden');
    const order = snap.val() as GiftOrder | null;

    if (!order) {
      res.status(404).json({ error: 'Orden no encontrada' });
      return;
    }

    // Solo devolvemos campos no sensibles al frontend
    res.json({
      id: order.id,
      status: order.status,
      guestName: order.guestName,
      totalAmount: order.totalAmount,
      items: order.items,
      paidAt: order.paidAt,
      createdAt: order.createdAt,
    });
  } catch (err) {
    console.error('Error consultando estado de orden:', err);
    res.status(500).json({ error: 'Error consultando la orden' });
  }
});

// ─── SERVIR FRONTEND ─────────────────────────────────────────────────────────
// En producción, servimos el build de Vite desde /dist
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ─── START ───────────────────────────────────────────────────────────────────
const port = parseInt(PORT ?? '3001', 10);
app.listen(port, () => {
  console.log(`🚀 Server escuchando en puerto ${port} [${NODE_ENV ?? 'development'}]`);
  console.log(`   MP Access Token: ${MP_ACCESS_TOKEN ? '***configurado***' : '❌ NO CONFIGURADO'}`);
  console.log(`   Firebase DB: ${FIREBASE_DATABASE_URL}`);
  console.log(`   Email: ${NOTIFICATION_EMAIL ?? '⚠️  no configurado'}`);
});

export default app;

