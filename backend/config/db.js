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

        db.run(`CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            author TEXT NOT NULL,
            price REAL NOT NULL,
            imageSrc TEXT NOT NULL
        )`);
    }
});
