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
      {
        text: "Données",
        items: [
          { text: "Équipement", link: "/items" },
          { text: "Bestiaire", link: "/bestiaire" },
        ],
      },
      { text: "Mécaniques", link: "/mechanics" },
    ],
    // Ajoute un footer pour le style "chill"
    footer: {
      message: "Que la Grâce guide tes pas.",
      copyright: "© 2026 Elden Chill",
    },
  },
};
