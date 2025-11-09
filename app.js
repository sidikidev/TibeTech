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

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// MySQL Pool avec SSL (obligatoire pour Railway)
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: {
    rejectUnauthorized: true
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Contenus textes
const homeStartingContent = "Bienvenue chez TIBE-TECH SARL, votre partenaire de confiance...";
const aboutContent = "Chez TIBE-TECH SARL, nous croyons que chaque projet mérite une solution moderne...";
const contactContent = "Pour toute demande d’information, de devis ou de collaboration...";
const projectsContent = "TIBE-TECH SARL, votre partenaire de confiance pour des solutions techniques durables...";

// Routes
app.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM posts ORDER BY id DESC LIMIT 6");
    const posts = rows.map(post => ({
      ...post,
      content: post.content ? post.content.toString() : ""
    }));

    res.render("home", {
      startingContent: homeStartingContent,
      posts
    });
  } catch (err) {
    console.error("Erreur MySQL :", err);
    res.send("Erreur MySQL : " + err.message);
  }
});

app.get("/about", (req, res) => {
  res.render("about", { aboutContent });
});

app.get("/contact", (req, res) => {
  res.render("contact", { contactContent });
});

app.get("/projects", (req, res) => {
  res.render("projects", { projectsContent });
});

app.get("/blogpost", (req, res) => {
  res.render("blogpost");
});

app.get("/compose", (req, res) => {
  res.render("compose");
});

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

// Démarrage du serveur
app.listen(PORT, () => console.log(`Serveur en écoute sur le port ${PORT}`));
