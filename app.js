//jshint esversion:6

import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import _ from "lodash";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Détection du mode Railway
if (process.env.RAILWAY_ENVIRONMENT) {
  console.log("☁️ Mode RAILWAY détecté (variables Railway chargées)");
}

// Middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Connexion MySQL (Railway ou locale)
const db = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.DB_HOST || "localhost",
  user: process.env.MYSQLUSER || process.env.DB_USER || "root",
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || "",
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || "tibetechdb",
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  ssl: process.env.RAILWAY_ENVIRONMENT ? { rejectUnauthorized: true } : false,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Vérification de la connexion MySQL
(async () => {
  try {
    const conn = await db.getConnection();
    console.log("✅ Connexion MySQL réussie !");
    conn.release();
  } catch (err) {
    console.error("❌ Erreur de connexion MySQL :", err);
  }
})();

// --- ROUTES ---
const homeStartingContent = "Bienvenue chez TIBE-TECH SARL, votre partenaire de confiance...";
const aboutContent = "Chez TIBE-TECH SARL, nous croyons que chaque projet mérite une solution moderne...";
const contactContent = "Pour toute demande d’information, de devis ou de collaboration...";
const projectsContent = "TIBE-TECH SARL, votre partenaire de confiance pour des solutions techniques durables...";

app.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM posts ORDER BY id DESC LIMIT 6");
    const posts = rows.map(post => ({
      ...post,
      content: post.content ? post.content.toString() : ""
    }));
    res.render("home", { startingContent: homeStartingContent, posts });
  } catch (err) {
    console.error("Erreur MySQL :", err);
    res.send("Erreur MySQL : " + err.message);
  }
});

app.get("/about", (req, res) => res.render("about", { aboutContent }));
app.get("/contact", (req, res) => res.render("contact", { contactContent }));
app.get("/projects", (req, res) => res.render("projects", { projectsContent }));
app.get("/blogpost", (req, res) => res.render("blogpost"));
app.get("/compose", (req, res) => res.render("compose"));

app.post("/compose", async (req, res) => {
  const { postTitle, postBody } = req.body;
  try {
    await db.query("INSERT INTO posts (title, content) VALUES (?, ?)", [postTitle, postBody]);
    res.redirect("/");
  } catch (err) {
    console.error("Erreur MySQL (INSERT) :", err);
    res.send("Erreur MySQL : " + err.message);
  }
});

app.get("/posts/:postName", async (req, res) => {
  const requestedTitle = _.lowerCase(req.params.postName);
  try {
    const [rows] = await db.query("SELECT * FROM posts");
    const post = rows.find(p => _.lowerCase(p.title) === requestedTitle);
    if (post) {
      res.render("post", { title: post.title, content: post.content });
    } else {
      res.send("Article non trouvé.");
    }
  } catch (err) {
    console.error("Erreur MySQL :", err);
    res.send("Erreur lors du chargement de l'article.");
  }
});

app.listen(PORT, () => console.log(`✅ Serveur en écoute sur le port ${PORT}`));
