# Apktool 貢獻指南 (Contributing Guidelines)

感謝您對 Apktool 專案感興趣並考慮提交貢獻！以下是一些簡單的指引：

1. **Pull Request 提交**：
   - 您可以使用 [GitHub 儲存庫 (10041862top/14)](https://github.com/10041862top/14) 提交 PR。
2. **關聯 Issue 編號**：
   - 請在 PR 標題或描述中附上對應的 Issue 編號（如 `Fixes #123`），方便追蹤。
3. **新增單元測試**：
   - 任何程式碼修復或新功能請盡可能加入 Unit-test 單元測試。
4. **Gradle 測試驗證**：
   - 於本地執行 `./gradlew build` 會自動運行單元測試，若有任何測試失敗將中止構建。
5. **開發工具選擇**：
   - 推薦使用 [IntelliJ IDEA](http://www.jetbrains.com/idea/) 進行開發，其具備良好的 Gradle 整合與 Smali 偵錯環境。

---

## 程式碼撰寫規範 (Code Styles)

* 參照 **AOSP (Android Open Source Project)** 之程式碼風格手冊。
* 縮排統一使用 **4 個空格**（無 Tab）。
* 單行最大長度建議不超過 **120 字元**。
