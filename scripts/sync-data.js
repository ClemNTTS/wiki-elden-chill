// scripts/sync-data.js
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

// Configuration : Remplace par tes infos
const USER = "ClemNTTS";
const REPO = "elden-chill";
const BRANCH = "main";
const BASE_URL = `https://raw.githubusercontent.com/${USER}/${REPO}/${BRANCH}/`;

// Dossiers de destination
const DOCS_PATH = "./docs";

/**
 * Transformation pour capturer les variables
 */
const cleanContent = (text) => {
  return text
    .replace(/import\s+[\s\S]*?;/g, "") // Supprime les imports
    .replace(/export\s+const\s+/g, "this.") // "export const MONSTERS" -> "this.MONSTERS"
    .replace(/export\s+let\s+/g, "this.")
    .replace(/export\s+/g, "this.");
};

async function getRemoteData(fileName) {
  const response = await fetch(`${BASE_URL}${fileName}`);
  if (!response.ok)
    throw new Error(`Erreur HTTP: ${response.status} sur ${fileName}`);

  const text = await response.text();
  const cleaned = cleanContent(text);

  const sandbox = {};
  // On exécute le code en liant 'this' à notre sandbox
  new Function(cleaned + "\nreturn this;").call(sandbox);
  return sandbox;
}

async function startSync() {
  console.log("⚔️ Début de la synchronisation Elden Chill...");
  try {
    // 1. MONSTRES
    const monsterData = await getRemoteData("monster.js");
    const MONSTERS = monsterData.MONSTERS;

    if (!MONSTERS)
      throw new Error("Variable MONSTERS non trouvée dans monster.js");

    let monsterMd =
      "# 🐲 Bestiaire\n\n| Nom | PV | ATK | Runes |\n| :--- | :--- | :--- | :--- |\n";
    Object.values(MONSTERS).forEach((m) => {
      monsterMd += `| ${m.name} | ${m.hp} | ${m.atk} | ${m.runes} |\n`;
    });
    fs.writeFileSync(path.join(DOCS_PATH, "bestiary.md"), monsterMd);

    // 2. ITEMS
    const itemData = await getRemoteData("item.js");
    const ITEMS = itemData.ITEMS;

    if (!ITEMS) throw new Error("Variable ITEMS non trouvée dans item.js");

    let itemMd = "# ⚔️ Équipement\n\n";
    Object.values(ITEMS).forEach((item) => {
      itemMd += `### ${item.name}\n- **Type :** ${item.type}\n- **Effet :** ${item.description.replace(/<[^>]*>/g, "")}\n\n`;
    });
    fs.writeFileSync(path.join(DOCS_PATH, "items.md"), itemMd);

    console.log("✅ Wiki synchronisé avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de la synchro :", error.message);
    process.exit(1);
  }
}

startSync();
