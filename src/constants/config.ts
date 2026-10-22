/**
 * Firebase config – lấy từ google-services.json gốc
 * Project: ptptt-pcpc
 */
export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyCvMzAs3etL30t9-hZa-jVPDTQQorq0ouU',
  authDomain: 'ptptt-pcpc.firebaseapp.com',
  databaseURL: 'https://ptptt-pcpc-default-rtdb.firebaseio.com',
  projectId: 'ptptt-pcpc',
  storageBucket: 'ptptt-pcpc.firebasestorage.app',
  messagingSenderId: '334612619008',
  appId: '1:334612619008:android:c9ab58082640f9ae335de5',
};

/** Trung tâm mặc định: Hà Nội */
export const DEFAULT_REGION = {
  latitude: 21.0285,
  longitude: 105.8542,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

/** OSM tile servers (User-Agent hợp lệ để tránh bị block) */
export const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const OSM_ATTRIBUTION = '© OpenStreetMap contributors';
