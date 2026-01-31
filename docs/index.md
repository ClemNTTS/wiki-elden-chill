# 🌑 Elden Chill Wiki

Bienvenue dans le guide officiel de **Elden Chill**. Ce grimoire contient les vérités extraites directement du code de l'Entre-Terre.

## 📜 Mécaniques de Base

### 🧌 Rencontres et Monstres

- **Apparition standard :** Chaque biome possède une liste de monstres communs.
- **Groupes d'ennemis :** Certains monstres chassent en meute ou sont accompagnés de serviteurs. Vous affronterez parfois plusieurs ennemis en même temps ! Les dégâts de zone (Splash) deviennent alors cruciaux.
- **Monstres Rares :** Il existe **15% de chance** qu'un monstre rare apparaisse (si le compteur de rares de la zone le permet). Ils sont plus puissants mais offrent de meilleurs butins.
- **Boss :** Un boss unique t'attend à la fin de chaque biome une fois la barre de progression remplie.

### ⚔️ Cendres de Guerre

Les Cendres de Guerre sont des capacités actives puissantes.

- **Obtention :** Elles sont obtenues comme **butins uniques** sur certains monstres rares. Les chances varient (souvent 2% à 3% pour les rares avancés, parfois plus pour les premiers).
- **Utilisation :** Elles possèdent un nombre d'utilisations limité par expédition (rechargé au camp ou après un Boss).
- **Activation :** Une cendre doit être "préparée" (clic sur le bouton) et sera déclenchée automatiquement au début de votre prochain tour d'attaque.

---

## 🧪 Effets de Statut

Les altérations d'état dominent la méta. Voici leurs effets exacts (extraits du code source `status.js`) :

| Statut           | Effet               | Détails Techniques                                                                                                       |
| ---------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Poison**       | Dégâts sur durée    | Joueur : Subit dégâts = `70% du Niveau` par tour. <br> Monstres : Subissent `1% PV Max + 50% Intelligence` par tour.     |
| **Saignement**   | Explosion de dégâts | 10% de chance de proc par charge. Inflige `20% de dégâts bonus` par charge consommée.                                    |
| **Gelure**       | Fragilisation       | À 10 charges : Inflige `10% PV Max (+30)` (Boss: -30% dégâts) et réduit l'armure de 20 points (cumulable sur le joueur). |
| **Brûlure**      | Dégâts de feu       | Joueur : Subit le plus bas entre `3% PV Max` ou `10% PV Manquants`. <br> Monstres : Subissent `5% PV Max`.               |
| **Putréfaction** | Dégâts graves       | Inflige `5% des PV Max` à chaque tour.                                                                                   |
| **Étourdi**      | Perte de tour       | L'entité ne peut pas agir durant son prochain tour.                                                                      |
| **Épines**       | Renvoi de dégâts    | Renvoie `15% des dégâts subis`. <br> Joueur (bonus) : `+ Vigueur / 2`. <br> Monstres (bonus) : `+ 5 dégâts fixes`.       |

> **Note :** Sauf pour Saignement et Gelure, réappliquer un effet ne fait que rafraîchir sa durée si la nouvelle est supérieure.

---

C'est vrai que le LaTeX pur peut vite donner un aspect "devoir de maths" un peu lourd au milieu d'un wiki de jeu. Pour un wiki, on cherche souvent l'efficacité visuelle : le joueur doit comprendre sa stat en un coup d'œil sans déchiffrer des équations complexes.

Voici une proposition pour transformer cette section en quelque chose de beaucoup plus **scannable** et "pro", en utilisant des tableaux et des blocs d'alerte.

---

### 🧬 Formules de Puissance

La progression dans **Elden Chill** repose sur des calculs précis. Voici comment optimiser votre personnage.

#### 🩸 Calcul des Points de Vie (HP)

La vitalité ne progresse pas de manière linéaire. Pour plus de clarté, fiez-vous aux paliers (soft caps) suivants :

| Palier de Vigueur | Formule de calcul des PV     |
| ----------------- | ---------------------------- |
| **1 à 40**        | `300 + (Vigueur * 45)`       |
| **41 à 60**       | `2500 + (Vigueur - 40) * 35` |
| **61 et +**       | `3300 + (Vigueur - 60) * 25` |

> [!IMPORTANT]
> **Le pic de puissance** : Un saut massif de PV se produit au passage du niveau 40 vers 41. C'est le moment idéal pour renforcer votre survivabilité.

---

#### 💰 Coût des Améliorations (Runes)

Le prix pour monter un niveau suit une courbe exponentielle. Pour les développeurs ou les curieux, voici l'équation exacte :

```
Cout=BaseCost×((x+0.1)×(Niveau+81)2+1)
```

- **BaseCost** : Dépend de la statistique (1 pour les stats de base, 2 pour le Critique).
- **x** : Facteur de croissance qui augmente progressivement après le niveau 11.

---

## ⚰️ La Mort et la Grâce

- **Échec :** 0 PV = Mort. Vous perdez toutes les **Runes Portées** (non sécurisées).
- **Sites de Grâce :** À mi-chemin d'un biome (50% progression), vous activez un checkpoint. Vos PV sont restaurés et vos runes sécurisées.
- **Victoire Boss :** Vaincre un boss sécurise vos runes, vous soigne, recharge vos cendres, et garantit un objet.

---

> _"L'analyse du code révèle que la prudence est mère de sûreté : sécurisez vos runes avant d'affronter un boss si vous n'êtes pas sûr de vous."_
