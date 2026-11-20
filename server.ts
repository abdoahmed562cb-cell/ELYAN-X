import crypto from 'crypto';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { INITIAL_REVIEWS, PRODUCTS } from './src/data/catalog.ts';
import type { OrderRecord, PaymentMethodId, PaymentProviderInfo, Review } from './src/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const STORE_PATH = path.resolve(DATA_DIR, 'store.json');

const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

interface StoredUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  salt: string;
  passwordHash: string;
  createdAt: string;
}

interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
}

interface StoreData {
  users: StoredUser[];
  orders: OrderRecord[];
  wishlists: Record<string, string[]>;
  reviews: Record<string, Review[]>;
  inquiries: ContactInquiry[];
}

function createSeedOrders(): OrderRecord[] {
  return [
    {
      orderNumber: 'ELX-2026-1042',
      customerName: 'Karim El-Masry',
      customerEmail: 'karim.sample@elyanx.example',
      customerPhone: '+201000000001',
      address: '14 Nile Corniche Tower',
      city: 'Cairo',
      postalCode: '11511',
      items: [
        {
          productId: 'elx-aud-01',
          name: 'ELYAN Acoustic Planar Studio One',
          variant: 'Obsidian Matte',
          quantity: 1,
          unitPrice: 649,
          image: '/src/assets/images/cat_electronics_audio_1795199835823.jpg',
        },
      ],
      subtotal: 649,
      shipping: 0,
      total: 649,
      paymentMethod: 'cod',
      paymentMethodLabel: 'Cash on Delivery',
      paymentStatus: 'Pending Collection',
      orderStatus: 'In Transit',
      trackingSteps: [
        {
          title: 'Order Confirmed',
          detail: 'Order verified and assigned to ELYAN X fulfillment hub.',
          completed: true,
          timestamp: '2026-11-18 09:15',
        },
        {
          title: 'Quality Inspection',
          detail: 'Serial seal and acoustic calibration checklist passed.',
          completed: true,
          timestamp: '2026-11-18 14:40',
        },
        {
          title: 'In Transit',
          detail: 'Out with priority armored courier for Cairo metropolitan delivery.',
          completed: true,
          timestamp: '2026-11-19 10:05',
        },
        {
          title: 'Delivered',
          detail: 'Awaiting recipient signature and COD verification.',
          completed: false,
        },
      ],
      createdAt: '2026-11-18T09:15:00Z',
    },
    {
      orderNumber: 'ELX-2026-1089',
      customerName: 'Nadia Hassan',
      customerEmail: 'nadia.sample@elyanx.example',
      customerPhone: '+201000000002',
      address: '88 Zamalek Boulevard',
      city: 'Giza',
      postalCode: '12611',
      items: [
        {
          productId: 'elx-wat-10',
          name: 'Chronos Skeleton Titanium Chronograph',
          variant: 'Fluoroelastomer Strap',
          quantity: 1,
          unitPrice: 1680,
          image: '/src/assets/images/cat_watches_chronograph_1795199836186.jpg',
        },
      ],
      subtotal: 1680,
      shipping: 0,
      total: 1680,
      paymentMethod: 'cod',
      paymentMethodLabel: 'Cash on Delivery',
      paymentStatus: 'Pending Collection',
      orderStatus: 'Preparing Shipment',
      trackingSteps: [
        {
          title: 'Order Confirmed',
          detail: 'Order logged and inventory allocated.',
          completed: true,
          timestamp: '2026-11-20 08:10',
        },
        {
          title: 'Quality Inspection',
          detail: 'Chronograph accuracy and sapphire seal inspection underway.',
          completed: true,
          timestamp: '2026-11-20 10:00',
        },
        {
          title: 'In Transit',
          detail: 'Scheduled for dispatch with ELYAN Express.',
          completed: false,
        },
        {
          title: 'Delivered',
          detail: 'Pending delivery completion.',
          completed: false,
        },
      ],
      createdAt: '2026-11-20T08:10:00Z',
    },
  ];
}

