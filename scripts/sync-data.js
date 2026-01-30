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
    .replace(/export\s+/g, ""); // Transforme "export const" en "const" local
};

async function getRemoteData(fileName) {
  const response = await fetch(`${BASE_URL}${fileName}`);
  if (!response.ok) return null;

  const text = await response.text();
  const cleaned = cleanContent(text);

  // On crée un environnement fictif pour que le code du jeu ne plante pas
  // car il s'attend à trouver gameState, getHealth, etc.
  const code = `
    const gameState = { world: { unlockedBiomes: [], currentBiome: "" }, stats: { level: 1, intelligence: 10 }, equipped: {} };
    const runtimeState = { playerCurrentHp: 100, playerArmorDebuff: 0 };
    const getHealth = () => 100;
    const getEffectiveStats = () => ({ strength: 10, vigor: 10, intelligence: 10 });
    const ActionLog = () => {};
    const ITEM_TYPES = { WEAPON: "Arme", ARMOR: "Armure", ACCESSORY: "Accessoire" };

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
    console.error(`❌ Erreur d'exécution dans ${fileName}:`, e.message);
    return null;
  }
}

async function startSync() {
  console.log("⚔️ Début de la synchronisation complète...");
  try {
    const monsterData = await getRemoteData("monster.js");
    const itemData = await getRemoteData("item.js");
    const biomeData = await getRemoteData("biome.js");
    const ashData = await getRemoteData("ashes.js");

    const MONSTERS = monsterData?.MONSTERS || {};
    const ITEMS = itemData?.ITEMS || {};
    const BIOMES = biomeData?.BIOMES || {};
    const LOOT_TABLES = biomeData?.LOOT_TABLES || {};
    const ASHES = ashData?.ASHES_OF_WAR || {};

    // 1. CARTE DES BOSS
    const bossLootMap = {};
    Object.entries(BIOMES).forEach(([id, b]) => {
      if (b.boss) bossLootMap[b.boss] = LOOT_TABLES[id];
    });

    const formatDrops = (drops) => {
      if (!drops || !drops.length) return "Aucun";
      return drops
        .map((d) => {
          const name = d.id
            ? ITEMS[d.id]?.name || d.id
            : ASHES[d.ashId]?.name || d.ashId;
          return `${name} (${(d.chance * 100).toFixed(0)}%)`;
        })
        .join(", ");
    };

    // 2. GÉNÉRATION BESTIARY
    if (MONSTERS) {
      let md =
        "# 🐲 Bestiaire\n\n| Nom | PV | ATK | Butins (Drops) |\n| :--- | :--- | :--- | :--- |\n";
      Object.entries(MONSTERS).forEach(([id, m]) => {
        const icon = m.isBoss ? "💀 " : m.isRare ? "⭐ " : "";
        md += `| ${icon}${m.name} | ${m.hp} | ${m.atk} | ${formatDrops(m.isBoss ? bossLootMap[id] : m.drops)} |\n`;
      });
      fs.writeFileSync(path.join(DOCS_PATH, "bestiary.md"), md);
    }

    // 3. GÉNÉRATION BIOMES
    if (BIOMES) {
      let md = "# 🗺️ Exploration des Biomes\n\n";
      Object.entries(BIOMES).forEach(([id, b]) => {
        if (b.name.includes("WIP")) return;
        md += `## ${b.name}\n- **Longueur :** ${b.length} pas | **Boss :** ${MONSTERS[b.boss]?.name || b.boss}\n\n### 🎁 Butins\n`;
        (LOOT_TABLES[id] || []).forEach((l) => {
          md += `- ${ITEMS[l.id]?.name || l.id} (${(l.chance * 100).toFixed(0)}%)\n`;
        });
        md += `\n---\n\n`;
      });
      fs.writeFileSync(path.join(DOCS_PATH, "biomes.md"), md);
    }

    // 4. GÉNÉRATION ITEMS
    if (ITEMS) {
      let md = "# ⚔️ Équipement\n\n";
      Object.values(ITEMS).forEach((i) => {
        md += `### ${i.name}\n- **Type :** ${i.type}\n- **Effet :** ${i.description.replace(/<[^>]*>/g, "")}\n\n`;
      });
      fs.writeFileSync(path.join(DOCS_PATH, "items.md"), md);
    }

    // 5. GÉNÉRATION ASHES (Nouvelle page !)
    if (ASHES) {
      let md =
        "# ✨ Cendres de Guerre\n\nCapacités spéciales obtenues sur les ennemis rares.\n\n";
      Object.values(ASHES).forEach((a) => {
        const uses = typeof a.maxUses === "number" ? a.maxUses : "Spécial";
        md += `### ${a.name}\n- **Description :** ${a.description}\n- **Utilisations :** ${uses}\n\n`;
      });
      fs.writeFileSync(path.join(DOCS_PATH, "ashes.md"), md);
    }

    console.log("🚀 Tout est synchronisé !");
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
startSync();
