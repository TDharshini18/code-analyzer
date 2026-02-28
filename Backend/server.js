const express = require('express');
const multer = require('multer');
const AdmZip = require('adm-zip');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const simpleGit = require('simple-git');
const { analyzeProject } = require('./analyzer');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));
app.use(express.json());
app.use(cors());


app.post('/upload', upload.single('zipfile'), async (req, res) => {
    try {
        const zipPath = req.file.path;
        const extractPath = path.join(__dirname, 'uploads', Date.now().toString());

        const zip = new AdmZip(zipPath);
        zip.extractAllTo(extractPath, true);

        const result = await analyzeProject(extractPath);
        
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/github', async (req, res) => {
    try {
        const repoUrl = req.body.repo;
        const repoPath = path.join(__dirname, 'uploads', Date.now().toString());

        await simpleGit().clone(repoUrl, repoPath);
        const result = await analyzeProject(repoPath);

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
});