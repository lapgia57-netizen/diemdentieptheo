import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  // @ts-expect-error – persistence is available in RN build
  getReactNativePersistence,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getDatabase,
  ref,
  push,
  set,
  remove,
  onValue,
  DatabaseReference,
} from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIREBASE_CONFIG } from '../constants/config';
import { LocationItem } from '../types';

const app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApp();

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

const database = getDatabase(app);

export { auth, database };

/**
 * Đường dẫn: users/$uid/locations
 * Khớp Firebase Rules:
 *   "users": { "$uid": { ".read": "$uid === auth.uid", ".write": "$uid === auth.uid" } }
 * Mỗi user chỉ đọc/ghi được dữ liệu của chính mình.
 */
function userLocationsRef(uid: string): DatabaseReference {
  return ref(database, `users/${uid}/locations`);
}

export async function login(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

export async function saveLocation(
  name: string,
  latitude: number,
  longitude: number
): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Chưa đăng nhập. Vui lòng đăng xuất rồi đăng nhập lại.');

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new Error(`Tọa độ không hợp lệ: ${latitude}, ${longitude}`);
  }

  const locationsRef = userLocationsRef(user.uid);
  const newRef = push(locationsRef);
  const key = newRef.key;
  if (!key) throw new Error('Không tạo được ID.');

  const data: Record<string, string | number> = {
    id: key,
    name: name.trim() || 'Vị trí',
    latitude,
    longitude,
    userId: user.uid,
    userEmail: user.email || '',
    timestamp: Date.now(),
  };

  await set(newRef, data);
  return key;
}

export async function deleteLocation(id: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Chưa đăng nhập');
  if (!id) throw new Error('ID rỗng');
  await remove(ref(database, `users/${user.uid}/locations/${id}`));
}

export function observeLocations(
  onData: (list: LocationItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  const user = auth.currentUser;
  if (!user) {
    onData([]);
    return () => {};
  }

  const locationsRef = userLocationsRef(user.uid);

  // Path users/$uid/locations khớp rules:
  // "users": { "$uid": { ".read": "$uid === auth.uid", ".write": "$uid === auth.uid" } }
  const unsubscribe = onValue(
    locationsRef,
    (snapshot) => {
      try {
        const list: LocationItem[] = [];
        snapshot.forEach((child) => {
          const parsed = parseLocation(child);
          if (parsed) list.push(parsed);
        });
        list.sort((a, b) => b.timestamp - a.timestamp);
        onData(list);
      } catch (e) {
        onData([]);
        onError?.(e as Error);
      }
    },
    (error) => {
      onData([]);
      onError?.(new Error(error.message));
    }
  );

  // Dùng unsubscribe từ onValue (chuẩn modular SDK v9+)
  return unsubscribe;
}

function parseLocation(child: any): LocationItem | null {
  try {
    const val = child.val();
    if (!val) return null;

    const id = val.id || child.key;
    if (!id) return null;

    const lat = readNumber(val.latitude);
    const lng = readNumber(val.longitude);
    if (lat === null || lng === null) return null;
    if (lat === 0 && lng === 0) return null;

    return {
      id,
      name: val.name || 'Vị trí',
      latitude: lat,
      longitude: lng,
      userId: val.userId || '',
      userEmail: val.userEmail || '',
      timestamp: readNumber(val.timestamp) ?? 0,
    };
  } catch {
    return null;
  }
}

function readNumber(v: unknown): number | null {
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  if (typeof v === 'string') {
    const n = parseFloat(v);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

export function friendlyAuthError(e: unknown): string {
  const msg = (e as Error)?.message || '';
  if (/password/i.test(msg)) return 'Sai mật khẩu';
  if (/user-not-found|no user/i.test(msg)) return 'Email chưa đăng ký';
  if (/invalid-email/i.test(msg)) return 'Email không hợp lệ';
  if (/network|unavailable/i.test(msg)) return 'Không có mạng. Kiểm tra Internet.';
  return msg || 'Lỗi xác thực';
}

export function friendlyDbError(e: unknown): string {
  const msg = (e as Error)?.message || '';
  if (/permission|PERMISSION_DENIED/i.test(msg))
    return 'Không có quyền. Kiểm tra đã đăng nhập + Firebase Rules (users/$uid phải = auth.uid).';
  if (/network|Unable to resolve/i.test(msg)) return 'Không có mạng. Kiểm tra Internet.';
  if (/timeout|timed out/i.test(msg)) return 'Hết thời gian chờ. Thử lại.';
  return msg || 'Lỗi cơ sở dữ liệu';
}
