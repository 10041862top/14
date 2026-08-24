# Apktool 繁體中文版與線上互動展示

[![CI](https://github.com/iBotPeaches/Apktool/actions/workflows/build.yml/badge.svg)](https://github.com/iBotPeaches/Apktool/actions/workflows/test.yml)
[![Software License](https://img.shields.io/badge/license-Apache%202.0-brightgreen.svg)](LICENSE.md)
[![GitHub Repo](https://img.shields.io/badge/GitHub-10041862top%2F14-blue.svg)](https://github.com/10041862top/14)

本專案為 **Apktool** 的全繁體中文化版本與互動式 Web 展示平臺（託管於 [10041862top/14](https://github.com/10041862top/14)）。

Apktool 是一款專為第三方、閉源、二進位 Android 應用程式設計的反向工程工具。它可以將 Android APK 檔案中的資源（Resources）與代碼（Dex / Smali）拆解並解碼為接近原始開發狀態的形式，並支援在進行修改後重新回編譯打包。此外，Apktool 提供專案式的目錄結構與自動化構建流程，顯著簡化了 Android 軟體分析與客製化工作。

---

## 🌟 主要功能與特色

1. **Smali 代碼反編譯與調試**：將 `classes.dex` 解碼為 Smali 組合語言，支援逐行分析與動態調試。
2. **完整資源解碼**：支援解析 `resources.arsc`、`AndroidManifest.xml`、XML 佈局與 9-patch `.9.png` 圖片。
3. **自動回編譯打包**：修改 Smali 或資源後，可透過一鍵指令重新構建為全新的二進位 APK。
4. **框架管理 (Framework Management)**：支援匯入系統級框架（如三星、HTC、LG 等 OEM 廠商框架）。
5. **AAPT / AAPT2 整合**：靈活切換 Android 資源打包工具，保障最新 Android API 版本之相容性。
6. **線上互動展示網頁**：內建極致質感 UI 介面，提供線上 APK 結構模擬器、Smali 編輯器、CLI 指令生成器與完整繁體中文教學手冊。

---

## ⚠️ 免責與合法使用聲明

Apktool **絕非**用於盜版軟體或任何非法用途。本工具之合法應用情境包含但不限於：
- 軟體繁體中文化與多語言在地化
- 軟體功能增強與客製化適配
- 自訂平台與硬體設備相容性測試
- 資安檢測、漏洞分析與逆向工程研究

請尊重原創作者權益，於合法授權範圍內合理使用。

---

## 🖥️ 互動展示網頁 (Web Showcase)

本專案提供一套可直接瀏覽與使用的互動展示網頁。

### 網頁功能亮點：
* **APK 反編譯/回編譯動態視覺化模擬器**：拖放 APK 檔案，即時展示 `.dex` -> Smali 轉換、資源檔案結構與 YAML 設定檔。
* **Smali 代碼線上檢視與編輯器**：即時高亮語法與範例對比。
* **CLI 指令生成器**：勾選選項並即時生成正確的 `apktool d` 與 `apktool b` 命令列。
* **Smali 語法字典與教學手冊**：完整收錄指令暫存器規範與範例。

👉 **本地開啟方式**：直接於瀏覽器開啟專案目錄下的 `index.html` 即可使用。

---

## 🚀 快速開始與 CLI 操作指南

### 1. 安裝環境需求
- **Java SE Development Kit (JDK)**：建議 **JDK 17** 或更高版本。

### 2. 解碼 / 反編譯 APK (`apktool d`)
```bash
# 基本解碼
apktool d target.apk -o output_folder

# 忽略解碼資源檔 (僅解碼 Smali)
apktool d target.apk -r

# 忽略解碼 Dex 碼 (僅解碼資源)
apktool d target.apk -s

# 指定使用 AAPT2 進行解碼
apktool d target.apk --use-aapt2
```

### 3. 回編譯 / 重構 APK (`apktool b`)
```bash
# 將解碼後的目錄打包為新 APK
apktool b output_folder -o new_target.apk

# 使用 AAPT2 打包
apktool b output_folder --use-aapt2
```

### 4. 匯入系統框架 (`apktool if`)
```bash
# 匯入特定 OEM 裝置的 framework-res.apk
apktool if framework-res.apk
```

---

## 🛠️ 本地構建與開發 (Building from Source)

使用 Gradle 進行專案構建：

```bash
# 清理並構建影子公司 jar 檔
./gradlew clean shadowJar

# 跳過測試快步構建
./gradlew build shadowJar proguard -x test
```

構建產出的可執行檔置於 `brut.apktool/apktool-cli/build/libs/apktool-cli-all.jar`。

---

## 📚 檔案與架構說明

* `index.html` / `style.css` / `app.js`：互動展示網頁核心程式碼
* `brut.apktool/apktool-lib`：Apktool 解碼與回編譯核心邏輯庫
* `brut.apktool/apktool-cli`：命令列介面實作
* `CONTRIBUTORS.md`：繁體中文貢獻者名冊
* `INTERNAL.md`：內部開發者釋出與架構設計文件
* `ROADMAP.md`：專案技術藍圖與未來規劃
* `SECURITY.md`：安全漏洞回報政策

---

## 🔗 相關連結

* **GitHub 儲存庫**：[10041862top/14](https://github.com/10041862top/14)
* **官方網站**：[apktool.org](https://apktool.org)
* **原始碼 (Upstream)**：[iBotPeaches/Apktool](https://github.com/iBotPeaches/Apktool)

---
*授權條款：Apache License 2.0*
