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

A part le saignement, l'application d'un status fonctionne de la sorte : Entre l'effet de status actuel de la cible (ex : 5 de poison) et la valeur que l'on souhaite appliquer (ex : 2 poison), c'est la valeur la plus qui est appliquée (ici on garderait 5 de poison). Seul le saignement s'additionne.

Les altérations d'état sont au cœur de la stratégie. Voici comment elles fonctionnent réellement :

| Statut           | Effet               | Scaling / Détails                                                                            |
| :--------------- | :------------------ | :------------------------------------------------------------------------------------------- |
| **Poison**       | Dégâts sur la durée | 1% PV Max de la cible + 50% Intelligence du joueur.                                          |
| **Saignement**   | Explosion de dégâts | Chaque charge ajoute 10% de chance de proc. Inflige 20% de dégâts bonus par charge possédée. |
| **Brûlure**      | Dégâts de feu       | Inflige 3% des PV Max ou 10% des PV manquants (le plus bas).                                 |
| **Putréfaction** | Dégâts graves       | Inflige 5% des PV Max à chaque tour.                                                         |
| **Étourdi**      | Perte de tour       | L'entité ne peut pas agir durant son prochain tour.                                          |
| **Épines**       | Renvoi de dégâts    | Renvoie 15% des dégâts subis + la Vigueur (de base) du joueur / 2.                           |

---

## 🧬 Formules de Puissance

Pour les adeptes de l'optimisation, voici les équations qui régissent votre survie.

### Esquive et armure

Vous possédez 100 d'armure de base. Elle augmente avec la déxtérité. Tout comme les chances d'esquive.
Améliore votre agilité au combat. 4 points = 1% d'Esquive (Maximum 50%). Et 4 points = +1.5 d'Armure.

### Calcul des Points de Vie (PV)

La santé de votre héros progresse de la sorte :

- Vigueur <= 40 => 300 + Vigueur \* 50
- Vigueur <= 60 => 300 + 2200 + (Vigueur - 40) \* 35
- Vigueur > 60 => 300 + 3000 + (Vigueur - 60) \* 25

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
