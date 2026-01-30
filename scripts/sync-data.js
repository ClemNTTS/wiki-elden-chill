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
  console.log("⚔️ Correction de la table des butins des Boss...");
  try {
    const monsterData = await getRemoteData("monster.js");
    const itemData = await getRemoteData("item.js");
    const biomeData = await getRemoteData("biome.js");
    const ashData = await getRemoteData("ashes.js");

    const MONSTERS = monsterData?.MONSTERS || {};
    const ITEMS = itemData?.ITEMS || {};
    const ASHES = ashData?.ASHES_OF_WAR || {};
    const BIOMES = biomeData?.BIOMES || {};
    const LOOT_TABLES = biomeData?.LOOT_TABLES || {};

    // 1. On crée une carte : Quel Boss -> Quel Butin de Biome ?
    const bossLootMap = {};
    Object.entries(BIOMES).forEach(([biomeId, biome]) => {
      if (biome.boss && LOOT_TABLES[biomeId]) {
        bossLootMap[biome.boss] = LOOT_TABLES[biomeId];
      }
    });

    // Helper pour formater les drops (Ennemis Rares OU Biomes)
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

    // 2. GÉNÉRATION DU BESTIAIRE CORRIGÉ
    if (MONSTERS) {
      let monsterMd =
        "# 🐲 Bestiaire\n\n| Nom | PV | ATK | Butins (Drops) |\n| :--- | :--- | :--- | :--- |\n";

      Object.entries(MONSTERS).forEach(([id, m]) => {
        const icon = m.isBoss ? "💀 " : m.isRare ? "⭐ " : "";

        // Logique de butin :
        // - Si c'est un Boss : on prend le loot du biome associé
        // - Sinon : on prend ses drops spécifiques (rares)
        const dropsToFormat = m.isBoss ? bossLootMap[id] : m.drops;
        const butins = formatDrops(dropsToFormat);

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

    // 4. GÉNÉRATION DES CENDRES DE GUERRE
    if (ashData && ASHES) {
      let ashMd = "# ✨ Cendres de Guerre\n\n";
      ashMd +=
        "Les Cendres de Guerre sont des capacités spéciales que vous pouvez équiper pour obtenir des avantages tactiques en combat.\n\n";

      Object.values(ASHES).forEach((ash) => {
        // Gestion des utilisations max (certaines sont des getters ou fixes)
        const maxUsesDisplay =
          typeof ash.maxUses === "number"
            ? ash.maxUses
            : "Variable (voir description)";

        ashMd += `### ${ash.name}\n`;
        ashMd += `- **Description :** ${ash.description}\n`;
        ashMd += `- **Utilisations max :** ${maxUsesDisplay}\n\n`;
      });

      fs.writeFileSync(path.join(DOCS_PATH, "ashes.md"), ashMd);
      console.log("✅ ashes.md généré.");
    }

    console.log("🚀 Wiki mis à jour avec les loots rares !");
  } catch (error) {
    console.error("❌ Erreur :", error.message);
    process.exit(1);
  }
}
startSync();
