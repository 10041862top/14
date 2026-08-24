/**
 * Apktool 繁體中文版 - Node.js 本地原生後端伺服器 (Server Backend)
 * 呼叫原生 Java apktool.jar 執行 100% 完全實體之反編譯 (apktool d) 與回編譯打包 (apktool b)
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Multer storage configuration for APK uploads
const uploadDir = path.join(__dirname, 'uploads');
const workspaceDir = path.join(__dirname, 'workspace');
fs.ensureDirSync(uploadDir);
fs.ensureDirSync(workspaceDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});

const upload = multer({ storage });

// Path to Apktool Jar
const APKTOOL_JAR = path.join(__dirname, 'brut.apktool/apktool-cli/build/libs/apktool-cli-all.jar');

/**
 * 1. API: 真實原生反編譯 (apktool d)
 */
app.post('/api/decode', upload.single('apk'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: '請提供 APK 檔案' });
        }

        const apkPath = req.file.path;
        const projectFolderName = path.basename(req.file.filename, path.extname(req.file.filename));
        const outputDir = path.join(workspaceDir, projectFolderName);

        await fs.remove(outputDir);

        // Execute native Apktool Java CLI
        const cmd = `java -jar "${APKTOOL_JAR}" d "${apkPath}" -o "${outputDir}" -f --use-aapt2`;
        console.log(`[Executing] ${cmd}`);

        exec(cmd, async (error, stdout, stderr) => {
            if (error) {
                console.error(`[Decode Error]`, stderr);
                return res.status(500).json({ error: stderr || error.message });
            }

            // Scan decoded folder tree
            const tree = await scanDirectory(outputDir, outputDir);
            res.json({
                message: '反編譯成功！',
                projectId: projectFolderName,
                outputDir,
                tree,
                log: stdout
            });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * 2. API: 儲存修訂檔案
 */
app.post('/api/save-file', async (req, res) => {
    try {
        const { projectId, filePath, content } = req.body;
        const fullPath = path.join(workspaceDir, projectId, filePath);

        await fs.outputFile(fullPath, content, 'utf8');
        res.json({ message: '檔案修改已成功寫入硬碟！', path: filePath });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * 3. API: 真實原生打包回編譯 (apktool b)
 */
app.post('/api/build', async (req, res) => {
    try {
        const { projectId } = req.body;
        const inputDir = path.join(workspaceDir, projectId);
        const outputApk = path.join(workspaceDir, `${projectId}_rebuilt.apk`);

        const cmd = `java -jar "${APKTOOL_JAR}" b "${inputDir}" -o "${outputApk}" --use-aapt2`;
        console.log(`[Executing] ${cmd}`);

        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`[Build Error]`, stderr);
                return res.status(500).json({ error: stderr || error.message });
            }

            res.json({
                message: '打包成功！',
                downloadUrl: `/api/download/${path.basename(outputApk)}`,
                log: stdout
            });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * 4. API: 下載打包完成之 APK
 */
app.get('/api/download/:filename', (req, res) => {
    const filePath = path.join(workspaceDir, req.params.filename);
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ error: '檔案不存在' });
    }
});

// Helper to recursively scan workspace directory
async function scanDirectory(dir, baseDir) {
    const items = await fs.readdir(dir);
    const result = [];

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
        const stat = await fs.stat(fullPath);

        if (stat.isDirectory()) {
            result.push({
                name: item,
                path: relativePath,
                type: 'directory',
                children: await scanDirectory(fullPath, baseDir)
            });
        } else {
            result.push({
                name: item,
                path: relativePath,
                type: 'file',
                size: stat.size
            });
        }
    }
    return result;
}

app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` Apktool 繁體中文原生後端 API 伺服器已啟動！`);
    console.log(` 服務位址: http://localhost:${PORT}`);
    console.log(`====================================================`);
});
