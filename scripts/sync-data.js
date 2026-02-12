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
  return (
    text
      .replace(/import\s+[\s\S]*?;/g, "")
      // ON SUPPRIME "export const ", "export let " etc. pour ne garder que l'assignation simple
      .replace(/export\s+(const|let|var)\s+/g, "")
      // On gère aussi le cas "export function"
      .replace(/export\s+function\s+/g, "function ")
  );
};

async function getRemoteData(fileName) {
  const response = await fetch(`${BASE_URL}${fileName}`);
  if (!response.ok) return null;

  const text = await response.text();
  const cleaned = cleanContent(text);

  const code = `
    let gameState = { world: { unlockedBiomes: [] }, stats: { level: 1 } };
    let runtimeState = { playerCurrentHp: 100 };
    let getHealth = () => 100;
    let getEffectiveStats = () => ({ strength: 10 });
    let ActionLog = () => {};
    let ITEM_TYPES = { WEAPON: "Arme", ARMOR: "Armure", ACCESSORY: "Accessoire" };
    
    // Initialisation des variables pour éviter les ReferenceError
    let ITEMS = {}; 
    let ITEM_SETS = {};
    let MONSTERS = {};
    let BIOMES = {};
    let LOOT_TABLES = {};
    let ASHES_OF_WAR = {};
    let NOKRON = {}; // Support pour les sous-fichiers
    let RIVER = {}; // Support pour les sous-fichiers

    ${cleaned}

    return { MONSTERS, ITEMS, BIOMES, LOOT_TABLES, ASHES_OF_WAR, ITEM_SETS, NOKRON, RIVER };
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
    const constantsData = await getRemoteData("constants.js"); // NOUVEAU
    const mainItemData = await getRemoteData("item.js");
    const nokronData = await getRemoteData("items/nokron.js");
    const riverData = await getRemoteData("items/river.js");
    const biomeData = await getRemoteData("biome.js");
    const ashData = await getRemoteData("ashes.js");
    const monsterData = await getRemoteData("monster.js");

    const ITEM_SETS = constantsData?.ITEM_SETS || {}; // Chargé depuis constants.js
    const ITEMS = {
      ...(mainItemData?.ITEMS || {}),
      ...(nokronData?.NOKRON || {}),
      ...(riverData?.RIVER || {}),
    };
    const MONSTERS = monsterData?.MONSTERS || {};
    const ASHES = ashData?.ASHES_OF_WAR || {};
    const BIOMES = biomeData?.BIOMES || {};
    const LOOT_TABLES = biomeData?.LOOT_TABLES || {};

    // 1. GÉNÉRATION BESTIARY
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
      let md = "# ⚔️ Catalogue d'Équipement\n\n";

      // On groupe les items par type
      const categories = { Arme: [], Armure: [], Accessoire: [] };
      Object.values(ITEMS).forEach((i) => {
        if (categories[i.type]) categories[i.type].push(i);
      });

      Object.entries(categories).forEach(([type, items]) => {
        md += `## 🛡️ Catégorie : ${type}s\n\n`;
        md += `| Nom | Description & Effets | Prérequis |\n`;
        md += `| :--- | :--- | :--- |\n`;

        items
          .sort((a, b) => a.name.localeCompare(b.name))
          .forEach((i) => {
            // Extraction propre des prérequis (ex: "Requiert 30 Force")
            const reqMatch = i.description.match(/Requiert [^.]+/);
            const requirements = reqMatch ? `**${reqMatch[0]}**` : "Aucun";
            const effect = i.description
              .replace(/Requiert [^.]+/, "")
              .replace(/<[^>]*>/g, "")
              .trim();

            md += `| **${i.name}** | ${effect} | ${requirements} |\n`;
          });
        md += `\n\n`;
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

    //Panoplies
    if (ITEM_SETS) {
      let md = "# 🛡️ Panoplies (Sets)\n\n";
      Object.entries(ITEM_SETS).forEach(([id, set]) => {
        md += `### ${set.name}\n`;
        // Trouver quels items appartiennent à ce set pour aider le joueur
        const setPieces = Object.values(ITEMS)
          .filter((i) => i.set === id)
          .map((i) => i.name)
          .join(", ");

        md += `*Pièces du set : ${setPieces || "Non répertoriées"}*\n\n`;

        Object.entries(set.bonuses).forEach(([count, bonus]) => {
          md += `- **[${count} pcs]** : ${bonus.desc}\n`;
        });
        md += `\n---\n\n`;
      });
      fs.writeFileSync(path.join(DOCS_PATH, "sets.md"), md);
    }

    console.log("✅ Toutes les pages ont été générées avec succès !");
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
startSync();
