//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
require('dotenv').config();

const mysql = require("mysql2/promise");

const homeStartingContent = "Bienvenue chez TIBE-TECH SARL, votre partenaire de confiance dans les domaines du BTP, de l’électricité, de l’informatique et de la sécurité électronique. Nous mettons notre expertise et notre passion au service de vos projets, en alliant innovation, performance et fiabilité pour bâtir un avenir solide et connecté.";
const aboutContent = "Chez TIBE-TECH SARL, nous croyons que chaque projet mérite une solution moderne, sûre et durable. Spécialisés en BTP, électricité, informatique et sécurité électronique, nous accompagnons nos clients à chaque étape, avec un savoir-faire reconnu et une exigence de qualité irréprochable.";
const contactContent = "Pour toute demande d’information, de devis ou de collaboration, l’équipe TIBE-TECH SARL est à votre écoute. Contactez-nous dès aujourd’hui pour bénéficier de solutions fiables et adaptées à vos besoins en BTP, électricité, informatique ou sécurité électronique. Nous serons ravis de vous accompagner dans la réussite de vos projets.";
const projectsContent = "TIBE-TECH SARL, votre partenaire de confiance pour des solutions techniques durables en BTP, électricité, informatique et sécurité.";

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: true // obligatoire pour Railway MySQL
  }
});

app.get("/", async function (req, res) {
  try {
    const [rows] = await db.query("SELECT * FROM posts ORDER BY id DESC LIMIT 6 ");

    // Convertir les buffers en chaînes
    const posts = rows.map(post => {
      return {
        ...post,
        content: post.content ? post.content.toString() : ""
      };
    });

    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts
    });
  } catch (err) {
    console.error("Erreur MySQL :", err);
    res.send("Erreur MySQL : " + err.message);
  }
});



app.get("/about", function(req, res){
  res.render("about", {
    aboutContent: aboutContent
  });
});

app.get("/contact", function(req, res){
  res.render("contact", {
    contactContent: contactContent
  });
});

app.get("/projects", function(req, res){
  res.render("projects", {
    projectsContent: projectsContent
  });
});

app.get("/blogpost", function(req, res){
  res.render("blogpost");
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", async function (req, res) {
  const { postTitle, postBody } = req.body;

  try {
    await db.query("INSERT INTO posts (title, content) VALUES (?, ?)", [postTitle, postBody]);
    res.redirect("/");
  } catch (err) {
    console.error("Erreur MySQL (INSERT) :", err);
    res.send("Erreur MySQL : " + err.message);
  }
});


app.get("/posts/:postName", async function (req, res) {
  const requestedTitle = _.lowerCase(req.params.postName);

  try {
    const [rows] = await db.query("SELECT * FROM posts");
    const post = rows.find(p => _.lowerCase(p.title) === requestedTitle);

    if (post) {
      res.render("post", {
        title: post.title,
        content: post.content
      });
    } else {
      res.send("Article non trouvé.");
    }
  } catch (err) {
    console.error(err);
    res.send("Erreur lors du chargement de l'article.");
  }
});

app.listen(PORT, () => console.log(`Serveur en écoute sur le port ${PORT}`));
