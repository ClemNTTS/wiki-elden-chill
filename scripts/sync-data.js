import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GAME = process.env.ELDEN_CHILL_GAME_PATH
  ? path.resolve(ROOT, process.env.ELDEN_CHILL_GAME_PATH)
  : path.resolve(ROOT, "../elden-chill");
const DOCS = path.join(ROOT, "docs");
const read = (file) => fs.readFileSync(path.join(GAME, file), "utf8");
const clean = (source) => source
  .replace(/^import[\s\S]*?;\s*$/gm, "")
  .replace(/export\s+default\s+/g, "const __default__ = ")
  .replace(/export\s+(const|let|var|function|class)\s+/g, "$1 ")
  .replace(/export\s*\{[^}]*\};?/g, "");
function evaluate(file, names, scope = {}) {
  const keys = Object.keys(scope);
  return new Function(...keys, `${clean(read(file))}\nreturn {${names}};`)(...keys.map((key) => scope[key]));
}
const noop = () => {};
const gameState = { stats: { level: 1 }, runes: { banked: 0, carried: 0 }, world: { unlockedBiomes: ["limgrave_west"], currentBiome: "limgrave_west" }, preparation: { unlockedBlessings: [], unlockedConsumables: [] } };
const runtimeState = { playerCurrentHp: 100 };
const ITEM_RARITIES = { COMMON: "commun", RARE: "rare", LEGENDARY: "legendaire", RELIC: "relique" };
const stubs = { applyEffect: noop, ActionLog: noop, gameState, runtimeState, getHealth: () => 100, getEffectiveStats: () => ({ vigor: 10 }), healPlayer: noop };

const { ITEM_TYPES, ITEM_SETS } = evaluate("constants.js", ["ITEM_TYPES", "ITEM_SETS"]);
const itemScope = { ITEM_TYPES, ITEM_RARITIES, ...stubs };
const { DEPTHS } = evaluate("items/depths.js", ["DEPTHS"], itemScope);
const { NOKRON } = evaluate("items/nokron.js", ["NOKRON"], itemScope);
const { RIVER } = evaluate("items/river.js", ["RIVER"], itemScope);
const { V21_ITEMS } = evaluate("items/v21.js", ["V21_ITEMS"], itemScope);
const { LANDS_ITEMS } = evaluate("items/lands.js", ["LANDS_ITEMS"], itemScope);
const { ITEMS } = evaluate("item.js", ["ITEMS"], { ITEM_TYPES, DEPTHS, NOKRON, RIVER, V21_ITEMS, LANDS_ITEMS, ...stubs });
const { V21_MONSTERS } = evaluate("monsters/v21.js", ["V21_MONSTERS"], stubs);
const { ENDGAME_MONSTERS, TRIAL_MONSTERS } = evaluate("monsters/endgame.js", ["ENDGAME_MONSTERS", "TRIAL_MONSTERS"], stubs);
const { LANDS_MONSTERS } = evaluate("monsters/lands.js", ["LANDS_MONSTERS"], stubs);
const { MONSTERS } = evaluate("monster.js", ["MONSTERS"], { V21_MONSTERS, ENDGAME_MONSTERS, TRIAL_MONSTERS, LANDS_MONSTERS });
const { BIOMES, LOOT_TABLES } = evaluate("biome.js", ["BIOMES", "LOOT_TABLES"]);
const { BIOME_GUIDE } = evaluate("world-map.js", ["BIOME_GUIDE"], { BIOMES });
const { ASHES_OF_WAR } = evaluate("ashes.js", ["ASHES_OF_WAR"], stubs);
const { BLESSINGS, PREP_CONSUMABLES, PREPARATION_UNLOCKS, HAZARD_LABELS } = evaluate("systems.js", ["BLESSINGS", "PREP_CONSUMABLES", "PREPARATION_UNLOCKS", "HAZARD_LABELS"], { BIOMES, ITEMS, BIOME_GUIDE, ...stubs });
const { FINAL_BIOME_ID, REBIRTH_NODES, TRIALS } = evaluate("rebirth.js", ["FINAL_BIOME_ID", "REBIRTH_NODES", "TRIALS"], { gameState, runtimeState, MAX_LEVEL: 150 });

const esc = (v = "") => String(v).replace(/\|/g, "\\|").replace(/\n/g, " ");
const plain = (v = "") => esc(v).replace(/<[^>]+>/g, "").trim();
const percent = (v) => Number.isFinite(v) ? `${Math.round(v * 100)} %` : "—";
const itemName = (id) => ITEMS[id]?.name || id || "—";
const monsterName = (id) => MONSTERS[id]?.name || id || "—";
const write = (name, body) => fs.writeFileSync(path.join(DOCS, name), `${body.trim()}\n`);

