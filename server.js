const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = 3000;

const uploadFolder = path.join(__dirname, "uploads");

// Create uploads folder if it does not exist
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder);
}

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder);
    },

    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage });


// ===============================
// GET ALL FILES
// ===============================

app.get("/api/files", (req, res) => {

    fs.readdir(uploadFolder, (err, files) => {

        if (err) {
            return res.status(500).json({
                message: "Unable to read files"
            });
        }

        const fileData = files.map(file => {

            const filePath = path.join(uploadFolder, file);
            const stats = fs.statSync(filePath);

            return {
                name: file,
                size: stats.size,
                type: stats.isDirectory() ? "folder" : "file"
            };
        });

        res.json(fileData);
    });
});


// ===============================
// UPLOAD FILE
// ===============================

app.post("/api/upload", upload.single("file"), (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            message: "No file selected"
        });
    }

    res.json({
        message: "File uploaded successfully",
        file: req.file.filename
    });
});


// ===============================
// DOWNLOAD FILE
// ===============================

app.get("/api/download/:filename", (req, res) => {

    const filename = req.params.filename;

    const filePath = path.join(uploadFolder, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).send("File not found");
    }

    res.download(filePath);
});


// ===============================
// DELETE FILE
// ===============================

app.delete("/api/files/:filename", (req, res) => {

    const filename = req.params.filename;

    const filePath = path.join(uploadFolder, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            message: "File not found"
        });
    }

    fs.unlink(filePath, (err) => {

        if (err) {
            return res.status(500).json({
                message: "Delete failed"
            });
        }

        res.json({
            message: "File deleted successfully"
        });
    });
});


// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});