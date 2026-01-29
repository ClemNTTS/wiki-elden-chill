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
  return text.replace(/import\s+[\s\S]*?;/g, "").replace(/export\s+/g, "");
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
      ITEMS: typeof ITEMS !== 'undefined' ? ITEMS : null,
      BIOMES: typeof BIOMES !== 'undefined' ? BIOMES : null,
      LOOT_TABLES: typeof LOOT_TABLES !== 'undefined' ? LOOT_TABLES : null
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
    const biomeData = await getRemoteData("biome.js");

    // 1. GÉNÉRATION DU BESTIAIRE (Fix 404)
    if (monsterData && monsterData.MONSTERS) {
      let monsterMd =
        "# 🐲 Bestiaire\n\n| Nom | PV | ATK | Runes |\n| :--- | :--- | :--- | :--- |\n";
      Object.values(monsterData.MONSTERS).forEach((m) => {
        const icon = m.isBoss ? "💀 " : m.isRare ? "⭐ " : "";
        monsterMd += `| ${icon}${m.name} | ${m.hp} | ${m.atk} | ${m.runes} |\n`;
      });
      // Changé de bestiaire.md à bestiary.md pour correspondre au config.js
      fs.writeFileSync(path.join(DOCS_PATH, "bestiary.md"), monsterMd);
      console.log("✅ bestiary.md généré.");
    }

    // 2. GÉNÉRATION DES ITEMS
    if (itemData && itemData.ITEMS) {
      let itemMd = "# ⚔️ Équipement\n\n";
      Object.values(itemData.ITEMS).forEach((item) => {
        itemMd += `### ${item.name}\n- **Type :** ${item.type}\n- **Effet :** ${item.description.replace(/<[^>]*>/g, "")}\n\n`;
      });
      fs.writeFileSync(path.join(DOCS_PATH, "items.md"), itemMd);
      console.log("✅ items.md généré.");
    }

    // 3. GÉNÉRATION DES BIOMES (Nouveau)
    if (biomeData && biomeData.BIOMES) {
      let biomeMd = "# 🗺️ Exploration des Biomes\n\n";
      const MONSTERS = monsterData?.MONSTERS || {};
      const ITEMS = itemData?.ITEMS || {};

      Object.entries(biomeData.BIOMES).forEach(([id, biome]) => {
        if (!biome.name || biome.name.includes("WIP")) return; // Optionnel : masque les zones en cours de travail

        biomeMd += `## ${biome.name}\n`;
        biomeMd += `- **Longueur de la zone :** ${biome.length} étapes\n`;

        // Boss
        const bossName = MONSTERS[biome.boss]?.name || biome.boss;
        biomeMd += `- **Boss de zone :** 💀 ${bossName}\n\n`;

        // Monstres
        biomeMd += `### Habitants de la zone\n`;
        const normalMonsters = biome.monsters
          .map((mId) => MONSTERS[mId]?.name || mId)
          .join(", ");
        biomeMd += `- **Monstres communs :** ${normalMonsters}\n`;

        if (biome.rareMonsters && biome.rareMonsters.length > 0) {
          const rareMonsters = biome.rareMonsters
            .map((mId) => MONSTERS[mId]?.name || mId)
            .join(", ");
          biomeMd += `- **Rencontres Rares (15%) :** ⭐ ${rareMonsters} (Max: ${biome.maxRareSpawns})\n`;
        }

        // Loot Table
        const loot = biomeData.LOOT_TABLES[id];
        if (loot) {
          biomeMd += `\n### Butins possibles (Table de Loot)\n`;
          biomeMd += `| Objet | Chance d'obtention |\n| :--- | :--- |\n`;
          loot.forEach((l) => {
            const itemName = ITEMS[l.id]?.name || l.id;
            biomeMd += `| ${itemName} | ${(l.chance * 100).toFixed(0)}% |\n`;
          });
        }

        // Unlocks
        if (biome.unlocks && biome.unlocks.length > 0) {
          const unlockNames = biome.unlocks
            .map((uId) => biomeData.BIOMES[uId]?.name || uId)
            .join(", ");
          biomeMd += `\n**Zones débloquées après le Boss :** ${unlockNames}\n`;
        }

        biomeMd += `\n---\n\n`;
      });
      fs.writeFileSync(path.join(DOCS_PATH, "biomes.md"), biomeMd);
      console.log("✅ biomes.md généré.");
    }

    console.log("🚀 Wiki synchronisé avec succès !");
  } catch (error) {
    console.error("❌ Erreur :", error.message);
    process.exit(1);
  }
}
startSync();
