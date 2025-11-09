// jshint esversion:6

import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import _ from "lodash";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// --- Middleware ---
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// --- Détection du mode Railway ---
const isRailway = !!process.env.MYSQLHOST;
console.log(`☁️ Mode ${isRailway ? "RAILWAY" : "LOCAL"} détecté (variables chargées)`);

// --- Pool MySQL ---
const db = mysql.createPool({
  host: isRailway ? process.env.MYSQLHOST : process.env.DB_HOST || "localhost",
  user: isRailway ? process.env.MYSQLUSER : process.env.DB_USER || "root",
  password: isRailway ? process.env.MYSQLPASSWORD : process.env.DB_PASSWORD || "",
  database: isRailway ? process.env.MYSQLDATABASE : process.env.DB_NAME || "tibetechdb",
  port: isRailway ? process.env.MYSQLPORT : process.env.DB_PORT || 3306,
  ssl: isRailway ? { rejectUnauthorized: true } : false,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// --- Test de connexion MySQL au démarrage ---
(async () => {
  try {
    const conn = await db.getConnection();
    console.log("✅ Connexion MySQL réussie !");
    conn.release();
  } catch (err) {
    console.error("❌ Erreur de connexion MySQL complète :", err);
  }
})();

// --- Contenus textes ---
const homeStartingContent = "Bienvenue chez TIBE-TECH SARL, votre partenaire de confiance...";
const aboutContent = "Chez TIBE-TECH SARL, nous croyons que chaque projet mérite une solution moderne...";
const contactContent = "Pour toute demande d’information, de devis ou de collaboration...";
const projectsContent = "TIBE-TECH SARL, votre partenaire de confiance pour des solutions techniques durables...";

// --- ROUTES ---
app.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM posts ORDER BY id DESC LIMIT 6");
    const posts = rows.map(post => ({
      ...post,
      content: post.content ? post.content.toString() : ""
    }));
    res.render("home", { startingContent: homeStartingContent, posts });
  } catch (err) {
    console.error("❌ Erreur MySQL complète :", err);
    res.send(`<h2>Erreur MySQL</h2><pre>${JSON.stringify(err, Object.getOwnPropertyNames(err), 2)}</pre>`);
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
    console.error("❌ Erreur MySQL (INSERT) complète :", err);
    res.send(`<h2>Erreur MySQL (INSERT)</h2><pre>${JSON.stringify(err, Object.getOwnPropertyNames(err), 2)}</pre>`);
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
      res.send("<h2>Article non trouvé.</h2>");
    }
  } catch (err) {
    console.error("❌ Erreur MySQL complète :", err);
    res.send(`<h2>Erreur MySQL</h2><pre>${JSON.stringify(err, Object.getOwnPropertyNames(err), 2)}</pre>`);
  }
});

// --- Démarrage du serveur ---
app.listen(PORT, () => console.log(`✅ Serveur en écoute sur le port ${PORT}`));
