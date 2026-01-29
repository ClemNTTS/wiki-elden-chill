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
const cleanContent = (text) => {
  return text
    .replace(/import\s+[\s\S]*?;/g, "") // Supprime les imports
    .replace(/export\s+/g, ""); // Supprime juste le mot "export" pour garder "const ITEM_TYPES"
};

async function getRemoteData(fileName) {
  const response = await fetch(`${BASE_URL}${fileName}`);
  if (!response.ok)
    throw new Error(`Erreur HTTP: ${response.status} sur ${fileName}`);

  const text = await response.text();
  const cleaned = cleanContent(text);

  // On crée une fonction qui retourne les variables dont on a besoin
  const code = `
    ${cleaned}
    return { 
      MONSTERS: typeof MONSTERS !== 'undefined' ? MONSTERS : null, 
      ITEMS: typeof ITEMS !== 'undefined' ? ITEMS : null 
    };
  `;

  try {
    return new Function(code)();
  } catch (e) {
    console.error(`Erreur dans ${fileName}:`, e.message);
    return {};
  }
}

async function startSync() {
  console.log("⚔️ Début de la synchronisation...");
  try {
    const data = {};
    Object.assign(data, await getRemoteData("monster.js"));
    Object.assign(data, await getRemoteData("item.js"));

    if (data.MONSTERS) {
      let monsterMd =
        "# 🐲 Bestiaire\n\n| Nom | PV | ATK | Runes |\n| :--- | :--- | :--- | :--- |\n";
      Object.values(data.MONSTERS).forEach((m) => {
        monsterMd += `| ${m.name} | ${m.hp} | ${m.atk} | ${m.runes} |\n`;
      });
      fs.writeFileSync(path.join(DOCS_PATH, "bestiary.md"), monsterMd);
    }

    if (data.ITEMS) {
      let itemMd = "# ⚔️ Équipement\n\n";
      Object.values(data.ITEMS).forEach((item) => {
        itemMd += `### ${item.name}\n- **Type :** ${item.type}\n- **Effet :** ${item.description.replace(/<[^>]*>/g, "")}\n\n`;
      });
      fs.writeFileSync(path.join(DOCS_PATH, "items.md"), itemMd);
    }
    console.log("✅ Wiki synchronisé !");
  } catch (error) {
    console.error("❌ Erreur :", error.message);
    process.exit(1);
  }
}
startSync();
