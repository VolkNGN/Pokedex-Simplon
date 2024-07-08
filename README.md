# Application Pokédex

## Description
Cette application Pokédex permet aux utilisateurs de rechercher des Pokémon selon divers critères et de consulter des informations détaillées sur chaque Pokémon. L'application utilise l'API PokeAPI pour récupérer les données et les affiche dans une interface conviviale.

## Fonctionnalités

### Fonctionnalité de Recherche
- **Formulaire de Recherche Avancée** : Les utilisateurs peuvent rechercher des Pokémon par :
  - **Nom** : Entrez le nom du Pokémon pour effectuer une recherche par nom.
  - **Génération** : Sélectionnez une génération spécifique de Pokémon.
  - **Types** : Choisissez un ou plusieurs types de Pokémon pour filtrer les résultats.
  - **Numéro du Pokédex** : Entrez un numéro spécifique du Pokédex pour trouver un Pokémon.
  - **Plage de Taille** : Utilisez des curseurs pour définir une plage de taille en mètres.
  - **Plage de Poids** : Utilisez des curseurs pour définir une plage de poids en kilogrammes.
- **Filtres Dynamiques** : Le formulaire filtre dynamiquement les résultats en fonction des critères sélectionnés et affiche les Pokémon correspondants.

### Affichage des Pokémon
- **Disposition en Grille** : Les Pokémon sont affichés dans une grille sous forme de cartes. Chaque cartes montre :
  - L'image du Pokémon
  - Le nom du Pokémon
  - Les types du Pokémon
  - La taille du Pokémon
  - Le poids du Pokémon
- **Cartes Interactives** : En cliquant sur une carte de Pokémon, une fenêtre modale s'ouvre avec des informations plus détaillées.

### Informations Détaillées sur les Pokémon
- **Fenêtre Modale** : Les informations détaillées sur le Pokémon sélectionné sont affichées dans une fenêtre modale avec plusieurs onglets :
  - **Informations** : Détails de base incluant l'image, les types, la taille et le poids.
  - **Formes** : Affiche les différentes formes disponibles du Pokémon.
  - **Évolutions et Reproduction** : Détails de la chaîne d'évolution du Pokémon.
  - **Localisations** : Lieux de rencontre du Pokémon dans les jeux.
  - **Statistiques** : Statistiques de base du Pokémon.
  - **Attaques** : Liste des attaques que le Pokémon peut apprendre.
  - **Descriptions** : Description du Pokémon dans le Pokédex.
  - **Cri** : Son du cri du Pokémon.

### Animation de Pokéball
- **Animation de Fond** : L'application présente une animation continue de Pokéballs tombantes en arrière-plan pour ajouter une touche esthétique.

## Technologies Utilisées

- **HTML** : Utilisé pour structurer le contenu de l'application.
- **CSS** : Utilisé pour styliser et mettre en page l'application, rendant l'interface utilisateur attrayante et réactive.
- **JavaScript** : Utilisé pour ajouter des fonctionnalités dynamiques et interactives, telles que la recherche et le filtrage des Pokémon, et la gestion des événements utilisateur.
- **PokeAPI** : Une API externe utilisée pour récupérer les données détaillées des Pokémon, y compris les informations de base, les types, les statistiques, et plus encore.
- **pokemon showdown** :  Une API externe utilisée pour récupérer les données détaillées des Pokémon, y compris les informations de base, les types, les statistiques, et plus encore. (utilisé pour les cris de la 9eme gen principalement).

## reste à faire
- amélioration fluidité formulaire de recherche avancé pour recherche dynamique
- optimisation traduction française
- correction slidebarpoids et taille à optimiser.
- certaines modales n'apparaissent pas en cliquant sur la carte, investigations en cours.
- modifications police d'écriture
