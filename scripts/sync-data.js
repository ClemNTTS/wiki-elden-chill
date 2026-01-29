// scripts/sync-data.js
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

// Configuration : Remplace par tes infos
const USER = "ClemNTTS";
const REPO = "elden-chill";
const BRANCH = "main";
const BASE_URL = `https://raw.githubusercontent.com/${USER}/${REPO}/${BRANCH}/`;
const DOCS_PATH = "./docs";
const cleanContent = (text) => {
  return text
    .replace(/import\s+[\s\S]*?;/g, "") // Supprime les imports
    .replace(/export\s+/g, ""); // Garde la déclaration const/let locale
};

async function getRemoteData(fileName) {
  const response = await fetch(`${BASE_URL}${fileName}`);
  if (!response.ok) return null;

  const text = await response.text();
  const cleaned = cleanContent(text);

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
    return null;
  }
}

async function startSync() {
  console.log("⚔️ Début de la synchronisation...");
  try {
    const monsterData = await getRemoteData("monster.js");
    const itemData = await getRemoteData("item.js");

    // 1. GÉNÉRATION DU BESTIAIRE
    if (monsterData && monsterData.MONSTERS) {
      let monsterMd =
        "# 🐲 Bestiaire\n\n| Nom | PV | ATK | Runes |\n| :--- | :--- | :--- | :--- |\n";
      Object.values(monsterData.MONSTERS).forEach((m) => {
        const icon = m.isBoss ? "💀 " : m.isRare ? "⭐ " : "";
        monsterMd += `| ${icon}${m.name} | ${m.hp} | ${m.atk} | ${m.runes} |\n`;
      });
      // On le nomme bestiaire.md pour correspondre à ton menu
      fs.writeFileSync(path.join(DOCS_PATH, "bestiaire.md"), monsterMd);
      console.log("✅ bestiaire.md généré.");
    }

    // 2. GÉNÉRATION DES ITEMS
    if (itemData && itemData.ITEMS) {
      let itemMd = "# ⚔️ Équipement\n\n";
      Object.values(itemData.ITEMS).forEach((item) => {
        itemMd += `### ${item.name}\n- **Type :** ${item.type}\n- **Effet :** ${item.description.replace(/<[^>]*>/g, "")}\n\n`;
      });
      // On le nomme equipement.md ou items.md selon ton lien
      fs.writeFileSync(path.join(DOCS_PATH, "items.md"), itemMd);
      console.log("✅ items.md généré.");
    }

    console.log("🚀 Wiki synchronisé avec succès !");
  } catch (error) {
    console.error("❌ Erreur :", error.message);
    process.exit(1);
  }
}
startSync();
