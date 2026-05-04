import express from "express";
import { db, initDb } from "./config/db.js";
import cors from "cors";
import "dotenv/config";

const PORT = 3000;
const app = express();

await initDb();

app.use(express.json({ limit: "50mb" }));

app.use(
  cors({
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

// CREATE BOOK
app.post("/api/books", async (req, res) => {
  try {
    const { name, description, author, price, imageSrc } = req.body;

    if (!name || !description || !author || !price || !imageSrc) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const query = `
      INSERT INTO books 
      (name, description, author, price, imageSrc) 
      VALUES (?, ?, ?, ?, ?)
    `;

    await db.execute({
      sql: query,
      args: [name, description, author, price, imageSrc],
    });

    return res.status(201).json({
      message: "Book created successfully",
    });
  } catch (error) {
    console.log("error in creating book", error);
    return res.status(500).json({
      message: "Error creating book",
    });
  }
});

// UPDATE BOOK
app.put("/api/books/:id", async (req, res) => {
  try {
    const { name, description, author, price } = req.body;
    const { id } = req.params;

    if (!name || !description || !author || !price) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const query = `
      UPDATE books 
      SET name=?, description=?, author=?, price=? 
      WHERE id=?
    `;

    await db.execute({
      sql: query,
      args: [name, description, author, price, id],
    });

    return res.status(200).json({
      message: "Book updated successfully",
    });
  } catch (error) {
    console.log("error in updating book", error);
    return res.status(500).json({
      message: "Error updating book",
    });
  }
});

// GET ALL BOOKS
app.get("/api/books", async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM books");

    return res.status(200).json(result.rows);
  } catch (error) {
    console.log("error in getting books", error);
    return res.status(500).json({
      message: "Error fetching books",
    });
  }
});

// GET SINGLE BOOK
app.get("/api/books/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.execute({
      sql: "SELECT * FROM books WHERE id=?",
      args: [id],
    });

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.log("error in getting book", error);
    return res.status(500).json({
      message: "Error fetching book",
    });
  }
});

// DELETE BOOK
app.delete("/api/books/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.execute({
      sql: "DELETE FROM books WHERE id=?",
      args: [id],
    });

    return res.status(200).json({
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.log("error in deleting book", error);
    return res.status(500).json({
      message: "Error deleting book",
    });
  }
});

app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});