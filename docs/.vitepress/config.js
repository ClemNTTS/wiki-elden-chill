import { defineConfig } from "vitepress";
export default defineConfig({
  lang: "fr-FR", base: "/wiki-elden-chill/", title: "Elden Chill", titleTemplate: ":title — Wiki", description: "Le grimoire officiel et à jour d’Elden Chill.",
  head: [["link", { rel: "icon", href: "/wiki-elden-chill/favicon.ico" }], ["meta", { name: "theme-color", content: "#100e0d" }]],
  themeConfig: {
    logo: "/favicon.ico", siteTitle: "Elden Chill · Wiki", search: { provider: "local" },
    nav: [{ text:"Commencer",link:"/getting-started" },{ text:"Campagne",link:"/biomes" },{ text:"Builds",link:"/items" },{ text:"Données",link:"/data" }],
    sidebar: [
      { text:"Le jeu",items:[{text:"Vue d’ensemble",link:"/"},{text:"Bien commencer",link:"/getting-started"},{text:"Combat et statistiques",link:"/combat"},{text:"Systèmes d’expédition",link:"/systems"},{text:"Préparation",link:"/preparation"}]},
      { text:"Encyclopédie",items:[{text:"Atlas des biomes",link:"/biomes"},{text:"Équipement et panoplies",link:"/items"},{text:"Cendres de guerre",link:"/ashes"},{text:"Bestiaire",link:"/bestiary"}]},
      { text:"Fin de partie",items:[{text:"Renaissance et épreuves",link:"/rebirth"},{text:"Équilibrage",link:"/balance"},{text:"État des données",link:"/data"}]},
    ],
    outline:{level:[2,3],label:"Sur cette page"},
    editLink:{pattern:"https://github.com/ClemNTTS/wiki-elden-chill/edit/main/docs/:path",text:"Corriger cette page"},
    footer:{message:"Que la Grâce guide tes pas.",copyright:"Elden Chill · œuvre de fan non affiliée à FromSoftware"},
  },
});
