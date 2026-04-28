import express from "express";
import { db } from "./config/db.js";
import sqlite3 from "sqlite3";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

const PORT = 3000;
const app = express();
app.use(express.json());
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  }),
);
app.use("/uploads", express.static(uploadsDir));

app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image file uploaded" });
  }

  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  return res.status(201).json({ imageUrl });
});

app.post("/api/books", (req, res) => {
  const { name, description, author, price, imageSrc } = req.body;
  if (!name || !description || !author || !price || !imageSrc) {
    console.log("all fields are required");
    return res.status(400).json({ message: "all fields are required" });
  }

  const query = `INSERT INTO books (name, description, author, price, imageSrc) VALUES (?, ?, ?, ?, ?)`;
  db.run(query, [name, description, author, price, imageSrc], (err) => {
    if (err) {
      console.log("error in creating book", err);
      return res.status(500).json({ message: "error in creating book" });
    }

    return res.status(201).json({ message: "book created successfully" });
  });
});

app.get("/api/books", (req, res) => {
  const query = `SELECT * FROM books`;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.log("error in getting data");
    }
    return res.status(200).json(rows);
  });
});

app.put("/api/books/:id", (req, res) => {
  const { id } = req.params;
  const { name, description, author, price, imageSrc } = req.body;
const query = `UPDATE books SET name = ?, description = ?, author = ?, price = ?, imageSrc = ? WHERE id = ?`;

  db.run(query, [name, description, author, price, imageSrc, id], (err) => {
    if (err) {
      console.log("error in updating book");
      return res.status(500).json({
        message: "error in updating book",
      });
    }
    return res.status(200).json({
      message: "book updated successfully",
    });
  });
});


app.delete("/api/books/:id", (req, res) => {
  const { id } = req.params;

  if (!id) return;

  const query = `DELETE FROM books WHERE id = ?`;

  db.run(query, [id], (err) => {
    if (err) {
      console.log("something went wrong while deleting book");
      return res.status(500).json({
        message: "something went wrong while deleting book",
      });
    }

    return res.status(200).json({
      message:'deleted book successfully'
    })

    });
  });

  app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
  });
