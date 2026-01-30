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
    .replace(/export\s+/g, ""); // Supprime le mot export pour garder les const locales
};

async function getRemoteData(fileName) {
  const response = await fetch(`${BASE_URL}${fileName}`);
  if (!response.ok) return null;

  const text = await response.text();
  const cleaned = cleanContent(text);

  // On utilise 'var' ici au lieu de 'const' pour autoriser la redéclaration
  // si le fichier (comme item.js) définit lui-même ces variables
  const code = `
    var gameState = { world: { unlockedBiomes: [], currentBiome: "" }, stats: { level: 1, intelligence: 10 }, equipped: {} };
    var runtimeState = { playerCurrentHp: 100, playerArmorDebuff: 0 };
    var getHealth = () => 100;
    var getEffectiveStats = () => ({ strength: 10, vigor: 10, intelligence: 10, dexterity: 10, critChance: 0, critDamage: 1.5 });
    var ActionLog = () => {};
    var ITEM_TYPES = { WEAPON: "Arme", ARMOR: "Armure", ACCESSORY: "Accessoire" };

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
    console.error(`❌ Erreur dans ${fileName}:`, e.message);
    return null;
  }
}

async function startSync() {
  console.log("⚔️ Synchronisation du Grimoire...");
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

    // 1. GÉNÉRATION BESTIARY (Fix Boss Loot)
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

    if (MONSTERS) {
      let md =
        "# 🐲 Bestiaire\n\n| Nom | PV | ATK | Butins (Drops) |\n| :--- | :--- | :--- | :--- |\n";
      Object.entries(MONSTERS).forEach(([id, m]) => {
        const icon = m.isBoss ? "💀 " : m.isRare ? "⭐ " : "";
        md += `| ${icon}${m.name} | ${m.hp} | ${m.atk} | ${formatDrops(m.isBoss ? bossLootMap[id] : m.drops)} |\n`;
      });
      fs.writeFileSync(path.join(DOCS_PATH, "bestiary.md"), md);
    }

    // 2. GÉNÉRATION ITEMS
    if (ITEMS) {
      let md = "# ⚔️ Équipement\n\n";
      Object.values(ITEMS).forEach((i) => {
        md += `### ${i.name}\n- **Type :** ${i.type}\n- **Effet :** ${i.description.replace(/<[^>]*>/g, "")}\n\n`;
      });
      fs.writeFileSync(path.join(DOCS_PATH, "items.md"), md);
    }

    // 3. GÉNÉRATION ASHES
    if (ASHES) {
      let md = "# ✨ Cendres de Guerre\n\n";
      Object.values(ASHES).forEach((a) => {
        const uses = typeof a.maxUses === "number" ? a.maxUses : "Spécial";
        md += `### ${a.name}\n- **Description :** ${a.description}\n- **Utilisations Max :** ${uses}\n\n`;
      });
      fs.writeFileSync(path.join(DOCS_PATH, "ashes.md"), md);
    }

    // 4. GÉNÉRATION BIOMES
    if (BIOMES) {
      let md = "# 🗺️ Exploration des Biomes\n\n";
      Object.entries(BIOMES).forEach(([id, b]) => {
        if (b.name.includes("WIP")) return;
        md += `## ${b.name}\n- **Boss :** ${MONSTERS[b.boss]?.name || b.boss}\n\n### 🎁 Butins de zone\n`;
        (LOOT_TABLES[id] || []).forEach((l) => {
          md += `- ${ITEMS[l.id]?.name || l.id} (${(l.chance * 100).toFixed(0)}%)\n`;
        });
        md += `\n---\n\n`;
      });
      fs.writeFileSync(path.join(DOCS_PATH, "biomes.md"), md);
    }

    console.log("✅ Toutes les pages ont été générées avec succès !");
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
startSync();