const sets = Object.entries(ITEM_SETS).map(([id, set]) => {
  const pieces = Object.values(ITEMS).filter((i) => i.set === id).map((i) => i.name).join(", ") || "Aucune pièce référencée";
  const bonuses = Object.entries(set.bonuses || {}).map(([n, b]) => `- **${n} pièces** — ${b.desc}`).join("\n");
  return `### ${set.name}\n\n*Pièces : ${pieces}*\n\n${bonuses}`;
}).join("\n\n");
const itemRows = Object.entries(ITEMS).sort(([,a],[,b]) => (a.type || "").localeCompare(b.type || "") || a.name.localeCompare(b.name)).map(([id,i]) => `| ${esc(i.name)} | ${esc(i.type)} | ${esc(i.rarity || "commun")} | ${plain(i.description)} | \`${id}\` |`).join("\n");
write("items.md", `# Équipement et panoplies\n\n> Généré depuis le code local : **${Object.keys(ITEMS).length} objets**, **${Object.keys(ITEM_SETS).length} panoplies**.\n\nLe build tient dans trois emplacements : une arme, une armure et un accessoire. Les doublons améliorent l'objet. La rareté sert de signal visuel et de pondération de butin ; les synergies restent la vraie source de puissance.\n\n## Panoplies\n\n${sets}\n\n## Catalogue complet\n\n| Objet | Type | Rareté | Description du jeu | ID |\n| --- | --- | --- | --- | --- |\n${itemRows}`);

const ashes = Object.entries(ASHES_OF_WAR).map(([id,a]) => { let uses = "variable"; try { uses = a.maxUses ?? "spécial"; } catch {} return `### ${a.name}\n\n${plain(a.description)}\n\n- Charges de base : **${uses}**\n- ID : \`${id}\``; }).join("\n\n");
write("ashes.md", `# Cendres de guerre\n\n> **${Object.keys(ASHES_OF_WAR).length} cendres** dans la version actuelle.\n\nUne seule cendre peut être équipée. Ses charges sont limitées par expédition, puis peuvent être augmentées par la renaissance.\n\n${ashes}`);

const bossLoot = {};
for (const [id,b] of Object.entries(BIOMES)) if (b.boss) bossLoot[b.boss] = LOOT_TABLES[id] || [];
const monsters = Object.entries(MONSTERS).sort(([,a],[,b]) => Number(b.isBoss)-Number(a.isBoss) || a.name.localeCompare(b.name)).map(([id,m]) => {
  const drops = ((m.isBoss ? bossLoot[id] : m.drops) || []).map((d) => `${itemName(d.id || d.ashId)} (${percent(d.chance)})`).join(", ") || "—";
  return `| ${esc(m.name)} | ${m.isBoss ? "Boss" : m.isRare ? "Rare" : "Normal"} | ${m.hp ?? "—"} | ${m.atk ?? "—"} | ${m.armor ?? 100} | ${m.runes ?? "—"} | ${esc(drops)} |`;
}).join("\n");
write("bestiary.md", `# Bestiaire\n\n> **${Object.keys(MONSTERS).length} créatures** issues des données courantes.\n\nLes sprites utilisent des archétypes animés, des teintes régionales et, si nécessaire, des emblèmes de faction.\n\n| Ennemi | Classe | PV | ATK | Armure | Runes | Butin |\n| --- | --- | ---: | ---: | ---: | ---: | --- |\n${monsters}`);

const biomeRows = Object.entries(BIOME_GUIDE).sort((a,b) => (a[1].chapter || "").localeCompare(b[1].chapter || "") || (a[1].recommendedLevel?.[0] || 0)-(b[1].recommendedLevel?.[0] || 0)).map(([id,g]) => {
  const b = BIOMES[id] || {}, unlock = PREPARATION_UNLOCKS[id];
  const reward = unlock?.blessingId ? BLESSINGS[unlock.blessingId]?.name : unlock?.consumableId ? PREP_CONSUMABLES[unlock.consumableId]?.name : "—";
  const hazards = (g.hazards || []).map((h) => HAZARD_LABELS[h] || h).join(", ") || "—";
  return `| ${esc(b.name || id)} | ${esc(g.chapter)} | ${g.recommendedLevel?.join("–") || "—"} | ${esc(g.danger)} | ${esc(hazards)} | ${esc(monsterName(b.boss))} | ${esc(reward)} |`;
}).join("\n");
write("biomes.md", `# Atlas des biomes\n\n> **${Object.keys(BIOMES).length} biomes** et **${Object.keys(BIOME_GUIDE).length} entrées d'atlas**.\n\nLa campagne forme un graphe à branches. Le chapitre X mène à **${monsterName(BIOMES[FINAL_BIOME_ID]?.boss)}**, dont la victoire ouvre la renaissance.\n\n| Zone | Chapitre | Niveau | Danger | Afflictions | Boss | Déblocage |\n| --- | --- | ---: | --- | --- | --- | --- |\n${biomeRows}`);

