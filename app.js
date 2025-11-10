// jshint esversion:6

import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import _ from "lodash";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// --- Middleware ---
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// --- Contenus textes ---
const homeStartingContent = "Bienvenue chez TIBE-TECH SARL, votre partenaire de confiance...";
const aboutContent = "Chez TIBE-TECH SARL, nous croyons que chaque projet mérite une solution moderne...";
const contactContent = "Pour toute demande d’information, de devis ou de collaboration...";
const projectsContent = "TIBE-TECH SARL, votre partenaire de confiance pour des solutions techniques durables...";

// --- Dictionnaire interne des posts ---
// --- Dictionnaire interne des posts ---
let posts = [
  {
    id: 1,
    title: "Les dernières tendances en informatique",
    content: "Découvrez comment l'intelligence artificielle, le cloud computing et la cybersécurité transforment les entreprises modernes. Nous partageons des conseils pratiques pour rester à la pointe de la technologie."
  },
  {
    id: 2,
    title: "Innovations dans le BTP",
    content: "Le secteur du BTP évolue avec des méthodes de construction durables, l'utilisation de drones pour le suivi des chantiers et la modélisation 3D des projets. Ces innovations permettent d'améliorer la sécurité et la productivité."
  },
  {
    id: 3,
    title: "Électricité et énergies renouvelables",
    content: "L'énergie solaire et l'efficacité énergétique sont au cœur des solutions électriques modernes. Nous explorons les meilleures pratiques pour l'installation de systèmes photovoltaïques et la réduction des consommations énergétiques."
  },
  {
    id: 4,
    title: "Formations professionnelles et développement",
    content: "Acquérir de nouvelles compétences est essentiel pour progresser. Nous proposons des formations en informatique, en gestion de projet, en sécurité électrique et en techniques du BTP adaptées aux professionnels et étudiants."
  },
  {
    id: 5,
    title: "Sécurité informatique et protection des données",
    content: "Avec la multiplication des cyberattaques, protéger vos systèmes et données est crucial. Nous partageons des stratégies de cybersécurité, des outils de chiffrement et des conseils pour sécuriser vos applications et réseaux."
  },
  {
    id: 6,
    title: "Techniques avancées dans le BTP",
    content: "Les nouvelles technologies permettent de concevoir des bâtiments plus solides et plus écologiques. Découvrez l'utilisation des matériaux innovants, l'automatisation des chantiers et l'optimisation des coûts dans vos projets de construction."
  }
];

// --- ROUTES ---
app.get("/", (req, res) => {
  res.render("home", { startingContent: homeStartingContent, posts });
});

app.get("/about", (req, res) => res.render("about", { aboutContent }));
app.get("/contact", (req, res) => res.render("contact", { contactContent }));
app.get("/projects", (req, res) => res.render("projects", { projectsContent }));
app.get("/blogpost", (req, res) => res.render("blogpost"));
app.get("/compose", (req, res) => res.render("compose"));

app.post("/compose", (req, res) => {
  const { postTitle, postBody } = req.body;
  const newPost = {
    id: posts.length + 1,
    title: postTitle,
    content: postBody
  };
  posts.unshift(newPost); // Ajout au début pour garder les derniers en premier
  res.redirect("/");
});

app.get("/posts/:postName", (req, res) => {
  const requestedTitle = _.lowerCase(req.params.postName);
  const post = posts.find(p => _.lowerCase(p.title) === requestedTitle);
  if (post) {
    res.render("post", { title: post.title, content: post.content });
  } else {
    res.send("<h2>Article non trouvé.</h2>");
  }
});

// --- Démarrage du serveur ---
app.listen(PORT, () => console.log(`✅ Serveur en écoute sur le port ${PORT}`));
