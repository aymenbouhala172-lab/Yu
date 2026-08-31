// أداة المصادقة الداخلية — تشفير كلمة المرور عبر Web Crypto (PBKDF2 + salt)
// وحفظ المستخدمين في التخزين المحلي بأسلوب التطبيق الحالي.
// ملاحظة: هذا خيار احتياطي آمن نسبياً على العميل؛ للإنتاج الحقيقي يُنصح بقاعدة بيانات (Neon) مع bcrypt على الخادم.

const USERS_KEY = 'minhaj_users_v1';
const SESSION_KEY = 'minhaj_session_v1';
const REMEMBER_KEY = 'minhaj_remember_v1';

const PBKDF2_ITERATIONS = 150000;

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  salt: string; // hex
  hash: string; // hex
  createdAt: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

// ---------- أدوات تحويل ----------
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

// ---------- تشفير كلمة المرور ----------
async function deriveHash(password: string, saltBytes: Uint8Array): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  return bufferToHex(derivedBits);
}

export async function hashPassword(password: string): Promise<{ salt: string; hash: string }> {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const hash = await deriveHash(password, saltBytes);
  return { salt: bufferToHex(saltBytes.buffer), hash };
}

async function verifyPassword(password: string, salt: string, expectedHash: string): Promise<boolean> {
  const hash = await deriveHash(password, hexToBytes(salt));
  // مقارنة ثابتة الزمن قدر الإمكان
  if (hash.length !== expectedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < hash.length; i++) {
    diff |= hash.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  }
  return diff === 0;
}

// ---------- إدارة المستخدمين ----------
function loadUsers(): StoredUser[] {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? (JSON.parse(data) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// ---------- التسجيل ----------
export async function registerUser(params: {
  name: string;
  email: string;
  password: string;
}): Promise<SessionUser> {
  const email = normalizeEmail(params.email);
  const users = loadUsers();

  if (users.some((u) => u.email === email)) {
    throw new Error('هذا البريد الإلكتروني مسجّل بالفعل. جرّب تسجيل الدخول.');
  }

  const { salt, hash } = await hashPassword(params.password);
  const user: StoredUser = {
    id: crypto.randomUUID(),
    name: params.name.trim(),
    email,
    salt,
    hash,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  saveUsers(users);

  return { id: user.id, name: user.name, email: user.email };
}

// ---------- تسجيل الدخول ----------
export async function loginUser(params: { email: string; password: string }): Promise<SessionUser> {
  const email = normalizeEmail(params.email);
  const users = loadUsers();
  const user = users.find((u) => u.email === email);

  if (!user) {
    throw new Error('لا يوجد حساب بهذا البريد الإلكتروني.');
  }

  const ok = await verifyPassword(params.password, user.salt, user.hash);
  if (!ok) {
    throw new Error('كلمة المرور غير صحيحة.');
  }

  return { id: user.id, name: user.name, email: user.email };
}

// ---------- الجلسة ----------
export function startSession(user: SessionUser): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getSession(): SessionUser | null {
  try {
    const data = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    return data ? (JSON.parse(data) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function endSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
}

// ---------- تذكّرني ----------
export function setRememberedEmail(email: string | null): void {
  if (email) {
    localStorage.setItem(REMEMBER_KEY, normalizeEmail(email));
  } else {
    localStorage.removeItem(REMEMBER_KEY);
  }
}

export function getRememberedEmail(): string {
  return localStorage.getItem(REMEMBER_KEY) || '';
}

// ---------- تحقق الإيميل والقوة ----------
export function isValidEmail(email: string): boolean {
  // تحقق عملي من الصيغة: وجود @ وامتداد صحيح
  const re = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  return re.test(email.trim());
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string; // tailwind bg color class
  textColor: string;
}

export function evaluatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { score: 0, label: '', color: 'bg-stone-200', textColor: 'text-stone-400' };
  }

  let points = 0;
  if (password.length >= 8) points++;
  if (password.length >= 12) points++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) points++;
  if (/\d/.test(password)) points++;
  if (/[^A-Za-z0-9]/.test(password)) points++;

  // اختصار النقاط إلى 3 مستويات (ضعيف/متوسط/قوي)
  if (points <= 1) {
    return { score: 1, label: 'ضعيفة', color: 'bg-red-500', textColor: 'text-red-600' };
  }
  if (points <= 3) {
    return { score: 2, label: 'متوسطة', color: 'bg-amber-500', textColor: 'text-amber-600' };
  }
  return { score: 4, label: 'قوية', color: 'bg-emerald-500', textColor: 'text-emerald-600' };
}
