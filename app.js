/* ==========================================================================
   Apktool Traditional Chinese Showcase - Real Engine Implementation (JSZip)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // Global Working Memory for Uploaded & Extracted APK
    let currentZipFiles = {}; // Holds path -> Uint8Array / String
    let loadedZip = null;
    let selectedFilePath = null;
    let originalFileName = 'app-release.apk';
    let rebuiltBlob = null;

    // DOM Elements
    const sampleSelect = document.getElementById('sample-select');
    const btnDecode = document.getElementById('btn-decode');
    const btnBuild = document.getElementById('btn-build');
    const btnDownloadApk = document.getElementById('btn-download-apk');
    const treePlaceholder = document.getElementById('tree-placeholder');
    const fileTreeRoot = document.getElementById('file-tree-root');
    const codeEditor = document.getElementById('code-editor');
    const currentFilename = document.getElementById('current-filename');
    const fileTypeTag = document.getElementById('file-type-tag');
    const consoleLog = document.getElementById('console-log');
    const btnClearLog = document.getElementById('btn-clear-log');
    const btnSaveFile = document.getElementById('btn-save-file');
    const editorStatus = document.getElementById('editor-status');
    const dropzone = document.getElementById('dropzone');
    const dropzoneInput = document.createElement('input');

    dropzoneInput.type = 'file';
    dropzoneInput.accept = '.apk,.zip';
    dropzoneInput.style.display = 'none';
    document.body.appendChild(dropzoneInput);

    let selectedFileObject = null;

    // Logging helper
    function log(msg, type = 'info') {
        const time = new Date().toLocaleTimeString('zh-TW', { hour12: false });
        const line = document.createElement('div');
        line.className = `log-line ${type}`;
        line.textContent = `[${time}] ${msg}`;
        consoleLog.appendChild(line);
        consoleLog.scrollTop = consoleLog.scrollHeight;
    }

    btnClearLog?.addEventListener('click', () => {
        consoleLog.innerHTML = '<div class="log-line info">[資訊] 日誌已清理。</div>';
    });

    // File Selector Dropzone Trigger
    dropzone.addEventListener('click', () => {
        dropzoneInput.click();
    });

    dropzoneInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            selectedFileObject = e.target.files[0];
            originalFileName = selectedFileObject.name;
            dropzone.querySelector('span').textContent = `已選擇: ${originalFileName} (${(selectedFileObject.size / (1024*1024)).toFixed(2)} MB)`;
            log(`已選擇本地檔案: ${originalFileName}。點擊「解構 APK 檔案」開始實際解包處理。`, 'warning');
        }
    });

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            selectedFileObject = e.dataTransfer.files[0];
            originalFileName = selectedFileObject.name;
            dropzone.querySelector('span').textContent = `已選擇: ${originalFileName} (${(selectedFileObject.size / (1024*1024)).toFixed(2)} MB)`;
            log(`已拖放檔案: ${originalFileName}。請點擊「解構 APK 檔案」開始解壓與分析。`, 'warning');
        }
    });

    // --- Core Action: Real Unpacking (apktool d) ---
    btnDecode.addEventListener('click', async () => {
        btnDecode.disabled = true;
        btnBuild.disabled = true;
        btnDownloadApk.style.display = 'none';
        currentZipFiles = {};
        fileTreeRoot.innerHTML = '';
        codeEditor.value = '';

        log(`開始執行真實解包流程: ${originalFileName}...`, 'ready');

        try {
            if (typeof JSZip === 'undefined') {
                throw new Error("JSZip 函式庫未載入，請確認網路連線。");
            }

            let zipDataBuffer;

            if (selectedFileObject) {
                log(`正在讀取本地 APK 二進位串流...`);
                zipDataBuffer = await selectedFileObject.arrayBuffer();
            } else {
                log(`未選擇本地檔案，建立內部結構測試解構模式...`);
                const zip = new JSZip();
                zip.file("AndroidManifest.xml", `<?xml version="1.0" encoding="utf-8"?>\n<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="com.demo.real">\n    <application android:label="Demomode">\n        <activity android:name=".MainActivity" />\n    </application>\n</manifest>`);
                zip.file("apktool.yml", `version: 3.0.0\napkFileName: ${originalFileName}\nisFrameworkApk: false\npackageInfo:\n  curPackage: com.demo.real`);
                zip.file("res/values/strings.xml", `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <string name="app_name">真實解包與打包示範</string>\n    <string name="welcome">本網頁支援真實檔案解壓與重構打包</string>\n</resources>`);
                zip.file("smali/com/demo/real/MainActivity.smali", `.class public Lcom/demo/real/MainActivity;\n.super Landroid/app/Activity;\n\n.method public constructor <init>()V\n    invoke-direct {p0}, Landroid/app/Activity;-><init>()V\n    return-void\n.end method`);
                zipDataBuffer = await zip.generateAsync({ type: "arraybuffer" });
            }

            log(`正在提取並解析 ZIP / APK 二進位壓縮檔目錄與位元組...`);
            loadedZip = await JSZip.loadAsync(zipDataBuffer);

            const filePaths = Object.keys(loadedZip.files);
            log(`解包成功！共讀取到 ${filePaths.length} 個內部實體檔案。`, 'success');

            for (const path of filePaths) {
                const zipEntry = loadedZip.files[path];
                if (!zipEntry.dir) {
                    if (isTextFile(path)) {
                        const textContent = await zipEntry.async("string");
                        currentZipFiles[path] = textContent;
                    } else {
                        const binaryContent = await zipEntry.async("uint8array");
                        currentZipFiles[path] = binaryContent;
                    }
                }
            }

            renderRealFileTree();
            btnDecode.disabled = false;
            btnBuild.disabled = false;

        } catch (err) {
            log(`[錯誤] APK 解包失敗: ${err.message}`, 'error');
            btnDecode.disabled = false;
        }
    });

    // Check if path is text/editable
    function isTextFile(path) {
        const textExtensions = ['.xml', '.yml', '.txt', '.smali', '.json', '.properties', '.html', '.css', '.js'];
        return textExtensions.some(ext => path.toLowerCase().endsWith(ext));
    }

    // --- Render Real Tree ---
    function renderRealFileTree() {
        treePlaceholder.classList.add('hidden');
        fileTreeRoot.classList.remove('hidden');
        fileTreeRoot.innerHTML = '';

        const paths = Object.keys(currentZipFiles);
        if (paths.length === 0) return;

        paths.forEach((path, index) => {
            const li = document.createElement('li');
            const fileItem = document.createElement('div');
            fileItem.className = 'tree-item';

            let iconClass = 'fa-file';
            if (path.endsWith('.xml')) iconClass = 'fa-file-excel';
            if (path.endsWith('.yml')) iconClass = 'fa-gear';
            if (path.endsWith('.smali')) iconClass = 'fa-code';
            if (path.endsWith('.dex')) iconClass = 'fa-box';
            if (path.endsWith('.arsc')) iconClass = 'fa-database';

            const isBinary = !isTextFile(path);
            const badge = isBinary ? '<span class="file-tag" style="font-size:0.65rem; padding:1px 4px; margin-left:auto;">BIN</span>' : '';

            fileItem.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${path}</span> ${badge}`;

            fileItem.addEventListener('click', () => {
                document.querySelectorAll('.tree-item').forEach(el => el.classList.remove('active'));
                fileItem.classList.add('active');
                openRealFile(path);
            });

            fileTreeRoot.appendChild(li);
            li.appendChild(fileItem);

            if (index === 0) {
                fileItem.classList.add('active');
                openRealFile(path);
            }
        });
    }

    // --- Open File ---
    function openRealFile(path) {
        selectedFilePath = path;
        currentFilename.textContent = path;
        const data = currentZipFiles[path];

        if (typeof data === 'string') {
            codeEditor.readOnly = false;
            codeEditor.value = data;
            fileTypeTag.textContent = '文字可編輯';
            editorStatus.innerHTML = `<i class="fa-solid fa-file-pen"></i> 正檢視可編輯文字檔: ${path}`;
        } else {
            codeEditor.readOnly = true;
            codeEditor.value = `[二進位檔案 / Binary File: ${path}]\n容量大小: ${(data.byteLength / 1024).toFixed(2)} KB\n二進位檔 (如 .dex, .arsc, 圖片) 無法直接作為純文字檢視，打包時將保持原樣寫回。`;
            fileTypeTag.textContent = '二進位檔 (唯讀)';
            editorStatus.innerHTML = `<i class="fa-solid fa-lock"></i> 二進位檔案只讀保護中`;
        }
    }

    // --- Save Modified Text File ---
    btnSaveFile?.addEventListener('click', () => {
        if (selectedFilePath && typeof currentZipFiles[selectedFilePath] === 'string') {
            currentZipFiles[selectedFilePath] = codeEditor.value;
            log(`[儲存成功] 檔案變更已寫入網頁運作記憶體: ${selectedFilePath}`, 'success');
            editorStatus.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#4ade80;"></i> 修改已儲存！點擊「重構打包 APK」即可打包產出新檔。`;
        }
    });

    // --- Core Action: Real Repackaging & Zip Creation (apktool b) ---
    btnBuild.addEventListener('click', async () => {
        btnBuild.disabled = true;
        log(`開始執行真實二進位打包與壓縮流程...`, 'ready');

        try {
            const zip = new JSZip();

            for (const path of Object.keys(currentZipFiles)) {
                const content = currentZipFiles[path];
                zip.file(path, content);
            }

            log(`正在以 DEFLATE 壓縮演算法封裝二進位包 (APK)...`);
            rebuiltBlob = await zip.generateAsync({
                type: "blob",
                compression: "DEFLATE",
                compressionOptions: { level: 6 }
            });

            const sizeMB = (rebuiltBlob.size / (1024 * 1024)).toFixed(2);
            log(`S: 重構打包成功！正式生成全新二進位 APK 檔案 (${sizeMB} MB)`, 'success');
            
            btnDownloadApk.style.display = 'inline-flex';
            btnBuild.disabled = false;

        } catch (err) {
            log(`[錯誤] 打包過程中發生例外: ${err.message}`, 'error');
            btnBuild.disabled = false;
        }
    });

    // --- Download Rebuilt APK ---
    btnDownloadApk?.addEventListener('click', () => {
        if (!rebuiltBlob) return;

        const downloadUrl = URL.createObjectURL(rebuiltBlob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        const outName = originalFileName.replace(/\.apk$/i, '') + '_rebuilt.apk';
        a.download = outName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);

        log(`已觸發瀏覽器下載檔案: ${outName}`, 'success');
    });

    // ==========================================================================
    // CLI Command Helper & Smali Search & Doc Tabs Logic
    // ==========================================================================
    const modeRadios = document.querySelectorAll('input[name="mode"]');
    const inputPath = document.getElementById('cli-input-path');
    const outputPath = document.getElementById('cli-output-path');
    const flagForce = document.getElementById('flag-force');
    const flagNoRes = document.getElementById('flag-no-res');
    const flagNoSrc = document.getElementById('flag-no-src');
    const flagAapt2 = document.getElementById('flag-aapt2');
    const flagMatchOriginal = document.getElementById('flag-match-original');
    const flagVerbose = document.getElementById('flag-verbose');

    const generatedCommand = document.getElementById('generated-command');
    const commandExplanation = document.getElementById('command-explanation');
    const btnCopyCmd = document.getElementById('btn-copy-cmd');

    function updateCommand() {
        const mode = document.querySelector('input[name="mode"]:checked').value;
        const input = inputPath.value.trim() || 'app.apk';
        const output = outputPath.value.trim();

        let cmd = `apktool ${mode} ${input}`;
        let explanations = [];

        if (mode === 'd') {
            explanations.push(`<code>d</code>：執行反編譯 (Decode) 命令，解開 APK 資源與代碼。`);
        } else if (mode === 'b') {
            explanations.push(`<code>b</code>：執行回編譯 (Build) 命令，打包解開的資料夾為新 APK。`);
        } else if (mode === 'if') {
            explanations.push(`<code>if</code>：執行匯入框架 (Install Framework) 命令。`);
        }

        if (output && mode !== 'if') {
            cmd += ` -o ${output}`;
            explanations.push(`<code>-o ${output}</code>：指定輸出目的地路徑。`);
        }

        if (flagForce.checked) {
            cmd += ' -f';
            explanations.push(`<code>-f / --force</code>：若目標目錄已存在，強行覆寫。`);
        }
        if (flagNoRes.checked && mode === 'd') {
            cmd += ' -r';
            explanations.push(`<code>-r / --no-res</code>：忽略資源檔解碼 (保留 arsc 原始檔)。`);
        }
        if (flagNoSrc.checked && mode === 'd') {
            cmd += ' -s';
            explanations.push(`<code>-s / --no-src</code>：不將 Dex 轉為 Smali (僅解碼資源)。`);
        }
        if (flagAapt2.checked) {
            cmd += ' --use-aapt2';
            explanations.push(`<code>--use-aapt2</code>：採用 Google AAPT2 工具作為資源打包核心。`);
        }
        if (flagMatchOriginal.checked) {
            cmd += ' -m';
            explanations.push(`<code>-m / --match-original</code>：極力維持原始 APK 檔案結構結構不變。`);
        }
        if (flagVerbose.checked) {
            cmd += ' -v';
            explanations.push(`<code>-v / --verbose</code>：顯示詳細偵錯印出日誌。`);
        }

        generatedCommand.textContent = cmd;
        commandExplanation.innerHTML = explanations.map(e => `<li>${e}</li>`).join('');
    }

    [modeRadios, inputPath, outputPath, flagForce, flagNoRes, flagNoSrc, flagAapt2, flagMatchOriginal, flagVerbose].forEach(el => {
        if (el instanceof NodeList) {
            el.forEach(r => r.addEventListener('change', updateCommand));
        } else {
            el?.addEventListener('input', updateCommand);
            el?.addEventListener('change', updateCommand);
        }
    });

    updateCommand();

    btnCopyCmd?.addEventListener('click', () => {
        navigator.clipboard.writeText(generatedCommand.textContent).then(() => {
            const originalText = btnCopyCmd.innerHTML;
            btnCopyCmd.innerHTML = `<i class="fa-solid fa-check"></i> 已複製！`;
            btnCopyCmd.classList.replace('btn-primary', 'btn-success');
            setTimeout(() => {
                btnCopyCmd.innerHTML = originalText;
                btnCopyCmd.classList.replace('btn-success', 'btn-primary');
            }, 2000);
        });
    });

    // Smali Search
    const smaliSearch = document.getElementById('smali-search');
    const smaliCards = document.querySelectorAll('.smali-card');

    smaliSearch?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        smaliCards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(query) ? 'block' : 'none';
        });
    });

    // Documentation Tabs
    const docTabs = document.querySelectorAll('.doc-tab-btn');
    const docPanes = document.querySelectorAll('.doc-pane');

    docTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            docTabs.forEach(t => t.classList.remove('active'));
            docPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            document.getElementById(targetId)?.classList.add('active');
        });
    });

});
