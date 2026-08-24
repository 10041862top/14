/* ==========================================================================
   Apktool Traditional Chinese Showcase - Interactive JavaScript Application
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --- Mock Sample Data Store ---
    const sampleFiles = {
        'demo_app': {
            'AndroidManifest.xml': `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.demoapp"
    android:versionCode="100"
    android:versionName="1.0.0">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/AppTheme">

        <activity android:name=".MainActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,

            'apktool.yml': `version: 2.9.3
apkFileName: DemoApp_v1.0.apk
isFrameworkApk: false
usesFramework:
  ids: [1]
sdkInfo:
  minSdkVersion: '21'
  targetSdkVersion: '33'
packageInfo:
  curPackage: com.example.demoapp
  origPackage: com.example.demoapp
versionInfo:
  versionCode: '100'
  versionName: 1.0.0
doNotCompress:
- arsc
- png`,

            'res/values/strings.xml': `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Apktool 繁體中文示範應用</string>
    <string name="welcome_message">歡迎使用 Apktool 線上動態反編譯模擬器！</string>
    <string name="btn_login">登入系統</string>
    <string name="status_ready">系統運作正常</string>
</resources>`,

            'smali/com/example/MainActivity.smali': `.class public Lcom/example/demoapp/MainActivity;
.super Landroidx/appcompat/app/AppCompatActivity;
.source "MainActivity.java"

# static fields
.field private static final TAG:Ljava/lang/String; = "MainActivity"

# direct methods
.method public constructor <init>()V
    .registers 1

    .line 12
    invoke-direct {p0}, Landroidx/appcompat/app/AppCompatActivity;-><init>()V

    return-void
.end method

# virtual methods
.method protected onCreate(Landroid/os/Bundle;)V
    .registers 3
    .param p1, "savedInstanceState"    # Landroid/os/Bundle;

    .line 16
    invoke-super {p0, p1}, Landroidx/appcompat/app/AppCompatActivity;->onCreate(Landroid/os/Bundle;)V

    const v0, 0x7f0b001c

    .line 17
    invoke-virtual {p0, v0}, Lcom/example/demoapp/MainActivity;->setContentView(I)V

    .line 18
    const-string v0, "Apktool Traditional Chinese Version Loaded"
    
    invoke-static {v0}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    return-void
.end method`
        },
        'game_mod': {
            'AndroidManifest.xml': `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.game.modded">
    <application android:label="@string/game_title">
        <activity android:name=".GameActivity" />
    </application>
</manifest>`,
            'apktool.yml': `version: 2.9.3\napkFileName: GameMod_v2.4.apk\nminSdkVersion: '24'`,
            'res/values/strings.xml': `<resources>\n    <string name="game_title">超級動作遊戲 (無敵 MOD)</string>\n    <string name="coins">金幣: 999999</string>\n</resources>`,
            'smali/com/game/Player.smali': `.class public Lcom/game/Player;\n.method public getHealth()I\n    const/16 v0, 0x2710 # 10000 HP\n    return v0\n.end method`
        },
        'sys_framework': {
            'AndroidManifest.xml': `<?xml version="1.0" encoding="utf-8"?>\n<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="android" coreApp="true">\n</manifest>`,
            'apktool.yml': `version: 2.9.3\nisFrameworkApk: true\npackageInfo:\n  pkgId: '01'`,
            'res/values/strings.xml': `<resources>\n    <string name="ok">確定</string>\n    <string name="cancel">取消</string>\n</resources>`
        }
    };

    let activeSampleKey = 'demo_app';
    let currentDecompiledData = null;
    let selectedFilePath = null;

    // DOM Elements
    const sampleSelect = document.getElementById('sample-select');
    const btnDecode = document.getElementById('btn-decode');
    const btnBuild = document.getElementById('btn-build');
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

    // --- Logging Function ---
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

    // --- Decode Action (apktool d) ---
    btnDecode.addEventListener('click', () => {
        activeSampleKey = sampleSelect.value;
        const sampleName = sampleSelect.options[sampleSelect.selectedIndex].text;

        log(`開始執行反編譯命令: apktool d ${sampleName} -o output_dir`, 'ready');
        btnDecode.disabled = true;
        btnBuild.disabled = true;

        setTimeout(() => log(`I: 使用 Apktool v3.0.0 (繁體中文版)`), 300);
        setTimeout(() => log(`I: 正在載入並解析資源數據表 (resources.arsc)...`), 600);
        setTimeout(() => log(`I: 解碼 AndroidManifest.xml 檔案...`), 900);
        setTimeout(() => log(`I: 呼叫 Baksmali 轉譯 Dex 位元組碼 -> Smali 組合語言...`), 1200);
        setTimeout(() => log(`I: 處理 9-patch 圖像與 XML 佈局樣式...`), 1600);
        setTimeout(() => log(`I: 生成建置屬性設定檔 (apktool.yml)...`), 1900);

        setTimeout(() => {
            log(`S: APK 解碼完成！已建立目錄結構: ./output_dir/`, 'success');
            currentDecompiledData = JSON.parse(JSON.stringify(sampleFiles[activeSampleKey]));
            renderFileTree();
            btnDecode.disabled = false;
            btnBuild.disabled = false;
        }, 2200);
    });

    // --- Build Action (apktool b) ---
    btnBuild.addEventListener('click', () => {
        log(`開始執行回編譯命令: apktool b output_dir -o new_rebuilt.apk --use-aapt2`, 'ready');
        btnBuild.disabled = true;

        setTimeout(() => log(`I: 正在檢查修訂檔案變更標籤...`), 300);
        setTimeout(() => log(`I: 呼叫 Smali 彙編器組裝 .smali 代碼 -> classes.dex...`), 700);
        setTimeout(() => log(`I: 呼叫 AAPT2 編譯資源檔 (res/values/strings.xml)...`), 1100);
        setTimeout(() => log(`I: 封裝二進位 APK 檔案結構...`), 1500);

        setTimeout(() => {
            log(`S: 回編譯成功！產出檔案: new_rebuilt.apk (容量: 3.4 MB)`, 'success');
            log(`W: 提示：此新建構之 APK 尚需進行數位金鑰簽署 (apksigner) 即可安裝。`, 'warning');
            btnBuild.disabled = false;
        }, 1900);
    });

    // --- File Tree Renderer ---
    function renderFileTree() {
        treePlaceholder.classList.add('hidden');
        fileTreeRoot.classList.remove('hidden');
        fileTreeRoot.innerHTML = '';

        if (!currentDecompiledData) return;

        const files = Object.keys(currentDecompiledData);

        files.forEach((path, index) => {
            const li = document.createElement('li');
            const fileItem = document.createElement('div');
            fileItem.className = 'tree-item';
            
            let iconClass = 'fa-file-code';
            if (path.endsWith('.xml')) iconClass = 'fa-file-excel';
            if (path.endsWith('.yml')) iconClass = 'fa-gear';
            if (path.endsWith('.smali')) iconClass = 'fa-code';

            fileItem.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${path}</span>`;
            
            fileItem.addEventListener('click', () => {
                document.querySelectorAll('.tree-item').forEach(el => el.classList.remove('active'));
                fileItem.classList.add('active');
                openFile(path);
            });

            li.appendChild(fileItem);
            fileTreeRoot.appendChild(li);

            if (index === 0) {
                fileItem.classList.add('active');
                openFile(path);
            }
        });
    }

    // --- Open File in Code Editor ---
    function openFile(path) {
        selectedFilePath = path;
        currentFilename.textContent = path;
        codeEditor.value = currentDecompiledData[path] || '';
        
        let ext = path.split('.').pop().toUpperCase();
        fileTypeTag.textContent = ext;
        editorStatus.innerHTML = `<i class="fa-solid fa-file-pen"></i> 目前檢視: ${path}`;
    }

    // --- Save File Changes ---
    btnSaveFile?.addEventListener('click', () => {
        if (selectedFilePath && currentDecompiledData) {
            currentDecompiledData[selectedFilePath] = codeEditor.value;
            editorStatus.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#4ade80;"></i> 變更已暫存！可點擊「執行回編譯」驗證打包。`;
            log(`[編輯器] 已更新暫存內容: ${selectedFilePath}`, 'info');
        }
    });

    // --- Drag and Drop File Upload Mock ---
    dropzone?.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });

    dropzone?.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });

    dropzone?.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const fileName = files[0].name;
            log(`接收上傳檔案: ${fileName}。載入自訂測試模式...`, 'warning');
            
            // Add custom file entry
            sampleFiles['custom'] = {
                'AndroidManifest.xml': `<?xml version="1.0" encoding="utf-8"?>\n<manifest package="com.user.custom">\n    <application android:label="${fileName}" />\n</manifest>`,
                'apktool.yml': `version: 3.0.0\napkFileName: ${fileName}`,
                'smali/CustomClass.smali': `.class public Lcom/user/CustomClass;\n.super Ljava/lang/Object;`
            };

            const opt = document.createElement('option');
            opt.value = 'custom';
            opt.text = `${fileName} (拖放上傳)`;
            sampleSelect.appendChild(opt);
            sampleSelect.value = 'custom';
            
            btnDecode.click();
        }
    });

    // ==========================================================================
    // CLI Command Generator Logic
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

    // ==========================================================================
    // Smali Search Filter
    // ==========================================================================
    const smaliSearch = document.getElementById('smali-search');
    const smaliCards = document.querySelectorAll('.smali-card');

    smaliSearch?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        smaliCards.forEach(card => {
            const text = card.textContent.toLowerCase();
            if (text.includes(query)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });

    // ==========================================================================
    // Documentation Tabs Logic
    // ==========================================================================
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
