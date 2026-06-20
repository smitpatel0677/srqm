import type { Owner, Restaurant, Category, MenuItem, Order, Review, SiteSettings } from '@/types';

const KEYS = {
  OWNERS: 'sqrm_owners',
  CURRENT_OWNER: 'sqrm_current_owner',
  RESTAURANTS: 'sqrm_restaurants',
  MENU_ITEMS: 'sqrm_menu_items',
  CATEGORIES: 'sqrm_categories',
  ORDERS: 'sqrm_orders',
  REVIEWS: 'sqrm_reviews',
  ADMIN_SESSION: 'sqrm_admin_session',
  SETTINGS: 'sqrm_settings',
  THEME: 'sqrm_theme',
  CART: 'sqrm_cart',
};

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function set<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Default settings ───────────────────────────────────────────────────────
export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Saksham Digi QR Menu',
  supportPhone: '9876543210',
  supportEmail: 'support@sqrm.in',
  logo: '',
  maintenanceMode: false,
};

export const LOGO_URL =
  'https://miaoda-conversation-file.s3cdn.medo.dev/user-bctx96g1udc0/app-cg8nvxlqtuyq/20260620/logo.png';

// ─── Init ────────────────────────────────────────────────────────────────────
export function initStore() {
  if (!localStorage.getItem(KEYS.SETTINGS)) {
    set(KEYS.SETTINGS, DEFAULT_SETTINGS);
  }
  // Always enforce correct admin credentials (overwrite any old values)
  localStorage.setItem(
    'sqrm_admin_credentials',
    JSON.stringify({ email: 'sqrmadmin@srpdigitalstudios.qzz.io', password: 'sqrm15112010@' })
  );
}

// ─── Settings ────────────────────────────────────────────────────────────────
export const settingsStore = {
  get: (): SiteSettings => get<SiteSettings>(KEYS.SETTINGS, DEFAULT_SETTINGS),
  set: (s: SiteSettings) => set(KEYS.SETTINGS, s),
};

// ─── Admin ───────────────────────────────────────────────────────────────────
const ADMIN_EMAIL = 'sqrmadmin@srpdigitalstudios.qzz.io';
const ADMIN_PASS  = 'sqrm15112010@';

export const adminStore = {
  /** Exact-match validation only — no bypass possible */
  validate: (email: string, password: string): boolean =>
    email === ADMIN_EMAIL && password === ADMIN_PASS,
  getSession: (): boolean => get<boolean>(KEYS.ADMIN_SESSION, false),
  setSession: (v: boolean) => set(KEYS.ADMIN_SESSION, v),
};

// ─── Owners ──────────────────────────────────────────────────────────────────
export const ownerStore = {
  getAll: (): Owner[] => get<Owner[]>(KEYS.OWNERS, []),
  getById: (id: string) => ownerStore.getAll().find((o) => o.id === id),
  getByEmail: (email: string) => ownerStore.getAll().find((o) => o.email.toLowerCase() === email.toLowerCase()),
  save: (owner: Owner) => {
    const all = ownerStore.getAll().filter((o) => o.id !== owner.id);
    set(KEYS.OWNERS, [...all, owner]);
  },
  delete: (id: string) => set(KEYS.OWNERS, ownerStore.getAll().filter((o) => o.id !== id)),
  getCurrent: (): Owner | null => get<Owner | null>(KEYS.CURRENT_OWNER, null),
  setCurrent: (o: Owner | null) => set(KEYS.CURRENT_OWNER, o),
};

// ─── Restaurants ──────────────────────────────────────────────────────────────
export const restaurantStore = {
  getAll: (): Restaurant[] => get<Restaurant[]>(KEYS.RESTAURANTS, []),
  getById: (id: string) => restaurantStore.getAll().find((r) => r.id === id),
  getBySlug: (slug: string) => restaurantStore.getAll().find((r) => r.slug === slug),
  getByOwner: (ownerId: string) => restaurantStore.getAll().filter((r) => r.ownerId === ownerId),
  save: (r: Restaurant) => {
    const all = restaurantStore.getAll().filter((x) => x.id !== r.id);
    set(KEYS.RESTAURANTS, [...all, r]);
  },
  delete: (id: string) => {
    set(KEYS.RESTAURANTS, restaurantStore.getAll().filter((r) => r.id !== id));
    // cascade: delete items, categories, orders, reviews
    set(KEYS.MENU_ITEMS, menuStore.getAll().filter((m) => m.restaurantId !== id));
    set(KEYS.CATEGORIES, categoryStore.getAll().filter((c) => c.restaurantId !== id));
  },
  /** Generate a random 16-char alphanumeric slug */
  generateSlug: (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let slug = '';
    for (let i = 0; i < 16; i++) slug += chars[Math.floor(Math.random() * chars.length)];
    const existing = restaurantStore.getAll().map((r) => r.slug);
    // Extremely unlikely collision but handle anyway
    return existing.includes(slug) ? restaurantStore.generateSlug() : slug;
  },
};

