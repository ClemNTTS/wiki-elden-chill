export default {
  base: "/wiki-elden-chill/",
  title: "Elden Chill Wiki",
  description: "Grimoire de l'Entre-Terre",
  head: [
    ["link", { rel: "icon", href: "/wiki-elden-chill/favicon.ico" }], // Correction Favicon
  ],
  themeConfig: {
    logo: "/favicon.ico", // Si tu en as une
    nav: [
      { text: "Accueil", link: "/" },
      { text: "Objets", link: "/items" },
      { text: "Panoplies", link: "/sets" },
      { text: "Cendres", link: "/ashes" },
      { text: "Bestiaire", link: "/bestiary" },
      { text: "Biomes", link: "/biomes" },
    ],
    sidebar: [
      {
        text: "Données",
        items: [
          { text: "Équipement", link: "/items" },
          { text: "Panoplies", link: "/sets" },
          { text: "Cendres de Guerre", link: "/ashes" },
          { text: "Bestiaire", link: "/bestiary" },
          { text: "Biomes", link: "/biomes" },
        ],
      },
    ],

    footer: {
      message: "Que la Grâce guide tes pas.",
      copyright: "© 2026 Elden Chill",
    },
  },
};
