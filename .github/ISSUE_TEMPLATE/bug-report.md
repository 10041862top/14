---
name: Bug 錯誤回報 (Bug Report)
about: 向 Apktool 團隊回報問題或錯誤
title: "[BUG] "
labels: ''
assignees: ''

---

### 環境與版本資訊 (Information)
1. **Apktool 版本 (`apktool -version`)**：
2. **作業系統 (Mac, Linux, Windows)**：
3. **APK 來源 (Play 商店, 原廠 ROM, 其它)**：
4. **Java 版本 (`java --version`)**：

### 錯誤日誌 / 堆疊追蹤 (Stacktrace / Logcat)

```text
請將錯誤訊息或 Exception 貼於此處
```

### 重現步驟 (Steps to Reproduce)
1. 執行指令：`apktool d target.apk`

### 系統框架檔 (Frameworks)
若此 APK 來自手機原廠 ROM（如 Samsung, Xiaomi, HTC 等），請附上原廠 `/system/framework` 內的 `framework-res.apk` 檔案。

### APK 檔案
若此 APK 可公開分享，請貼上下載連結以利團隊測試與重現問題。

### 提報前檢查清單
1. [ ] 您是否嘗試過對未修改之原始 APK 執行 `apktool d` 與 `apktool b`？
2. [ ] 若您嘗試安裝修改後的 APK，您是否已有進行金鑰簽署 (Resign)？
3. [ ] 您使用的是否為 Apktool 最新發布版本？
