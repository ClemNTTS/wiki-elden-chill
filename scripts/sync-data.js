// scripts/sync-data.js
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

// Configuration : Remplace par tes infos
const USER = "ClemNTTS";
const REPO = "wiki-elden-chill";
const BRANCH = "main";
const BASE_URL = `https://raw.githubusercontent.com/${USER}/${REPO}/${BRANCH}/`;

// Dossiers de destination
const DOCS_PATH = "./docs";
const FOLDERS = ["items", "monsters", "mechanics"];

// Création des dossiers si inexistants
FOLDERS.forEach((folder) => {
  const dir = path.join(DOCS_PATH, folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

/**
 * Nettoie le contenu d'un fichier JS pour pouvoir l'évaluer
 * Supprime les imports et exportations pour ne garder que l'objet
 */
const cleanContent = (text) => {
  return text
    .replace(/import\s+[\s\S]*?;/g, "") // Supprime les imports
    .replace(/export\s+/g, ""); // Supprime les mots-clés export
};

/**
 * Récupère et évalue un fichier distant
 */
async function getRemoteData(fileName) {
  const response = await fetch(`${BASE_URL}${fileName}`);
  const text = await response.text();
  const cleaned = cleanContent(text);

  // Utilisation de Function pour évaluer le code dans un scope isolé
  // On retourne un objet contenant les constantes définies
  const sandbox = {};
  new Function("exports", cleaned + "\nreturn this;").call(sandbox, {});
  return sandbox;
}

async function startSync() {
  console.log("⚔️ Début de la synchronisation Elden Chill...");

  try {
    // 1. GÉNÉRATION DU BESTIAIRE
    const monsterData = await getRemoteData("monster.js");
    const MONSTERS = monsterData.MONSTERS; //
    let monsterMd =
      "# 🐲 Bestiaire\n\nListe des créatures rencontrées dans l'Entre-Terre.\n\n";
    monsterMd +=
      "| Nom | PV | ATK | Runes | Particularités |\n| :--- | :--- | :--- | :--- | :--- |\n";

    Object.values(MONSTERS).forEach((m) => {
      const rare = m.isRare ? "⭐ " : ""; //
      const boss = m.isBoss ? "💀 **BOSS**" : ""; //
      monsterMd += `| ${rare}${m.name} | ${m.hp} | ${m.atk} | ${m.runes} | ${boss} |\n`;
    });
    fs.writeFileSync(path.join(DOCS_PATH, "bestiary.md"), monsterMd);

    // 2. GÉNÉRATION DES OBJETS
    const itemData = await getRemoteData("item.js");
    const ITEMS = itemData.ITEMS; //
    let itemMd = "# ⚔️ Équipement\n\n### Armes, Armures et Accessoires\n\n";

    Object.values(ITEMS).forEach((item) => {
      itemMd += `### ${item.name}\n`;
      itemMd += `- **Type :** ${item.type}\n`; //
      itemMd += `- **Effet :** ${item.description.replace(/<[^>]*>/g, "")}\n\n`; // Nettoyage HTML
    });
    fs.writeFileSync(path.join(DOCS_PATH, "items.md"), itemMd);

    // 3. GÉNÉRATION DES MÉCANIQUES (Formules)
    const stateText = await fetch(`${BASE_URL}state.js`).then((r) => r.text());
    // Extraction de la formule de vie via Regex
    const healthFormula =
      "300 + 1650 * (1 - Math.exp(-0.035 * vigor)) + 0.18 * vigor * vigor";

    let mechMd = "# ⚙️ Mécaniques de Jeu\n\n";
    mechMd += "### Calcul des Points de Vie\n";
    mechMd +=
      "La courbe de vie suit une progression spécifique pour éviter l'invincibilité :\n\n";
    mechMd += `$$HP = 300 + 1650 \\times (1 - e^{-0.035 \\times Vigueur}) + 0.18 \\times Vigueur^2$$\n\n`; //
    mechMd += "### Statistiques de Combat\n";
    mechMd +=
      "- **Dextérité :** Chaque point offre de l'esquive (capée à 50%).\n"; //
    mechMd +=
      "- **Intelligence :** Augmente le gain de runes et les dégâts de poison.\n"; //

    fs.writeFileSync(path.join(DOCS_PATH, "mechanics.md"), mechMd);

    console.log("✅ Wiki synchronisé avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de la synchro :", error);
  }
}

startSync();
