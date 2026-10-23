# Hướng dẫn Build APK bằng Android Studio (chi tiết)

Dự án này là **Expo (React Native)**. Để mở và build trực tiếp trên **Android Studio**, bạn cần tạo thư mục native `android/` bằng lệnh `prebuild`.

---

## 1. Yêu cầu hệ thống

| Công cụ              | Phiên bản khuyến nghị          | Ghi chú |
|----------------------|--------------------------------|---------|
| Node.js              | 18 hoặc 20 LTS                 | `node -v` |
| npm / yarn           | đi kèm Node                    |         |
| Java JDK             | **17** (bắt buộc)              | Android Studio thường cài sẵn |
| Android Studio       | 2023.3+ (Hedgehog trở lên)     |         |
| Android SDK          | API 34 hoặc 35                 |         |
| Git (tuỳ chọn)       | bất kỳ                         |         |

**Kiểm tra Java:**
```bash
java -version
# Phải thấy 17.x
```

Nếu chưa có JDK 17, trong Android Studio:  
**File → Settings → Build, Execution, Deployment → Build Tools → Gradle → Gradle JDK** → chọn **17**.

---

## 2. Cài đặt & tạo thư mục Android (Prebuild)

Mở **Terminal** (PowerShell / CMD / macOS Terminal / Linux) tại thư mục dự án:

```bash
# 1. Cài dependency
npm install

# 2. Tạo thư mục android/ (quan trọng nhất)
npx expo prebuild --platform android --clean
```

Lệnh `prebuild` sẽ:
- Tạo thư mục `android/` đầy đủ (Gradle, Manifest, Java/Kotlin boilerplate…)
- Áp dụng cấu hình từ `app.json` (package name, permissions, icon…)
- Cài các native module cần thiết (maps, location, reanimated…)

Sau khi chạy xong bạn sẽ thấy:
```
android/
  ├── app/
  ├── build.gradle
  ├── gradle/
  ├── settings.gradle
  └── ...
```

---

## 3. Mở dự án trong Android Studio

1. Mở **Android Studio**.
2. Chọn **Open** (hoặc File → Open).
3. Chọn **thư mục `android/`** (không chọn thư mục gốc dự án).
   ```
   diemdentieptheo-main/
   └── android/          ← mở cái này
   ```
4. Đợi Gradle Sync hoàn tất (lần đầu có thể 5–15 phút, cần Internet).

Nếu Gradle báo lỗi JDK:
- **File → Settings → Build Tools → Gradle → Gradle JDK** → chọn **jbr-17** hoặc **JDK 17**.

---

## 4. Cấu hình SDK & Emulator (nếu cần)

Trong Android Studio:
- **Tools → SDK Manager**
  - SDK Platforms: tick **Android 14.0 (API 34)** hoặc **Android 15 (API 35)**
  - SDK Tools: tick **Android SDK Build-Tools**, **NDK** (nếu được hỏi), **CMake**

Tạo Emulator (nếu không có máy thật):
- **Tools → Device Manager → Create Device**
- Chọn Pixel 6 / Pixel 7, System Image **API 34** (Google APIs).

---

## 5. Build & chạy

### A. Chạy Debug trên Emulator / Máy thật (nhanh)

1. Cắm điện thoại (bật **USB Debugging**) hoặc chọn Emulator.
2. Trên thanh công cụ Android Studio nhấn nút **▶ Run** (màu xanh).
3. Chọn thiết bị → OK.

Hoặc từ terminal (tại thư mục gốc dự án):
```bash
npx expo run:android
```

### B. Build APK Release (cài được trên máy thật)

#### Cách 1: Qua Android Studio (khuyến nghị)

1. **Build → Generate Signed Bundle / APK…**
2. Chọn **APK** → Next.
3. Tạo keystore mới (hoặc dùng có sẵn):
   - **Create new…**
   - Điền thông tin (đặt mật khẩu nhớ kỹ!)
   - Alias: `locationmap`
   - Validity: 25 năm
4. Chọn **release** → Finish.
5. APK sẽ nằm ở:
   ```
   android/app/release/app-release.apk
   ```
   hoặc
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

#### Cách 2: Qua dòng lệnh (Gradle)

```bash
cd android
./gradlew assembleRelease
```

APK nằm tại:
```
android/app/build/outputs/apk/release/app-release.apk
```

> **Lưu ý:** APK release mặc định **chưa ký**. Để cài được trên máy thật bạn cần ký (dùng Android Studio Generate Signed APK ở trên).

---

## 6. Cài APK lên điện thoại

1. Copy file `.apk` vào điện thoại.
2. Mở file → cho phép **Cài từ nguồn không xác định**.
3. Cài đặt.

Hoặc dùng `adb`:
```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

---

## 7. Các lỗi thường gặp & cách sửa

| Lỗi | Nguyên nhân | Cách sửa |
|-----|-------------|----------|
| `SDK location not found` | Chưa set ANDROID_HOME | Trong Android Studio: File → Project Structure → SDK Location |
| `Unsupported class file major version` | Sai JDK | Dùng JDK 17 |
| `Permission denied` (Firebase) | Chưa login hoặc Rules sai | Kiểm tra đã đăng nhập + Rules `users/$uid` |
| Map xám / không hiện tile | Không có Internet hoặc User-Agent | Kiểm tra mạng; OSM tile cần Internet |
| `react-native-reanimated` error | Thiếu plugin babel | Đã có sẵn trong `babel.config.js` |
| Gradle sync fail | Cache cũ | File → Invalidate Caches → Restart |
| `newArchEnabled` crash | New Architecture chưa ổn định | Đã tắt (`newArchEnabled: false`) trong `app.json` |

---

## 8. Cập nhật code sau khi prebuild

Mỗi khi bạn sửa `app.json` (thêm permission, đổi package, icon…):

```bash
npx expo prebuild --platform android --clean
```

Sau đó mở lại `android/` trong Android Studio (Gradle sẽ sync lại).

**Không** sửa tay quá nhiều file trong `android/` nếu bạn vẫn dùng Expo managed workflow, vì `prebuild --clean` sẽ ghi đè.

---

## 9. Cấu trúc quan trọng sau prebuild

```
diemdentieptheo-main/
├── android/                  ← Mở thư mục này trong Android Studio
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── java/.../
│   │   │   └── res/
│   │   └── build.gradle
│   ├── build.gradle
│   └── settings.gradle
├── app/                      ← Mã nguồn Expo Router
├── src/                      ← Logic (Firebase, Map, Hooks…)
├── app.json
├── package.json
└── HUONG_DAN_BUILD_ANDROID_STUDIO.md  ← File này
```

---

## 10. Firebase Rules (nhắc lại)

App ghi dữ liệu vào `users/{uid}/locations/{id}`.  
Rules phải có:

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

---

## Tóm tắt nhanh (copy-paste)

```bash
# Tại thư mục gốc dự án
npm install
npx expo prebuild --platform android --clean

# Sau đó mở thư mục android/ bằng Android Studio
# → Run hoặc Build → Generate Signed APK
```

Chúc bạn build thành công!