// ─── Categories ───────────────────────────────────────────────────────────────
export const categoryStore = {
  getAll: (): Category[] => get<Category[]>(KEYS.CATEGORIES, []),
  getByRestaurant: (restaurantId: string) => categoryStore.getAll().filter((c) => c.restaurantId === restaurantId),
  save: (c: Category) => {
    const all = categoryStore.getAll().filter((x) => x.id !== c.id);
    set(KEYS.CATEGORIES, [...all, c]);
  },
  delete: (id: string) => set(KEYS.CATEGORIES, categoryStore.getAll().filter((c) => c.id !== id)),
};

// ─── Menu Items ───────────────────────────────────────────────────────────────
export const menuStore = {
  getAll: (): MenuItem[] => get<MenuItem[]>(KEYS.MENU_ITEMS, []),
  getByRestaurant: (restaurantId: string) => menuStore.getAll().filter((m) => m.restaurantId === restaurantId),
  save: (m: MenuItem) => {
    const all = menuStore.getAll().filter((x) => x.id !== m.id);
    set(KEYS.MENU_ITEMS, [...all, m]);
  },
  delete: (id: string) => set(KEYS.MENU_ITEMS, menuStore.getAll().filter((m) => m.id !== id)),
};

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orderStore = {
  getAll: (): Order[] => get<Order[]>(KEYS.ORDERS, []),
  getById: (id: string) => orderStore.getAll().find((o) => o.id === id),
  getByRestaurant: (restaurantId: string) => orderStore.getAll().filter((o) => o.restaurantId === restaurantId),
  save: (o: Order) => {
    const all = orderStore.getAll().filter((x) => x.id !== o.id);
    set(KEYS.ORDERS, [...all, o]);
  },
};

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const reviewStore = {
  getAll: (): Review[] => get<Review[]>(KEYS.REVIEWS, []),
  getByRestaurant: (restaurantId: string) => reviewStore.getAll().filter((r) => r.restaurantId === restaurantId),
  save: (r: Review) => {
    const all = reviewStore.getAll().filter((x) => x.id !== r.id);
    set(KEYS.REVIEWS, [...all, r]);
  },
  delete: (id: string) => set(KEYS.REVIEWS, reviewStore.getAll().filter((r) => r.id !== id)),
};

// ─── Cart ─────────────────────────────────────────────────────────────────────
export interface CartState {
  restaurantSlug: string;
  items: import('@/types').CartItem[];
}
export const cartStore = {
  get: (): CartState | null => get<CartState | null>(KEYS.CART, null),
  set: (c: CartState | null) => set(KEYS.CART, c),
  clear: () => localStorage.removeItem(KEYS.CART),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function uuid(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function planHas(plan: 'free' | 'basic' | 'premium', feature: 'categories' | 'orderFilter' | 'analytics' | 'unlimitedRestaurants' | 'unlimitedItems' | 'themeColor'): boolean {
  const matrix: Record<string, string[]> = {
    free: [],
    basic: ['categories', 'orderFilter', 'analytics'],
    premium: ['categories', 'orderFilter', 'analytics', 'unlimitedRestaurants', 'unlimitedItems', 'themeColor'],
  };
  return (matrix[plan] ?? []).includes(feature);
}

export function maxRestaurants(plan: 'free' | 'basic' | 'premium'): number {
  return plan === 'premium' ? Infinity : plan === 'basic' ? 5 : 1;
}

export function maxMenuItems(plan: 'free' | 'basic' | 'premium'): number {
  return plan === 'free' ? 20 : Infinity;
}

export function getOwnerPlan(owner: Owner): 'free' | 'basic' | 'premium' {
  if (!owner.planExpiresAt || new Date(owner.planExpiresAt) < new Date()) return 'free';
  return owner.plan;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result as string);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}