const blessings = Object.values(BLESSINGS).map((b) => `| ${esc(b.name)} | ${plain(b.detailedDescription || b.description)} |`).join("\n");
const consumables = Object.values(PREP_CONSUMABLES).map((c) => `| ${esc(c.name)} | ${plain(c.detailedDescription || c.description)} |`).join("\n");
write("preparation.md", `# Préparation d'expédition\n\nChoisissez une bénédiction persistante et un atout consommé pour l'expédition. Les options se débloquent par la campagne et les événements.\n\n## Bénédictions (${Object.keys(BLESSINGS).length})\n\n| Bénédiction | Effet |\n| --- | --- |\n${blessings}\n\n## Atouts (${Object.keys(PREP_CONSUMABLES).length})\n\n| Atout | Effet |\n| --- | --- |\n${consumables}`);

const nodes = REBIRTH_NODES.map((n) => `| ${esc(n.name)} | ${esc(n.detail)} | ${n.maxRank} |`).join("\n");
const trials = TRIALS.map((t) => `| ${esc(t.name)} | ${t.suggestedRebirth} | ${esc(t.lore)} |`).join("\n");
write("rebirth.md", `# Renaissance et épreuves\n\nAprès le Trône de l'Arbre, la renaissance remet à zéro niveaux, stats, runes, inventaire, équipement et campagne. Codex, cendres, préparations, arbre permanent et épreuves restent acquis.\n\nChaque renaissance donne **+25 % de runes**, **+10 niveaux maximum** et **2 points d'arbre**.\n\n## Arbre permanent\n\n| Nœud | Effet par rang | Rang max |\n| --- | --- | ---: |\n${nodes}\n\n## Épreuves\n\n| Épreuve | Renaissance suggérée | Lore |\n| --- | ---: | --- |\n${trials}`);

const version = JSON.parse(read("version.json")).version;
const counts = { Biomes:Object.keys(BIOMES).length, "Entrées d’atlas":Object.keys(BIOME_GUIDE).length, Monstres:Object.keys(MONSTERS).length, Objets:Object.keys(ITEMS).length, Panoplies:Object.keys(ITEM_SETS).length, Cendres:Object.keys(ASHES_OF_WAR).length, Bénédictions:Object.keys(BLESSINGS).length, Atouts:Object.keys(PREP_CONSUMABLES).length, Épreuves:TRIALS.length };
write("data.md", `# État des données\n\nSynchronisé par \`npm run sync\` depuis le dépôt local du jeu.\n\n| Donnée | Valeur |\n| --- | ---: |\n| Version | **${version}** |\n${Object.entries(counts).map(([k,v]) => `| ${k} | **${v}** |`).join("\n")}\n\n> Corrigez la donnée du jeu puis relancez la synchronisation : ne retouchez pas les catalogues générés à la main.`);
const enrich = (name, marker, content) => {
  const file = path.join(DOCS, name);
  fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace(marker, `${content}\n\n${marker}`));
};
enrich("items.md", "## Panoplies", "## Direction visuelle actuelle\n\nLes icônes viennent des atlas 16×16 du jeu. Les armes changent de métal avec leur niveau ; cadres et halos reprennent la rareté sans altérer la cellule.\n\n<div class=\"atlas-grid\"><img src=\"/game/weapons.png\" alt=\"Atlas des armes\"><img src=\"/game/armours.png\" alt=\"Atlas des armures\"><img src=\"/game/accessories.png\" alt=\"Atlas des accessoires\"></div>");
enrich("bestiary.md", "| Ennemi |", "![Planche actuelle des archétypes de monstres](/game/monster-archetypes.png)");
console.log(`Wiki synchronisé avec Elden Chill ${version}: ${counts.Biomes} biomes, ${counts.Monstres} monstres, ${counts.Objets} objets.`);
