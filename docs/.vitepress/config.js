// docs/.vitepress/config.js
export default {
  title: "Elden Chill Wiki",
  description: "Le guide ultime du Sans-Éclat",
  themeConfig: {
    nav: [
      { text: "Accueil", link: "/" },
      { text: "Objets", link: "/items" },
      { text: "Bestiaire", link: "/bestiary" },
      { text: "Mécaniques", link: "/mechanics" },
    ],
    sidebar: [
      {
        text: "Guide du Voyageur",
        items: [
          { text: "Accueil", link: "/" },
          { text: "Mécaniques de Jeu", link: "/mechanics" },
        ],
      },
      {
        text: "Données",
        items: [
          { text: "Équipement", link: "/items" },
          { text: "Bestiaire", link: "/bestiary" },
        ],
      },
    ],
  },
};
