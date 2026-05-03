# Чеклист для продакшену

## Зроблено в репозиторії

- console.log — немає в коді
- Remote Config — 1 год для prod (`__DEV__ ? 30000 : 3600000`)
- app.json — icon, splash, adaptiveIcon з assets/icon.png
- Видалено зайві залежності (@expo-google-fonts/comfortaa, montserrat)
- Видалено зайві зображення (graduated, teacher, favicon, splash-icon, adaptive-icon)
- EAS production — `buildType: app-bundle`, без `developmentClient`
- Версіонування: `eas.json` → `appVersionSource: "local"`; у `app.json` → `android.versionCode` (стартує з `1`); `autoIncrement: true` піднімає код збірки на кожній production-збірці
- Скрипти: `npm run build:android:prod`, `npm run submit:android:prod`
- Дозволи: прибрано зовнішнє сховище з release-маніфесту (`blockedPermissions` + `tools:node="remove"`); дані лише в sandbox (`FileSystem.documentDirectory`)
- `expo-dev-client` перенесено в `devDependencies` (development-профіль EAS як і раніше з `developmentClient: true`)

---

## EAS: облікові дані Android і перша збірка AAB

Рекомендовано довірити підпис **Expo (keystore для завантаження в Play)** — простіше, ніж вручну правити Gradle.

1. `npm i -g eas-cli` (або `npx eas-cli`)
2. `eas login`
3. Переконатися, що `google-services.json` є в корені репозиторію (уже вказано в `app.json` → `googleServicesFile`).
4. Перша збірка: `npm run build:android:prod` (або `eas build --platform android --profile production`).
5. У процесі або через `eas credentials` налаштуйте **Android upload keystore** (створити новий або завантажити свій). Збережіть паролі окремо від репозиторію.

Локальний `android/app/build.gradle` з `release` → `signingConfigs.debug` стосується лише **локального** `./gradlew assembleRelease`. Для Google Play використовуйте **.aab з EAS**.

Альтернатива — власний keystore і секрети EAS; деталі: [Expo: Android credentials](https://docs.expo.dev/app-signing/app-credentials/).

---

## Google Play Console (після отримання AAB)

1. Створити додаток, обрати країни, категорію.
2. **Випуск** → створити доріжку (спочатку внутрішнє/закрите тестування) → завантажити AAB.
3. Заповнити **Data safety** (Firebase / Remote Config: опис збіру технічних даних, мережеві запити тощо).
4. За потреби вказати **URL політики конфіденційності**.
5. Графіка: іконка 512×512, скріншоти, короткий і повний опис; **контентний рейтинг** (опитування).
6. Перевірити **цільовий API рівень** (узгоджується з `targetSdk` у збірці; зараз 35).
7. Після перевірки — production.

Відправка з CLI (після налаштування сервісного акаунта або інтерактивно): `npm run submit:android:prod`.

---

## Перевірка змердженого release-маніфесту

Після змін у `app.json` або нативному шарі:

```powershell
cd android
.\gradlew.bat :app:processReleaseMainManifest
```

Файл: `android/app/build/intermediates/merged_manifest/release/processReleaseMainManifest/AndroidManifest.xml`.

Очікувано для release: наприклад `INTERNET`, `VIBRATE`, `ACCESS_NETWORK_STATE`; без `READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE` / `SYSTEM_ALERT_WINDOW` (якщо бібліотеки їх не додають знову). Якщо з’являться зайві дозволи — знайти джерело через залежності або `blockedPermissions`.

---

## Оновлення версії для наступного релізу

- Підняти `version` у `app.json` (і за бажанням у `package.json`).
- За потреби підняти початковий `android.versionCode` у `app.json`; далі `autoIncrement` у профілі `production` збільшує код на кожній збірці EAS.

---

## Рекомендовано додатково

### Error Boundary

- Обгортка для відлову помилок у React; дружній екран замість краху.

### Аналітика / моніторинг

- Firebase Crashlytics або Sentry.

### Тестування

- Різні пристрої, розміри екранів, слабкий інтернет.
