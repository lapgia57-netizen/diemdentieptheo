# OSM Location Map – React Native (Expo)

Chuyển đổi từ ứng dụng Android native (Kotlin + osmdroid) sang **React Native + Expo**.

## Tính năng

| Tính năng | Mô tả |
|-----------|--------|
| Đăng nhập | Firebase Auth (email/password) – **không có đăng ký trong app** |
| Bản đồ OpenStreetMap | `react-native-maps` + UrlTile OSM (không cần API key) |
| Vị trí hiện tại | `expo-location` (GPS) |
| Thêm vị trí | Long-press trên bản đồ **hoặc** nút **+** |
| Lưu Firebase | `users/{uid}/locations/{id}` – khớp Rules (users/$uid) |
| Danh sách + xóa | Bottom sheet danh sách, xác nhận xóa |
| Tìm kiếm | Theo tên hoặc tọa độ trong danh sách |
| Mở bản đồ ngoài | Apple Maps / Google Maps / OSM web |
| Marker realtime | Tự cập nhật khi dữ liệu Firebase thay đổi |

> Tài khoản người dùng được tạo sẵn trên Firebase Console (Authentication). App chỉ hỗ trợ đăng nhập.

---

## Build trực tiếp trên Android Studio (khuyến nghị)

Xem hướng dẫn **chi tiết từng bước** tại file:

📄 **[HUONG_DAN_BUILD_ANDROID_STUDIO.md](./HUONG_DAN_BUILD_ANDROID_STUDIO.md)**

### Tóm tắt nhanh

```bash
npm install
npx expo prebuild --platform android --clean
```

Sau đó mở thư mục **`android/`** bằng Android Studio → Run hoặc Generate Signed APK.

---

## Cấu trúc thư mục

```
diemdentieptheo-main/
├── app/                    # Expo Router
│   ├── _layout.tsx
│   └── index.tsx
├── src/
│   ├── components/
│   │   ├── LoginScreen.tsx
│   │   ├── MapScreen.tsx
│   │   ├── AddLocationModal.tsx
│   │   └── LocationListSheet.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useLocations.ts
│   │   └── useCurrentLocation.ts
│   ├── services/
│   │   └── firebase.ts
│   ├── constants/
│   │   └── config.ts
│   └── types/
│       └── index.ts
├── android/                # (sau khi chạy prebuild)
├── app.json
├── package.json
├── HUONG_DAN_BUILD_ANDROID_STUDIO.md
└── README.md
```

## Cài đặt & chạy (Expo Go – nhanh)

### 1. Cài dependency

```bash
npm install
```

### 2. Firebase (đã cấu hình sẵn)

- Project: `ptptt-pcpc`
- Database: `https://ptptt-pcpc-default-rtdb.firebaseio.com`

**Rules bắt buộc** (Realtime Database):

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "companies": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "history": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "locations": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

App lưu vị trí tại `users/{uid}/locations/{id}` → chỉ owner được đọc/ghi.

Bật **Email/Password** trong Firebase Authentication và tạo user thủ công trên Console.

### 3. Chạy với Expo Go

```bash
npx expo start
```

- Quét QR bằng Expo Go (Android/iOS)

### 4. Build APK khác

- **Android Studio** (xem file HUONG_DAN_BUILD_ANDROID_STUDIO.md) – khuyến nghị
- **EAS Build** (cloud):
  ```bash
  npx eas build --platform android --profile preview
  ```

## Lưu ý bản đồ OSM

- Tile server: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`
- Không cần Google Maps API key
- Nếu map xám: kiểm tra Internet

## License

OpenStreetMap data © OpenStreetMap contributors.
