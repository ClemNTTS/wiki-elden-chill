# Combat et statistiques

## Résolution automatique

Le combat se résout par tours. La partie fractionnaire des attaques supplémentaires donne une chance d’attaque de plus : la Dextérité n’a donc pas de paliers secs. Chaque impact peut esquiver, critiquer et appliquer un statut.

## Les quatre statistiques

| Statistique | Rôle réel |
| --- | --- |
| Vigueur | PV, soins et base de certains effets. |
| Force | Socle des dégâts physiques par attaque. |
| Dextérité | Attaques, esquive (maximum 50 %), armure et Force effective. |
| Intelligence | Dégâts magiques après l’armure, runes et Force effective. |

La courbe d’attaques suit `(Dextérité / 60)^1,75` et récompense une spécialisation nette.

## Mitigation de boss (« Mitig Boss »)

**Mitig Boss** est le pourcentage de dégâts que vous réduisez **uniquement contre les attaques des boss**. Il ne diminue ni les dégâts des ennemis ordinaires, ni les dégâts que vous leur infligez.

Par exemple, avec **12 % de Mitig Boss**, une attaque de boss qui devrait infliger 100 dégâts n’en inflige plus que **88**. La valeur affichée dans la fiche de personnage est votre total actif, issu notamment de l’équipement, des panoplies et des atouts d’expédition.

## Armure et critiques

L’armure divise les dégâts physiques. Les dégâts magiques sont ajoutés ensuite, ce qui donne à l’Intelligence son identité contre les ennemis blindés.

Le critique utilise une ressource séparée : **1 point tous les 10 niveaux**, soit 15 au niveau 150.

| Axe | Base | Gain par point |
| --- | ---: | ---: |
| Chance | 5 % | +5 points de pourcentage |
| Multiplicateur | ×1,5 | +0,25 |

Au-dessus de 100 %, l’excédent de chance devient la probabilité d’un **super-critique**, qui double le multiplicateur.

## Afflictions

Les afflictions sont posées par certains coups, cendres, objets, dangers de biome ou phases de boss. Elles sont visibles sous les combattants. Il existe deux fonctionnements :

- Les **cumuls** ne disparaissent pas seuls : l’icône affiche leur nombre, jusqu’à ce qu’un seuil les consomme.
- Les **durées** diminuent au début du tour de la cible. Leur effet se produit alors une dernière fois avant leur disparition.

## Afflictions à cumuls

### Saignement

Chaque charge augmente de **10 %** la chance d’hémorragie au prochain coup porté contre la cible. Si elle se déclenche, l’hémorragie ajoute **20 % des dégâts bruts du coup par charge** ; toutes les charges de saignement sont ensuite consommées. Par exemple, 3 charges donnent 30 % de chance d’ajouter 60 % des dégâts bruts de l’attaque.

Le saignement ne possède pas de résistance dédiée : il faut empêcher les applications, réduire les charges avec un effet d’équipement ou déclencher l’hémorragie avant qu’elles ne s’accumulent trop.

### Gelure

À **10 charges**, la gelure éclate au prochain coup : elle ajoute des dégâts égaux à **10 % des PV maximum de la cible + 30**, avec un plafond de **6 fois les dégâts bruts du coup**. Contre un boss, ces dégâts sont réduits de 30 %. L’explosion retire aussi **20 d’armure** à la cible. Les 10 charges sont consommées, mais les éventuelles charges excédentaires restent.

La Résistance Gel réduit les charges reçues, sans pouvoir les annuler entièrement.

### Folie

À **8 charges**, la folie explose au prochain coup : elle ajoute **150 % des dégâts bruts du coup + 40**, puis applique **1 tour d’étourdissement**. Huit charges sont consommées et les charges au-delà du seuil sont conservées.

La Résistance Folie réduit les charges reçues ; elle aide donc à retarder l’explosion plutôt qu’à la rendre impossible.

### Fléau mortel

À **12 charges**, le fléau mortel inflige un supplément égal à **12 % des PV maximum de la cible**, plafonné à **6 fois les dégâts bruts du coup**. Toutes ses charges sont alors retirées. C’est l’affliction conçue pour rester dangereuse contre les très grandes réserves de PV.

## Afflictions à durée

### Poison

Le poison inflige des dégâts au début de chaque tour pendant sa durée. Sur le joueur, les dégâts dépendent du niveau ; sur un ennemi, ils correspondent à **1 % de ses PV maximum**, augmentés de **50 % de l’Intelligence effective** du joueur. Réappliquer le poison ne cumule pas les dégâts : cela conserve la plus longue durée.

La Résistance Poison réduit à la fois la durée reçue et les dégâts subis, sans jamais supprimer complètement l’effet.

### Putréfaction

La putréfaction inflige des dégâts au début de chaque tour pendant sa durée. Sa base est de **5 % des PV maximum** de la cible. Sur le joueur, la Résistance Putréfaction réduit ces dégâts. Sur un ennemi, les dégâts sont plafonnés à **la moitié des dégâts infligés par le joueur pendant son tour** (sauf le premier tic, qui peut être à pleine puissance).

Comme le poison, une nouvelle application prolonge au mieux la durée existante au lieu d’ajouter un second effet. La Résistance Putréfaction réduit également la durée reçue.

### Brûlure

La brûlure inflige des dégâts au début de chaque tour pendant sa durée. Elle est plus forte quand la cible a déjà perdu des PV : elle prend le plus petit résultat entre **3 % des PV maximum du joueur** (2 % pour un ennemi) et **10 % des PV manquants**. Réappliquer la brûlure conserve la durée la plus longue.

Il n’existe pas de statistique de résistance à la brûlure : les réductions spécifiques offertes par certains équipements restent le moyen de la contenir.

### Étourdissement

L’étourdissement fait perdre le tour suivant. Il ne provoque pas de dégâts et sa durée ne se cumule pas : une nouvelle application garde seulement la durée la plus longue. Il peut notamment être provoqué par la folie.

### Sommeil

Le sommeil fait aussi perdre le tour suivant, mais il disparaît dès que la cible reçoit le moindre dégât. Contrairement à l’étourdissement, il faut donc l’exploiter avec des dégâts sur la durée ou comme fenêtre de répit : frapper immédiatement une cible endormie la réveille.

## Résistances et réduction des effets

Les résistances réduisent les charges ou durées appliquées par les dangers et attaques : **Gelure** réduit les charges de gelure, tandis que **Poison**, **Folie** et **Putréfaction** réduisent leur application respective. Même avec beaucoup de résistance, une application réussie laisse toujours au moins une charge ou un tour. Les équipements qui retirent directement des charges ou des tours s’ajoutent à cette protection.
