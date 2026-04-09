export default {
  base: "/wiki-elden-chill/",
  title: "Elden Chill Wiki",
  description: "Grimoire de l'Entre-Terre",
  head: [["link", { rel: "icon", href: "/wiki-elden-chill/favicon.ico" }]],
  themeConfig: {
    logo: "/favicon.ico",
    nav: [
      { text: "Accueil", link: "/" },
      { text: "Systèmes", link: "/systems" },
      { text: "Équilibrage", link: "/balance" },
      { text: "Biomes", link: "/biomes" },
      { text: "Objets", link: "/items" },
      { text: "Cendres", link: "/ashes" },
      { text: "Bestiaire", link: "/bestiary" },
    ],
    sidebar: [
      {
        text: "Guide V2.3",
        items: [
          { text: "Accueil", link: "/" },
          { text: "Systèmes", link: "/systems" },
          { text: "Équilibrage", link: "/balance" },
          { text: "Biomes", link: "/biomes" },
          { text: "Équipement et rareté", link: "/items" },
          { text: "Cendres de guerre", link: "/ashes" },
          { text: "Bestiaire", link: "/bestiary" },
        ],
      },
    ],
    footer: {
      message: "Que la Grâce guide tes pas.",
      copyright: "© 2026 Elden Chill",
    },
  },
};
