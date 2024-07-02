// Fonction pour ouvrir un onglet de détail Pokémon
function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.querySelectorAll(".sidebar ul li a");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    if (evt) {
        evt.currentTarget.className += " active";
    }
}

// Lorsque le contenu du document est chargé, exécute la fonction suivante
document.addEventListener("DOMContentLoaded", () => {
    // Sélectionne les éléments du DOM nécessaires
    const pokedex = document.getElementById('pokedex');
    const searchForm = document.getElementById('search-form');
    const searchType = document.getElementById('search-type');
    const searchNumber = document.getElementById('search-number');
    const searchGeneration = document.getElementById('search-generation');
    const searchHeightComparator = document.getElementById('search-height-comparator');
    const searchHeight = document.getElementById('search-height');
    const searchWeightComparator = document.getElementById('search-weight-comparator');
    const searchWeight = document.getElementById('search-weight');
    const selectedCriteria = document.getElementById('selected-criteria');
    const noResultsMessage = document.getElementById('no-results-message');
    const resetButton = document.getElementById('reset-button');
    const modal = document.getElementById("pokemon-modal");
    const closeButton = document.querySelector(".close-button");
    
    // Variables de contrôle
    let currentOffset = 0;
    const limit = 20;
    let allPokemonData = [];
    const displayedPokemonIds = new Set();

    // Couleurs associées aux types de Pokémon
    const typeColors = {
        normal: '#A8A77A',
        fire: '#EE8130',
        water: '#6390F0',
        electric: '#F7D02C',
        grass: '#7AC74C',
        ice: '#96D9D6',
        fighting: '#C22E28',
        poison: '#A33EA1',
        ground: '#E2BF65',
        flying: '#A98FF3',
        psychic: '#F95587',
        bug: '#A6B91A',
        rock: '#B6A136',
        ghost: '#735797',
        dragon: '#6F35FC',
        dark: '#705746',
        steel: '#B7B7CE',
        fairy: '#D685AD'
    };

    // Traduction des types de Pokémon en français
    const typeTranslation = {
        normal: 'Normal',
        fighting: 'Combat',
        flying: 'Vol',
        poison: 'Poison',
        ground: 'Sol',
        rock: 'Roche',
        bug: 'Insecte',
        ghost: 'Spectre',
        steel: 'Acier',
        fire: 'Feu',
        water: 'Eau',
        grass: 'Plante',
        electric: 'Électrik',
        psychic: 'Psy',
        ice: 'Glace',
        dragon: 'Dragon',
        dark: 'Ténèbres',
        fairy: 'Fée'
    };

    // Cache le pokédex au chargement
    pokedex.style.display = 'none';

    // Fonction pour récupérer les données Pokémon par génération
    async function fetchPokemonDataByGeneration(generationId) {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/generation/${generationId}`);
            const generationData = await response.json();
            const allPokemon = await Promise.all(generationData.pokemon_species.map(async (species) => {
                const pokemonResponse = await fetch(species.url.replace('pokemon-species', 'pokemon'));
                return await pokemonResponse.json();
            }));
            return allPokemon;
        } catch (error) {
            console.error('Erreur lors de la récupération des données Pokémon:', error);
            return [];
        }
    }

    // Fonction pour trier les Pokémon par numéro
    function sortPokemonByNumber(pokemons) {
        return pokemons.sort((a, b) => a.id - b.id);
    }

    // Fonction pour afficher les Pokémon
    async function displayPokemon(pokemons, reset = false) {
        if (reset) {
            pokedex.innerHTML = '';
            displayedPokemonIds.clear();
        }

        pokemons = sortPokemonByNumber(pokemons);

        for (const pokemon of pokemons) {
            if (displayedPokemonIds.has(pokemon.id)) {
                continue;
            }
            displayedPokemonIds.add(pokemon.id);

            const speciesResponse = await fetch(pokemon.species.url);
            const speciesData = await speciesResponse.json();
            const nameInFrench = speciesData.names.find(name => name.language.name === 'fr').name || pokemon.name;
            const typeInFrench = pokemon.types.map(typeInfo => typeTranslation[typeInfo.type.name]).join(', ');

            const pokemonCard = document.createElement('div');
            pokemonCard.classList.add('pokemon-card');
            pokemonCard.dataset.pokemonId = pokemon.id;

            const primaryTypeColor = typeColors[pokemon.types[0].type.name];
            const secondaryTypeColor = pokemon.types[1] ? typeColors[pokemon.types[1].type.name] : null;

            pokemonCard.style.background = secondaryTypeColor ?
                `linear-gradient(45deg, ${primaryTypeColor} 50%, ${secondaryTypeColor} 50%)` :
                primaryTypeColor;

            pokemonCard.innerHTML = `
                <div class="pokemon-number">#${pokemon.id}</div>
                <div class="pokemon-image">
                    <img src="${pokemon.sprites.front_default}" alt="${nameInFrench}" loading="lazy">
                </div>
                <div class="pokemon-info">
                    <h2 class="pokemon-name">${nameInFrench}</h2>
                    <p class="pokemon-type">Type: ${typeInFrench}</p>
                    <p class="pokemon-weight">Poids: ${pokemon.weight / 10} kg</p>
                    <p class="pokemon-height">Taille: ${pokemon.height / 10} m</p>
                </div>
            `;

            pokedex.appendChild(pokemonCard);

            pokemonCard.addEventListener('click', () => {
                showPokemonDetails(pokemon, nameInFrench);
            });
        }
    }

    // Fonction pour afficher les détails d'un Pokémon
    async function showPokemonDetails(pokemon, nameInFrench) {
        try {
            const speciesResponse = await fetch(pokemon.species.url);
            const speciesData = await speciesResponse.json();
            const evolutionResponse = await fetch(speciesData.evolution_chain.url);
            const evolutionData = await evolutionResponse.json();
            
            const typeInFrench = pokemon.types.map(typeInfo => typeTranslation[typeInfo.type.name]).join(', ');

            document.getElementById('Informations').innerHTML = `
                <h2>${nameInFrench}</h2>
                <img src="${pokemon.sprites.front_default}" alt="${nameInFrench}">
                <p><strong>Type:</strong> ${typeInFrench}</p>
                <p><strong>Poids:</strong> ${pokemon.weight / 10} kg</p>
                <p><strong>Taille:</strong> ${pokemon.height / 10} m</p>
            `;

            document.getElementById('Statistiques').innerHTML = `
                <h3>Statistiques de base</h3>
                <ul>
                    ${pokemon.stats.map(stat => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
                </ul>
            `;

            document.getElementById('Formes').innerHTML = `
                <h3>Formes</h3>
                <p>Les différentes formes et variations du Pokémon seront affichées ici.</p>
            `;

            document.getElementById('Evolutions').innerHTML = `
                <h3>Évolutions et reproduction</h3>
                ${await renderEvolutionChain(evolutionData.chain)}
            `;

            await showPokemonLocations(pokemon);

            document.getElementById('Attaques').innerHTML = `
                <h3>Attaques</h3>
                <ul>
                    ${await renderAttacks(pokemon.moves)}
                </ul>
            `;

            document.getElementById('Descriptions').innerHTML = `
                <h3>Description du Pokédex</h3>
                <p>${speciesData.flavor_text_entries.find(entry => entry.language.name === 'fr')?.flavor_text || 'Description non disponible en français.'}</p>
            `;

            modal.style.display = "block";
            openTab(null, 'Informations');
        } catch (error) {
            console.error('Erreur lors de l\'affichage des détails du Pokémon:', error);
        }
    }

    // Fonction pour afficher les localisations d'un Pokémon
    async function showPokemonLocations(pokemon) {
        const locationResponse = await fetch(pokemon.location_area_encounters);
        const locations = await locationResponse.json();

        const locationHTML = locations.map(location => {
            return `<p>${location.location_area.name}</p>`;
        }).join('');

        document.getElementById('Localisations').innerHTML = `
            <h3>Localisations</h3>
            ${locationHTML || '<p>Localisation non disponible.</p>'}
        `;
    }

    // Fonction pour rendre la chaîne d'évolution
    async function renderEvolutionChain(chain) {
        if (!chain) return "<p>Aucune information d'évolution disponible.</p>";

        let evolutionHTML = '';
        let currentChain = chain;

        do {
            const pokemonName = currentChain.species.name;
            const minLevel = currentChain.evolution_details[0]?.min_level ? ` (Niveau min: ${currentChain.evolution_details[0].min_level})` : '';
            const trigger = currentChain.evolution_details[0]?.trigger?.name ? ` (Déclencheur: ${currentChain.evolution_details[0].trigger.name})` : '';
            const item = currentChain.evolution_details[0]?.item?.name ? ` (Objet: ${currentChain.evolution_details[0].item.name})` : '';
            const pokemonData = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`).then(res => res.json());
            const pokemonImage = pokemonData.sprites.front_default;
            const speciesResponse = await fetch(pokemonData.species.url);
            const speciesData = await speciesResponse.json();
            const nameInFrench = speciesData.names.find(name => name.language.name === 'fr')?.name || pokemonName;

            evolutionHTML += `
                <div>
                    <img src="${pokemonImage}" alt="${nameInFrench}">
                    <p>${nameInFrench}${minLevel}${trigger}${item}</p>
                </div>
            `;
            currentChain = currentChain.evolves_to.length > 0 ? currentChain.evolves_to[0] : null;
        } while (currentChain);

        return evolutionHTML;
    }

    // Fonction pour rendre les attaques d'un Pokémon
    async function renderAttacks(moves) {
        const attackNames = await Promise.all(moves.map(async (move) => {
            const moveResponse = await fetch(move.move.url);
            const moveData = await moveResponse.json();
            const nameInFrench = moveData.names.find(name => name.language.name === 'fr')?.name;
            return nameInFrench ? `<li>${nameInFrench}</li>` : '';
        }));
        return attackNames.join('');
    }

    // Fonction pour filtrer les Pokémon selon les critères de recherche
    function filterPokemon(pokemons, type, number, heightComparator, height, weightComparator, weight) {
        if (!pokemons) return [];
        return pokemons.filter(pokemon => {
            const matchesType = type.length === 0 || pokemon.types.some(p => type.includes(p.type.name));
            const matchesNumber = number === '' || pokemon.id == number;
            const matchesHeight = height === '' || (heightComparator === 'at-least' && pokemon.height / 10 >= height) ||
                (heightComparator === 'at-most' && pokemon.height / 10 <= height) || (heightComparator === 'equal' && pokemon.height / 10 == height);
            const matchesWeight = weight === '' || (weightComparator === 'at-least' && pokemon.weight / 10 >= weight) ||
                (weightComparator === 'at-most' && pokemon.weight / 10 <= weight) || (weightComparator === 'equal' && pokemon.weight / 10 == weight);
            return matchesType && matchesNumber && matchesHeight && matchesWeight;
        });
    }

    // Événement de soumission du formulaire de recherche
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const generationId = searchGeneration.value;
        const type = Array.from(searchType.selectedOptions).map(option => option.value);
        const number = searchNumber.value;
        const heightComparator = searchHeightComparator.value;
        const height = searchHeight.value;
        const weightComparator = searchWeightComparator.value;
        const weight = searchWeight.value;

        selectedCriteria.innerHTML = `
            <p>Génération: ${generationId}</p>
            <p>Types: ${type.join(', ')}</p>
            <p>Numéro du Pokédex: ${number}</p>
            <p>Taille: ${heightComparator} ${height} m</p>
            <p>Poids: ${weightComparator} ${weight} kg</p>
        `;

        if (!generationId) {
            pokedex.style.display = 'none';
            return;
        }

        fetchPokemonDataByGeneration(generationId).then(allPokemon => {
            const filteredPokemon = filterPokemon(allPokemon, type, number, heightComparator, height, weightComparator, weight);
            allPokemonData = filteredPokemon;
            displayPokemon(filteredPokemon, true);
            pokedex.style.display = filteredPokemon.length ? 'flex' : 'none';
            noResultsMessage.style.display = filteredPokemon.length ? 'none' : 'block';
        });
    });

    // Événement pour réinitialiser le formulaire
    resetButton.addEventListener('click', () => {
        searchForm.reset();
        pokedex.style.display = 'none';
        selectedCriteria.innerHTML = '';
        noResultsMessage.style.display = 'none';
    });

    // Événement pour fermer la modal
    closeButton.addEventListener('click', () => {
        modal.style.display = "none";
    });

    // Événement pour fermer la modal en cliquant à l'extérieur
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });

    // Fonction pour créer une Pokéball animée
function createPokeball() {
    const pokeball = document.createElement('div');
    pokeball.classList.add('pokeball');

    // Position initiale aléatoire sur l'axe vertical
    pokeball.style.top = `${Math.random(1) * window.innerHeight}px`;

    // Durée d'animation aléatoire pour varier les vitesses de déplacement
    pokeball.style.animationDuration = `${Math.random() * 3 + 2}s`;

    // Ajoute la Pokéball au conteneur
    document.getElementById('pokeball-animation-container').appendChild(pokeball);

    // Retire la Pokéball du DOM une fois l'animation terminée
    pokeball.addEventListener('animationend', () => {
        pokeball.remove();
    });
}

// Génère des Pokéballs à intervalles réguliers
setInterval(createPokeball, 500);
});
