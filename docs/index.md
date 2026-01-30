# 🌑 Elden Chill Wiki

Bienvenue dans le guide officiel de **Elden Chill**. Que tu sois un Sans-Éclat débutant ou un Seigneur d'Elden en devenir, ce grimoire contient toutes les vérités extraites directement du code de l'Entre-Terre.

## 📜 Mécaniques de Base

Le monde de Elden Chill suit des règles strictes mais justes pour assurer une progression "chill" mais stratégique.

### 🧌 Rencontres et Monstres Rares

- **Apparition standard :** Chaque biome possède une liste de monstres communs qui apparaissent durant ton exploration.
- **Monstres Rares :** Il existe **15% de chance** qu'un monstre rare apparaisse à la place d'un monstre commun, à condition que la limite de spawns rares de la zone ne soit pas atteinte.
- **Boss :** Un boss unique t'attend à la fin de chaque biome une fois la barre de progression remplie.

### ⚔️ Cendres de Guerre

Les Cendres de Guerre sont des capacités puissantes qui peuvent renverser le cours d'un combat.

- **Obtention :** Elles sont obtenues exclusivement comme **butins uniques** sur certains monstres rares (environ 5% de chance de drop).
- **Utilisation :** Elles possèdent un nombre d'utilisations limité par expédition, qui se réinitialise après avoir vaincu un Boss.
- **Activation :** Une cendre doit être "préparée" avant d'être utilisée au tour suivant.

---

## 🧪 Effets de Statut

À l'exception du **Saignement** et de la **Gelure**, l'application d'un statut fonctionne par comparaison : entre l'effet déjà présent sur la cible (ex : 5 tours de poison) et la nouvelle valeur (ex : 2 tours), seule la valeur la plus élevée est conservée (ici, 5 tours). Le saignement et la gelure sont les seuls effets dont les charges s'additionnent à chaque coup porté.

Les altérations d'état sont au cœur de la stratégie. Voici comment elles fonctionnent réellement :

| Statut           | Effet               | Scaling / Détails                                                                                                        |
| ---------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Poison**       | Dégâts sur la durée | 1% PV Max de la cible + 50% Intelligence du joueur. (Les monstres font des dégats de poisons équivalent à votre level)   |
| **Saignement**   | Explosion de dégâts | Chaque charge ajoute 10% de chance de proc. Inflige 20% de dégâts bonus par charge possédée.                             |
| **Gelure**       | Fragilisation       | À 10 charges : inflige 10% PV Max (+30) et réduit l'armure de 20 points pour tout le combat. (Dégâts -30% sur les Boss). |
| **Brûlure**      | Dégâts de feu       | Inflige 3% des PV Max ou 10% des PV manquants (le plus bas).                                                             |
| **Putréfaction** | Dégâts graves       | Inflige 5% des PV Max à chaque tour.                                                                                     |
| **Étourdi**      | Perte de tour       | L'entité ne peut pas agir durant son prochain tour.                                                                      |
| **Épines**       | Renvoi de dégâts    | Renvoie 15% des dégâts subis + la Vigueur (de base) du joueur / 2.                                                       |

---

## 🧬 Formules de Puissance

Pour les adeptes de l'optimisation, voici les équations qui régissent votre survie.

### Esquive et armure

Vous possédez 100 d'armure de base. Elle augmente avec la déxtérité. Tout comme les chances d'esquive.
Améliore votre agilité au combat. 4 points = 1% d'Esquive (Maximum 50%). Et 4 points = +0.5 d'Armure.

### Calcul des Points de Vie (PV)

La santé de votre héros progresse de la sorte :

- Vigueur <= 40 => 300 + Vigueur \* 45
- Vigueur <= 60 => 300 + 2200 + (Vigueur - 40) \* 35
- Vigueur > 60 => 300 + 3000 + (Vigueur - 60) \* 25

### Coût des Améliorations

Le coût pour augmenter une statistique augmente de manière drastique avec votre niveau global :

$ Coût = \lfloor Base \times ((x + 0.1) \times (Niveau + 81)^2 + 1) \rfloor$$
_(où $x$ augmente après le niveau 11)\_

---

## ⚰️ La Mort et la Grâce

- **Échec :** Si vos PV tombent à zéro, vous perdez toutes les **Runes Portées** et retournez au camp.
- **Sécurité :** Atteindre la moitié d'un biome débloque un **Site de Grâce**, soignant vos PV et sécurisant vos runes dans le coffre.
- **Retraite :** Vous pouvez vous replier manuellement au camp à tout moment pour sécuriser vos gains, mais cela met fin à l'expédition actuelle.

---

> _Que la Grâce guide tes pas, Sans-Éclat._
