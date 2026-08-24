# Apktool 專案發展藍圖 (Development Roadmap)

本文件列出 Apktool 團隊規劃中與開發中的重大技術改善項目。

---

## 1. 資源 ID 自動重新映射 (Automatic Remapping of ResourceId)
目前我們利用 `public.xml` 將資源設為公開以防止資源 ID 發生變更，但這會在某些特定位置（例如 `android:scheme`）限制資源的使用。
正確的修復方式是紀錄所有資源 ID，並利用 `dexlib2`（非正規表示式）在 `resources.arsc` 建置完成後，將 Dex 中的舊 ID 重寫為新 ID。

* 參考提案：[#244](https://github.com/iBotPeaches/Apktool/issues/244)
* 討論議題：[#2062](https://github.com/iBotPeaches/Apktool/issues/2062)

---

## 2. 隱式限定符清理 (Implicit Qualifiers Cleanup)
目前在讀取資料夾與讀取限定符（Qualifiers）之間存在不匹配問題，導致版本限定符（如 `-v4`, `-v13` 等隱式版本號）的處理衝突。

* 相關 Bug 紀錄：[#1272](https://github.com/iBotPeaches/Apktool/issues/1272)
* 建議改善：[#2237](https://github.com/iBotPeaches/Apktool/issues/2237)

---

## 3. 限定符外掛擴充系統 (Qualifier Plugin System)
某些 OEM 手機廠商（如三星、小米等）會自訂非標準的 AOSP 資源限定符。為維持 Apktool 對 AOSP 標準的忠實性，規劃引進限定符外掛系統或自訂覆寫檔。

* 參考提案：[#1420](https://github.com/iBotPeaches/Apktool/issues/1420), [#2474](https://github.com/iBotPeaches/Apktool/issues/2474)

---

## 4. 無引用資源檔處理 (Non-reference Resources)
部分應用程式可能將資源放置於 `/res` 目錄中，但於 `resources.arsc` 資源表中並無相應引用。未來計畫改善對這類未標示檔案的掃描與復原機制。

* 參考提案：[#1366](https://github.com/iBotPeaches/Apktool/issues/1366)

---

## 5. Android 行動裝置端原生支援 (On-Device Android Support)
社群希望能在 Android 裝置本體上直接執行 Apktool。此項目目前挑戰在於架構（ARM/ARM64）對 `aapt` / `aapt2` 二進位檔的跨平台編譯要求。

* 參考提案：[#2811](https://github.com/iBotPeaches/Apktool/issues/2811)

---

## 6. 切分套件 APK 支援 (Split APK / Android App Bundles Support)
現代 Android App 廣泛採用 Split APK（如依據語言、螢幕密度、ABI 切分的 App Bundle）。Apktool 正致力於將單一 APK 處理架構擴展至整合 Split APK 套件。

* 參考提案：[#2283](https://github.com/iBotPeaches/Apktool/issues/2283), [#2880](https://github.com/iBotPeaches/Apktool/issues/2880)

---

## 7. 多版本 API 框架檔案動態下載機制
解決不同 Android SDK API 版本間 `framework-res.apk` 相容性之過渡問題。

* 參考提案：[#3946](https://github.com/iBotPeaches/Apktool/issues/3946)
