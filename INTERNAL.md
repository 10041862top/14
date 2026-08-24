# Apktool 內部開發與發布作業指南 (Internal Developer Notes)

本文件記載 Apktool 官方版本切分、建構、測試、驗證與發布之標準程序。

---

## 一、發布新版本之步驟 (Releasing a new version)

### 1. 確認授權標頭 (Ensuring proper license headers)
確保所有源碼檔案皆包含正確的授權條款標頭。

### 2. 標記版本標籤 (Tagging the release)
於 `build.gradle.kts` 或相關設定檔中調整版本號：
- `version`：設定為欲發布之目標版本（例如 `3.0.0`）。
- `suffix`：若為正式發布版，移除 `SNAPSHOT` 後綴。

完成版本號變更後提交 Commit：
```bash
git commit -m "version bump (3.0.0)"
git tag -a v3.0.0 -m "changed version to v3.0.0" -s
```

### 3. Maven 發布準備 (Prepare for publishing)
於專案根目錄下的 `gradle.properties` 設定金鑰與 Sonatype Maven 驗證資訊：
```properties
signing.keyId={gpgKeyId}
signing.password={gpgPassphrase}
signing.secretKeyRingFile={gpgSecretKeyRingLocation}

mavenCentralUsername={sonatypeUsername}
mavenCentralPassword={sonatypePassword}
```

執行發布指令：
```bash
./gradlew build shadowJar release publish
```

### 4. 構建二進位執行檔 (Building the binary)

> [!IMPORTANT]
> 構建 Apktool (及發布 Maven 元件) 需使用 **JDK 17** 或更高版本。

```bash
./gradlew clean
./gradlew build shadowJar proguard release
```

### 5. 測試與驗證 (Testing & Verification)
產出之 Jar 檔命名規則為 `apktool_x.x.x.jar`。
取得檔案之 MD5 與 SHA256 校驗碼：
```bash
md5sum apktool_3.0.0.jar
sha256sum apktool_3.0.0.jar
```

---

## 二、構建與修改 AAPT / AAPT2 二進位檔

Apktool 使用經過客製化修訂的 `aapt` / `aapt2` 工具，以在反編譯與重建時最大程度保留原始 APK 的結構。

### 1. 取得 Android 開放原始碼專案 (AOSP)
參照 AOSP 官方文件複製原始碼，並帶入 Apktool 專用的 `frameworks/base` 修改。

### 2. Linux / Windows 構建指令
```bash
source build/envsetup.sh
lunch aosp_cf_x86_64_only_phone-aosp_current-eng
m aapt2
strip out/host/linux-x86/bin/aapt2
```

### 3. macOS 構建指令
```bash
export ANDROID_JAVA_HOME=/Path/To/Jdk
source build/envsetup.sh
lunch aosp_cf_x86_64_only_phone-aosp_current-eng
m aapt2
```

---

## 三、Gradle 實用技巧 (Tips & Tricks)

* **快步構建 (跳過測試套件)**：
  ```bash
  ./gradlew build shadowJar proguard -x test
  ```
* **開啟 JVM 偵錯模式執行測試**：
  ```bash
  ./gradlew test --debug-jvm
  ```
* **執行單一特定單元測試**：
  ```bash
  ./gradlew :brut.apktool:apktool-lib:test --tests "*BuildAndDecodeTest"
  ```
