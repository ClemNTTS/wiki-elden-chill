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
      LOOT_TABLES: typeof LOOT_TABLES !== 'undefined' ? LOOT_TABLES : null,
      ASHES_OF_WAR: typeof ASHES_OF_WAR !== 'undefined' ? ASHES_OF_WAR : null
    };
  `;
  try {
    return new Function(code)();
  } catch (e) {
    return null;
  }
}

async function startSync() {
  console.log("⚔️ Synchronisation des butins rares...");
  try {
    const monsterData = await getRemoteData("monster.js");
    const itemData = await getRemoteData("item.js");
    const biomeData = await getRemoteData("biome.js");
    const ashData = await getRemoteData("ashes.js");

    const MONSTERS = monsterData?.MONSTERS || {};
    const ITEMS = itemData?.ITEMS || {};
    const ASHES = ashData?.ASHES_OF_WAR || {};

    // Helper pour formater les drops d'un monstre
    const formatDrops = (drops) => {
      if (!drops || !drops.length) return "Aucun";
      return drops
        .map((d) => {
          const name = d.id
            ? ITEMS[d.id]?.name || d.id
            : ASHES[d.ashId]?.name || d.ashId;
          const chance = (d.chance * 100).toFixed(0) + "%";
          return `${name} (${chance})`;
        })
        .join(", ");
    };

    // 1. GÉNÉRATION DU BESTIAIRE AVEC BUTINS
    if (monsterData && MONSTERS) {
      let monsterMd =
        "# 🐲 Bestiaire\n\n| Nom | PV | ATK | Butins Spécifiques |\n| :--- | :--- | :--- | :--- |\n";
      Object.values(MONSTERS).forEach((m) => {
        const icon = m.isBoss ? "💀 " : m.isRare ? "⭐ " : "";
        const butins = formatDrops(m.drops);
        monsterMd += `| ${icon}${m.name} | ${m.hp} | ${m.atk} | ${butins} |\n`;
      });
      fs.writeFileSync(path.join(DOCS_PATH, "bestiary.md"), monsterMd);
    }

    // 2. GÉNÉRATION DES BIOMES AVEC DÉTAILS RARES
    if (biomeData && biomeData.BIOMES) {
      let biomeMd = "# 🗺️ Exploration des Biomes\n\n";
      Object.entries(biomeData.BIOMES).forEach(([id, biome]) => {
        if (!biome.name || biome.name.includes("WIP")) return;

        biomeMd += `## ${biome.name}\n`;
        biomeMd += `- **Longueur :** ${biome.length} étapes | **Boss :** 💀 ${MONSTERS[biome.boss]?.name || biome.boss}\n\n`;

        // Monstres Rares et leurs Loots
        if (biome.rareMonsters && biome.rareMonsters.length > 0) {
          biomeMd += `### ✨ Rencontres Rares (15%)\n`;
          biome.rareMonsters.forEach((mId) => {
            const m = MONSTERS[mId];
            if (m) {
              biomeMd += `* **${m.name}** : ${formatDrops(m.drops)}\n`;
            }
          });
          biomeMd += `\n`;
        }

        // Table de loot du biome
        const loot = biomeData.LOOT_TABLES[id];
        if (loot) {
          biomeMd += `### 🎁 Butins de zone (Table de Loot)\n| Objet | Chance |\n| :--- | :--- |\n`;
          loot.forEach((l) => {
            biomeMd += `| ${ITEMS[l.id]?.name || l.id} | ${(l.chance * 100).toFixed(0)}% |\n`;
          });
        }
        biomeMd += `\n---\n\n`;
      });
      fs.writeFileSync(path.join(DOCS_PATH, "biomes.md"), biomeMd);
    }

    // 3. GÉNÉRATION DES ITEMS (Inchangé)
    if (itemData && ITEMS) {
      let itemMd = "# ⚔️ Équipement\n\n";
      Object.values(ITEMS).forEach((item) => {
        itemMd += `### ${item.name}\n- **Type :** ${item.type}\n- **Effet :** ${item.description.replace(/<[^>]*>/g, "")}\n\n`;
      });
      fs.writeFileSync(path.join(DOCS_PATH, "items.md"), itemMd);
    }

    console.log("🚀 Wiki mis à jour avec les loots rares !");
  } catch (error) {
    console.error("❌ Erreur :", error.message);
    process.exit(1);
  }
}
startSync();
