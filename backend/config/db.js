import sqlite from 'sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dbPath = path.join(path.dirname(filename), 'library.db')


export const db = new sqlite.Database(dbPath, (err) => {
    if(err){
        console.log('connecting failed',err);  
    }else{
        console.log('connected susseccfully');

        db.run(`CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            author TEXT NOT NULL,
            price REAL NOT NULL,
            imageSrc TEXT NOT NULL,
            categoryId INTEGER,
            FOREIGN KEY (categoryId) REFERENCES categories(id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT NOT NULL,
            password TEXT NOT NULL,
            profile TEXT,
            role TEXT DEFAULT 'user'
        )`);
    }
});


























// import { createClient } from "@libsql/client";
// import "dotenv/config";

// export const db = createClient({
//   url: process.env.TURSO_DATABASE_URL,
//   authToken: process.env.TURSO_AUTH_TOKEN,
// });

// export const initDb = async () => {
//   try {
//     await db.execute(`
//       CREATE TABLE IF NOT EXISTS books (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         name TEXT NOT NULL,
//         description TEXT NOT NULL,
//         author TEXT NOT NULL,
//         price REAL NOT NULL,
//         imageSrc TEXT NOT NULL
//       )
//     `);

//     console.log("Database initialized successfully");
//   } catch (err) {
//     console.log("Database initialization failed", err);
//   }
// };