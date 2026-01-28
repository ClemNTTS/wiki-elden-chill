# 🌑 Elden Chill Wiki

Bienvenue dans le guide officiel de **Elden Chill**. Que tu sois un Sans-Éclat débutant ou un Seigneur d'Elden en devenir, ce grimoire contient toutes les vérités extraites directement du code de l'Entre-Terre.

---

## 📜 Mécaniques de Base

Le monde de Elden Chill suit des règles strictes mais justes pour assurer une progression "chill" mais stratégique.

### 🧌 Rencontres et Monstres Rares

- **Apparition standard :** Chaque biome possède une liste de monstres communs qui apparaissent durant ton exploration.
- **Monstres Rares :** Il existe **15% de chance** qu'un monstre rare apparaisse à la place d'un monstre commun, à condition que la limite de spawns rares de la zone ne soit pas atteinte.
- **Boss :** Un boss unique t'attend à la fin de chaque biome une fois la barre de progression remplie.

### ⚔️ Cendres de Guerre

Les Cendres de Guerre sont des capacités puissantes qui peuvent renverser le cours d'un combat.

- **Obtention :** Elles sont obtenues exclusivement comme **butins uniques** sur certains monstres rares (environ 5% de chance de drop).
- **Utilisation :** Elles possèdent un nombre d'utilisations limité par expédition, qui se réinitialise après avoir vaincu un Boss ou touché un Site de Grâce.
- **Activation :** Une cendre doit être "préparée" avant d'être utilisée au tour suivant.

---

## 🧪 Effets de Statut

Les altérations d'état sont au cœur de la stratégie. Voici comment elles fonctionnent réellement :

| Statut           | Effet               | Scaling / Détails                                                                            |
| :--------------- | :------------------ | :------------------------------------------------------------------------------------------- |
| **Poison**       | Dégâts sur la durée | Joueur : 2% PV Max. Ennemi : 1% PV Max + 50% Intelligence du joueur.                         |
| **Saignement**   | Explosion de dégâts | Chaque charge ajoute 10% de chance de proc. Inflige 20% de dégâts bonus par charge possédée. |
| **Brûlure**      | Dégâts de feu       | Inflige 3% des PV Max ou 10% des PV manquants (le plus bas).                                 |
| **Putréfaction** | Dégâts graves       | Inflige 5% des PV Max à chaque tour.                                                         |
| **Étourdi**      | Perte de tour       | L'entité ne peut pas agir durant son prochain tour.                                          |
| **Épines**       | Renvoi de dégâts    | Renvoie 10% des dégâts subis + 50% de la Vigueur du joueur.                                  |

---

## 🧬 Formules de Puissance

Pour les adeptes de l'optimisation, voici les équations qui régissent votre survie.

### Calcul des Points de Vie (PV)

La santé de votre héros ne progresse pas de manière linéaire. Elle suit une courbe de rendement décroissant pour éviter que vous ne deveniez immortel trop rapidement :

$$HP = 300 + 1650 \times (1 - e^{-0.035 \times Vigueur}) + 0.18 \times Vigueur^2$$

### Coût des Améliorations

Le coût pour augmenter une statistique augmente de manière drastique avec votre niveau global :

$$Coût = \lfloor Base \times ((x + 0.1) \times (Niveau + 81)^2 + 1) \rfloor$$
_(où $x$ augmente après le niveau 11)_

---

## ⚰️ La Mort et la Grâce

- **Échec :** Si vos PV tombent à zéro, vous perdez toutes les **Runes Portées** et retournez au camp.
- **Sécurité :** Atteindre la moitié d'un biome débloque un **Site de Grâce**, soignant vos PV et sécurisant vos runes dans le coffre.
- **Retraite :** Vous pouvez vous replier manuellement au camp à tout moment pour sécuriser vos gains, mais cela met fin à l'expédition actuelle.

---

> _Que la Grâce guide tes pas, Sans-Éclat._
