import express from "express";
import { db } from "./config/db.js";
import cors from "cors";
import bycrptjs from "bcryptjs";

const PORT = 3000;
const app = express();
app.use(express.json({ limit: "50mb" }));

app.use(
  cors({
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
      credentials: true,
  }),
);

app.get("/api/search/:searchValue", (req, res) => {
  const { searchValue } = req.params;

 
  const searchQuery = `SELECT * FROM books WHERE name LIKE ? OR description LIKE ? OR author LIKE ?`;
  db.get(searchQuery, [`%${searchValue}%`, `%${searchValue}%`, `%${searchValue}%`], (err, rows) => {
    if (err) {
      return res.status(400).json({ message: "error in searching" });

    }
    console.log("search results", rows);
    return res.status(200).json(rows);
  });
});

app.post("/api/auth/sign-in", (req, res) => {
  const { email, password } = req.body;

  if (!password || !email) {
    console.log("all fields are required");
    return res.status(400).json("all fields are required");
  }

  const userQuery = `SELECT * FROM users WHERE email=?`;
  db.get(userQuery, [email], (err, rows) => {
    if (err) {
      return console.log("error in getting user", err);
    }
    
    if(rows){
      const hashedPassword = bycrptjs.compareSync(password, rows.password);

      if(hashedPassword){
        return res.status(200).json({ message: "logged in successfully", data: rows });
      }else{
        return res.status(400).json({ message: "invalid password" });
      }
      

    }else{
      return res.status(404).json({
        message: `User doesn't exist try to sign up`
      })
    }


  });
});

app.post("/api/auth", (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    console.log("all fields are riquired");
    return res.status(400).json("all fields are riquired");
  }

  const existingUser = `SELECT * FROM users WHERE email=?`;
  db.get(existingUser, [email], (err, rows) => {
    if (err) {
      return console.log("error in getting user", err);
    }
    console.log(rows, "FOR ", email);

    if (rows) {
      return res.status(400).json({ message: "this email is already exist" });
      
    } else {
      const hashedPass = bycrptjs.hashSync(password, 12);
      const query = `INSERT INTO users (username, email, password) VALUES(?,?,?)`;
      db.run(query, [username, email, hashedPass], (err) => {
        if (err) {
          return console.log("error in creating user", err);
        }
        return res.status(201).json({ message: "user created susseccfull" });
      });
    }
  });
});

app.get("/api/auth", (req, res) => {
  const query = `SELECT * FROM users`;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.log("error in getting data");
    }
    return res.status(200).json(rows);
  });
});

app.post("/api/books", (req, res) => {
  const { name, description, author, price, imageSrc, categoryId } = req.body;
  if (!name || !description || !author || !price || !imageSrc) {
    console.log("all fields are riquired");
    return res.status(400).json("all fields are riquired");
  }

  const query = `INSERT INTO books (name, description, author, price, imageSrc, categoryId) VALUES(?,?,?,?,?,?)`;
  db.run(query, [name, description, author, price, imageSrc, categoryId || null], (err) => {
    if (err) {
      return console.log("error in creating book", err);
    }
    return res.status(201).json({ message: "book created susseccfull" });
  });
});

app.put("/api/books/:id", (req, res) => {
  const { name, description, author, price } = req.body;
  const { id } = req.params;

  if (!name || !description || !author || !price) {
    console.log("all fields are required");
    return res.status(400).json("all fields are required");
  }

  if (!id) {
    return res.status(400).json("missing id");
  }

  const query = `UPDATE books SET name=?, description=?, author=?, price=? WHERE id=?`;

  db.run(query, [name, description, author, price, id], (err) => {
    if (err) {
      console.log("error in updating book", err);
      return res.status(500).json({ message: "error in updating book" });
    }
    return res.status(200).json({ message: "book updated successfully" });
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

app.get("/api/books/:id", (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM books WHERE id=?`;

  db.all(query, [id], (err, rows) => {
    if (err) {
      console.log("error in getting data");
    }
    return res.status(200).json(rows[0]);
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
      message: "deleted book successfully",
    });
  });
});

// ======== CATEGORY ENDPOINTS ========

app.post("/api/categories", (req, res) => {
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: "category name is required" });
  }

  const query = `INSERT INTO categories (name, description) VALUES(?,?)`;
  db.run(query, [name, description || ""], (err) => {
    if (err) {
      if (err.message.includes("UNIQUE")) {
        return res.status(400).json({ message: "category already exists" });
      }
      return res.status(500).json({ message: "error creating category" });
    }
    return res.status(201).json({ message: "category created successfully" });
  });
});

app.get("/api/categories", (req, res) => {
  const query = `SELECT * FROM categories`;
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "error fetching categories" });
    }
    return res.status(200).json(rows || []);
  });
});

app.get("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM categories WHERE id=?`;
  db.get(query, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ message: "error fetching category" });
    }
    return res.status(200).json(row);
  });
});

app.put("/api/categories/:id", (req, res) => {
  const { name, description } = req.body;
  const { id } = req.params;

  if (!name) {
    return res.status(400).json({ message: "category name is required" });
  }

  const query = `UPDATE categories SET name=?, description=? WHERE id=?`;
  db.run(query, [name, description || "", id], (err) => {
    if (err) {
      if (err.message.includes("UNIQUE")) {
        return res.status(400).json({ message: "category name already exists" });
      }
      return res.status(500).json({ message: "error updating category" });
    }
    return res.status(200).json({ message: "category updated successfully" });
  });
});

app.delete("/api/categories/:id", (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM categories WHERE id = ?`;
  db.run(query, [id], (err) => {
    if (err) {
      return res.status(500).json({ message: "error deleting category" });
    }
    return res.status(200).json({ message: "category deleted successfully" });
  });
});

app.get("/api/categories/:categoryId/books", (req, res) => {
  const { categoryId } = req.params;
  const query = `SELECT * FROM books WHERE categoryId=?`;
  db.all(query, [categoryId], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "error fetching books" });
    }
    return res.status(200).json(rows || []);
  });
});

app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});