function loadStore(): StoreData {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (fs.existsSync(STORE_PATH)) {
    try {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<StoreData>;
      return {
        users: Array.isArray(parsed.users) ? parsed.users : [],
        orders: Array.isArray(parsed.orders) ? parsed.orders : createSeedOrders(),
        wishlists: parsed.wishlists && typeof parsed.wishlists === 'object' ? parsed.wishlists : {},
        reviews: parsed.reviews && typeof parsed.reviews === 'object' ? parsed.reviews : INITIAL_REVIEWS,
        inquiries: Array.isArray(parsed.inquiries) ? parsed.inquiries : [],
      };
    } catch {
      // Fallback to fresh store if file is unreadable
    }
  }
  const initial: StoreData = {
    users: [],
    orders: createSeedOrders(),
    wishlists: {},
    reviews: INITIAL_REVIEWS,
    inquiries: [],
  };
  saveStore(initial);
  return initial;
}

function saveStore(data: StoreData): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpPath = `${STORE_PATH}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmpPath, STORE_PATH);
}

const store = loadStore();

function hashPassword(password: string, salt?: string): { salt: string; hash: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, actualSalt, 64).toString('hex');
  return { salt: actualSalt, hash: derived };
}

function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  const derived = crypto.scryptSync(password, salt, 64);
  const target = Buffer.from(storedHash, 'hex');
  if (derived.length !== target.length) return false;
  return crypto.timingSafeEqual(derived, target);
}

function signToken(payload: { userId: string; email: string }): string {
  const body = Buffer.from(
    JSON.stringify({
      userId: payload.userId,
      email: payload.email,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
    })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verifyToken(token: string): { userId: string; email: string } | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  try {
    const decoded = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8')) as {
      userId: string;
      email: string;
      exp: number;
    };
    if (!decoded.userId || !decoded.exp || decoded.exp < Date.now()) {
      return null;
    }
    return { userId: decoded.userId, email: decoded.email };
  } catch {
    return null;
  }
}

interface AuthedRequest extends Request {
  authUser?: StoredUser;
}

function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    const token = header.slice(7).trim();
    const verified = verifyToken(token);
    if (verified) {
      const user = store.users.find((u) => u.id === verified.userId);
      if (user) {
        req.authUser = user;
      }
    }
  }
  next();
}

function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  optionalAuth(req, res, () => {
    if (!req.authUser) {
      res.status(401).json({ error: 'Authentication required. Please sign in.' });
      return;
    }
    next();
  });
}

function getPaymentProviders(): PaymentProviderInfo[] {
  const hasPaymob = Boolean(process.env.PAYMOB_API_KEY);
  const hasCardGateway = hasPaymob && Boolean(process.env.PAYMOB_CARD_INTEGRATION_ID);
  const hasMeezaGateway = hasPaymob && Boolean(process.env.PAYMOB_MEEZA_INTEGRATION_ID);
  const hasWalletGateway = hasPaymob && Boolean(process.env.PAYMOB_WALLET_INTEGRATION_ID);
  const hasInstaPay = Boolean(process.env.INSTAPAY_MERCHANT_HANDLE);
  const hasBankTransfer = Boolean(process.env.BANK_TRANSFER_IBAN);

  return [
    {
      id: 'cod',
      name: 'Cash on Delivery',
      category: 'Cash',
      active: true,
      providerName: 'ELYAN X Courier Verification',
      instructions:
        'Pay in cash upon courier arrival after inspecting the sealed package. Free delivery on orders over $250.',
      configurationHint: 'Active by default — no external gateway credentials required.',
    },
    {
      id: 'visa',
      name: 'Visa',
      category: 'Card',
      active: hasCardGateway,
      providerName: 'Paymob Card Gateway',
      instructions:
        '3D Secure encrypted Visa debit & credit card checkout with instant authorization.',
      configurationHint: 'Configure PAYMOB_API_KEY and PAYMOB_CARD_INTEGRATION_ID in server Secrets to activate.',
    },
    {
      id: 'mastercard',
      name: 'Mastercard',
      category: 'Card',
      active: hasCardGateway,
      providerName: 'Paymob Card Gateway',
      instructions:
        'Encrypted Mastercard Identity Check processing for local and international cards.',
      configurationHint: 'Configure PAYMOB_API_KEY and PAYMOB_CARD_INTEGRATION_ID in server Secrets to activate.',
    },
    {
      id: 'meeza',
      name: 'Meeza',
      category: 'Card',
      active: hasMeezaGateway,
      providerName: 'Meeza Digital Network',
      instructions:
        'Direct Egyptian national Meeza card and Meeza QR checkout with bank-grade OTP verification.',
      configurationHint: 'Configure PAYMOB_API_KEY and PAYMOB_MEEZA_INTEGRATION_ID in server Secrets to activate.',
    },
    {
      id: 'vodafone_cash',
      name: 'Vodafone Cash',
      category: 'Mobile Wallet',
      active: hasWalletGateway,
      providerName: 'Mobile Wallet Aggregator',
      instructions:
        'Enter your Vodafone Cash wallet number to receive an instant USSD/App PIN confirmation prompt.',
      configurationHint: 'Configure PAYMOB_API_KEY and PAYMOB_WALLET_INTEGRATION_ID in server Secrets to activate.',
    },
    {
      id: 'orange_cash',
      name: 'Orange Cash',
      category: 'Mobile Wallet',
      active: hasWalletGateway,
      providerName: 'Mobile Wallet Aggregator',
      instructions:
        'Authorize payment directly from your Orange Cash mobile wallet using your secure wallet PIN.',
      configurationHint: 'Configure PAYMOB_API_KEY and PAYMOB_WALLET_INTEGRATION_ID in server Secrets to activate.',
    },
    {
      id: 'etisalat_cash',
      name: 'Etisalat Cash',
      category: 'Mobile Wallet',
      active: hasWalletGateway,
      providerName: 'Mobile Wallet Aggregator',
      instructions:
        'Complete checkout via Etisalat Cash e-wallet approval notification on your registered line.',
      configurationHint: 'Configure PAYMOB_API_KEY and PAYMOB_WALLET_INTEGRATION_ID in server Secrets to activate.',
    },
    {
      id: 'we_pay',
      name: 'WE Pay',
      category: 'Mobile Wallet',
      active: hasWalletGateway,
      providerName: 'Mobile Wallet Aggregator',
      instructions:
        'Confirm order total securely through your WE Pay digital wallet application.',
      configurationHint: 'Configure PAYMOB_API_KEY and PAYMOB_WALLET_INTEGRATION_ID in server Secrets to activate.',
    },
    {
      id: 'instapay',
      name: 'InstaPay',
      category: 'Instant Transfer',
      active: hasInstaPay,
      providerName: 'IPN Instant Payment Network',
      instructions:
        'Instant 24/7 bank-to-bank IPA transfer. Reference your ELYAN X Order Number in transfer notes.',
      configurationHint: 'Configure INSTAPAY_MERCHANT_HANDLE in server Secrets to activate.',
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      category: 'Instant Transfer',
      active: hasBankTransfer,
      providerName: 'Direct Corporate Wire / IBAN',
      instructions:
        'Wire order total to ELYAN X corporate IBAN and share the transfer receipt with +201224595007.',
      configurationHint: 'Configure BANK_TRANSFER_IBAN in server Secrets to activate.',
    },
  ];
}

function sanitizeText(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, brand: 'ELYAN X' });
  });

  app.get('/api/payment-providers', (_req, res) => {
    res.json({ providers: getPaymentProviders() });
  });

  app.post('/api/auth/register', (req, res) => {
    const name = sanitizeText(req.body?.name, 80);
    const email = sanitizeText(req.body?.email, 120).toLowerCase();
    const phone = sanitizeText(req.body?.phone, 32);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (name.length < 2) {
      res.status(400).json({ error: 'Please enter your full name (at least 2 characters).' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters.' });
      return;
    }
    if (store.users.some((u) => u.email === email)) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const { salt, hash } = hashPassword(password);
    const user: StoredUser = {
      id: `usr_${crypto.randomBytes(8).toString('hex')}`,
      name,
      email,
      phone,
      salt,
      passwordHash: hash,
      createdAt: new Date().toISOString(),
    };
    store.users.push(user);
    saveStore(store);

    const token = signToken({ userId: user.id, email: user.email });
    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const email = sanitizeText(req.body?.email, 120).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    const user = store.users.find((u) => u.email === email);
    if (!user || !verifyPassword(password, user.salt, user.passwordHash)) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email });
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    });
  });

  app.get('/api/auth/me', requireAuth, (req: AuthedRequest, res) => {
    const user = req.authUser!;
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    });
  });

  app.get('/api/wishlist', requireAuth, (req: AuthedRequest, res) => {
    const items = store.wishlists[req.authUser!.id] || [];
    res.json({ productIds: items });
  });

  app.post('/api/wishlist', requireAuth, (req: AuthedRequest, res) => {
    const productId = sanitizeText(req.body?.productId, 60);
    if (!PRODUCTS.some((p) => p.id === productId)) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }
    const uid = req.authUser!.id;
    const current = new Set(store.wishlists[uid] || []);
    if (current.has(productId)) {
      current.delete(productId);
    } else {
      current.add(productId);
    }
    store.wishlists[uid] = Array.from(current);
    saveStore(store);
    res.json({ productIds: store.wishlists[uid] });
  });

  app.get('/api/orders', requireAuth, (req: AuthedRequest, res) => {
    const userOrders = store.orders.filter(
      (o) => o.userId === req.authUser!.id || o.customerEmail.toLowerCase() === req.authUser!.email.toLowerCase()
    );
    res.json({ orders: userOrders });
  });

  app.get('/api/orders/track/:orderNumber', (req, res) => {
    const orderNumber = sanitizeText(req.params.orderNumber, 40).toUpperCase();
    const order = store.orders.find((o) => o.orderNumber.toUpperCase() === orderNumber);
    if (!order) {
      res.status(404).json({ error: `Order ${orderNumber} was not found.` });
      return;
    }
    res.json({ order });
  });

  app.post('/api/orders', optionalAuth, (req: AuthedRequest, res) => {
    const customerName = sanitizeText(req.body?.customerName, 100);
    const customerEmail = sanitizeText(req.body?.customerEmail, 120).toLowerCase();
    const customerPhone = sanitizeText(req.body?.customerPhone, 32);
    const address = sanitizeText(req.body?.address, 200);
    const city = sanitizeText(req.body?.city, 80);
    const postalCode = sanitizeText(req.body?.postalCode, 24);
    const paymentMethod = sanitizeText(req.body?.paymentMethod, 32) as PaymentMethodId;
    const rawItems = Array.isArray(req.body?.items) ? req.body.items : [];

    if (customerName.length < 2 || !customerPhone || !address || !city || !postalCode) {
      res.status(400).json({ error: 'Please complete all required shipping and verification fields.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      res.status(400).json({ error: 'Please provide a valid email address for order updates.' });
      return;
    }
    if (rawItems.length === 0) {
      res.status(400).json({ error: 'Your shopping bag is empty.' });
      return;
    }

    const providers = getPaymentProviders();
    const selectedProvider = providers.find((p) => p.id === paymentMethod);
    if (!selectedProvider) {
      res.status(400).json({ error: 'Unsupported payment method.' });
      return;
    }
    if (!selectedProvider.active) {
      res.status(400).json({
        error: `${selectedProvider.name} is not active yet. ${selectedProvider.configurationHint}`,
      });
      return;
    }

    const verifiedItems: OrderRecord['items'] = [];
    let subtotal = 0;

    for (const entry of rawItems) {
      const pid = sanitizeText(entry?.productId, 60);
      const variant = sanitizeText(entry?.variant, 60) || 'Standard';
      const qty = Math.min(20, Math.max(1, Math.floor(Number(entry?.quantity) || 0)));
      const catalogProduct = PRODUCTS.find((p) => p.id === pid);
      if (!catalogProduct || qty <= 0) {
        res.status(400).json({ error: 'One or more products in your bag could not be verified.' });
        return;
      }
      subtotal += catalogProduct.price * qty;
      verifiedItems.push({
        productId: catalogProduct.id,
        name: catalogProduct.name,
        variant,
        quantity: qty,
        unitPrice: catalogProduct.price,
        image: catalogProduct.image,
      });
    }

    const shipping = subtotal >= 250 ? 0 : 18;
    const total = subtotal + shipping;
    const suffix = crypto.randomInt(1100, 9999);
    const orderNumber = `ELX-2026-${suffix}`;
    const nowLabel = new Date().toISOString().slice(0, 16).replace('T', ' ');

    const newOrder: OrderRecord = {
      orderNumber,
      userId: req.authUser?.id,
      customerName,
      customerEmail,
      customerPhone,
      address,
      city,
      postalCode,
      items: verifiedItems,
      subtotal,
      shipping,
      total,
      paymentMethod: selectedProvider.id,
      paymentMethodLabel: selectedProvider.name,
      paymentStatus: selectedProvider.id === 'cod' ? 'Pending Collection' : 'Authorized',
      orderStatus: 'Confirmed',
      trackingSteps: [
        {
          title: 'Order Confirmed',
          detail: `Confirmed via ${selectedProvider.name} for delivery to ${city}.`,
          completed: true,
          timestamp: nowLabel,
        },
        {
          title: 'Quality Inspection',
          detail: 'Queued for ELYAN X hardware seal and packaging check.',
          completed: false,
        },
        {
          title: 'In Transit',
          detail: 'Courier handoff pending inspection.',
          completed: false,
        },
        {
          title: 'Delivered',
          detail: 'Recipient handoff and verification.',
          completed: false,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    store.orders.unshift(newOrder);
    saveStore(store);

    res.status(201).json({ order: newOrder });
  });

  app.get('/api/reviews', (_req, res) => {
    res.json({ reviews: store.reviews });
  });

  app.post('/api/products/:id/reviews', optionalAuth, (req: AuthedRequest, res) => {
    const productId = sanitizeText(req.params.id, 60);
    if (!PRODUCTS.some((p) => p.id === productId)) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }
    const authorName = sanitizeText(req.body?.authorName, 60) || req.authUser?.name || 'Verified Customer';
    const title = sanitizeText(req.body?.title, 100);
    const comment = sanitizeText(req.body?.comment, 800);
    const rating = Math.min(5, Math.max(1, Math.round(Number(req.body?.rating) || 5)));

    if (title.length < 3 || comment.length < 10) {
      res.status(400).json({ error: 'Please include a review headline and at least 10 characters of feedback.' });
      return;
    }

    const review: Review = {
      id: `rev_${crypto.randomBytes(6).toString('hex')}`,
      productId,
      authorName,
      rating,
      title,
      comment,
      verifiedPurchase: Boolean(req.authUser),
      createdAt: new Date().toISOString(),
    };

    if (!store.reviews[productId]) {
      store.reviews[productId] = [];
    }
    store.reviews[productId].unshift(review);
    saveStore(store);

    res.status(201).json({ review, reviews: store.reviews[productId] });
  });

  app.post('/api/contact', (req, res) => {
    const name = sanitizeText(req.body?.name, 80);
    const email = sanitizeText(req.body?.email, 120);
    const phone = sanitizeText(req.body?.phone, 32);
    const subject = sanitizeText(req.body?.subject, 120);
    const message = sanitizeText(req.body?.message, 1500);

    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10) {
      res.status(400).json({ error: 'Please fill in your name, a valid email, and a message of at least 10 characters.' });
      return;
    }

    const inquiry: ContactInquiry = {
      id: `inq_${crypto.randomBytes(6).toString('hex')}`,
      name,
      email,
      phone,
      subject: subject || 'General Support Inquiry',
      message,
      createdAt: new Date().toISOString(),
    };

    store.inquiries.unshift(inquiry);
    saveStore(store);

    res.status(201).json({
      ok: true,
      ticketId: inquiry.id.toUpperCase(),
      message: 'Your inquiry has been received. Our concierge team (+201224595007) will respond shortly.',
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ELYAN X server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
