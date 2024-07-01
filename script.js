document.addEventListener("DOMContentLoaded", () => {
    const pokedex = document.getElementById('pokedex');
    const searchForm = document.getElementById('search-form');
    const searchType = document.getElementById('search-type');
    const searchNumber = document.getElementById('search-number');
    const searchGeneration = document.getElementById('search-generation');
    const modal = document.getElementById("pokemon-modal");
    const closeButton = document.querySelector(".close-button");
    let currentOffset = 0;
    const limit = 20;
    let allPokemonData = [];
    const displayedPokemonIds = new Set();

    // Dictionnaire des types de Pokémon en anglais vers français
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

    // Initialement, cacher la div pokedex
    pokedex.style.display = 'none';

    // Fonction pour récupérer les données des Pokémon d'une génération depuis l'API
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

    // Fonction pour récupérer les données des Pokémon par lots
    async function fetchPokemonData(offset, limit) {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
            const data = await response.json();
            const allPokemon = await Promise.all(data.results.map(async (pokemon) => {
                const pokemonResponse = await fetch(pokemon.url);
                return await pokemonResponse.json();
            }));
            return allPokemon;
        } catch (error) {
            console.error('Erreur lors de la récupération des données Pokémon:', error);
        }
    }

    // Fonction pour trier les Pokémon par numéro
    function sortPokemonByNumber(pokemons) {
        return pokemons.sort((a, b) => a.id - b.id);
    }

    // Fonction pour afficher les Pokémon dans le pokédex
    async function displayPokemon(pokemons, reset = false) {
        if (reset) {
            pokedex.innerHTML = ''; // Vider le pokédex avant d'ajouter de nouvelles cartes
            displayedPokemonIds.clear(); // Vider le set des IDs affichés
        }

        // Trier les Pokémon par numéro
        pokemons = sortPokemonByNumber(pokemons);

        for (const pokemon of pokemons) {
            if (displayedPokemonIds.has(pokemon.id)) {
                continue; // Ignorer les Pokémon déjà affichés
            }
            displayedPokemonIds.add(pokemon.id);

            const speciesResponse = await fetch(pokemon.species.url);
            const speciesData = await speciesResponse.json();
            const nameInFrench = speciesData.names.find(name => name.language.name === 'fr').name || pokemon.name;
            const typeInFrench = pokemon.types.map(typeInfo => typeTranslation[typeInfo.type.name]).join(', ');

            const pokemonCard = document.createElement('div');
            pokemonCard.classList.add('pokemon-card');
            pokemonCard.dataset.pokemonId = pokemon.id;

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

            // Ajouter un événement de clic pour afficher les détails du Pokémon
            pokemonCard.addEventListener('click', () => {
                showPokemonDetails(pokemon, nameInFrench);
            });
        }
    }

    // Fonction pour afficher les détails du Pokémon dans la modale
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
            openTab(null, 'Informations'); // Afficher l'onglet 'Informations' par défaut
        } catch (error) {
            console.error('Erreur lors de l\'affichage des détails du Pokémon:', error);
        }
    }

    // Fonction pour afficher les localisations du Pokémon
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

    // Fonction pour afficher la chaîne d'évolution avec images
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
            console.log('Current Evolution:', pokemonName); // Debugging line
            currentChain = currentChain.evolves_to.length > 0 ? currentChain.evolves_to[0] : null;
        } while (currentChain);

        return evolutionHTML;
    }

    // Fonction pour afficher les attaques en français
    async function renderAttacks(moves) {
        const attackNames = await Promise.all(moves.map(async (move) => {
            const moveResponse = await fetch(move.move.url);
            const moveData = await moveResponse.json();
            const nameInFrench = moveData.names.find(name => name.language.name === 'fr')?.name;
            if (!nameInFrench) {
                console.log(`Nom français introuvable pour l'attaque: ${move.move.name}`);
            }
            return nameInFrench ? `<li>${nameInFrench}</li>` : '';
        }));
        return attackNames.join('');
    }

    // Fonction pour filtrer les Pokémon en fonction des critères de recherche
    function filterPokemon(pokemons, type, number) {
        if (!pokemons) return [];
        return pokemons.filter(pokemon => {
            const matchesType = type === '' || pokemon.types.some(p => p.type.name === type);
            const matchesNumber = number === '' || pokemon.id == number;
            return matchesType && matchesNumber;
        });
    }

    // Gestion de l'événement de soumission du formulaire de recherche
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const generationId = searchGeneration.value;
        const type = searchType.value;
        const number = searchNumber.value;

        // Cacher le pokedex si aucune génération n'est sélectionnée
        if (!generationId) {
            pokedex.style.display = 'none';
            return;
        }

        fetchPokemonDataByGeneration(generationId).then(allPokemon => {
            const filteredPokemon = filterPokemon(allPokemon, type, number);
            allPokemonData = filteredPokemon; // Mettre à jour les données Pokémon filtrées
            displayPokemon(filteredPokemon, true); // Passer true pour indiquer une réinitialisation
            pokedex.style.display = 'flex'; // Afficher le pokedex si des Pokémon sont trouvés
        });
    });

    // Appel initial pour récupérer et afficher les Pokémon par lots (si nécessaire)
    function loadMorePokemon() {
        fetchPokemonData(currentOffset, limit).then(allPokemon => {
            allPokemonData = [...allPokemonData, ...allPokemon]; // Ajouter de nouveaux Pokémon aux données existantes
            displayPokemon(allPokemonData); // Ne pas passer true ici pour éviter la réinitialisation
            currentOffset += limit;
        });
    }

    // Event listener for infinite scroll (si nécessaire)
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
            loadMorePokemon();
        }
    });

    // Fermer la modale lorsque l'utilisateur clique sur le bouton de fermeture
    closeButton.addEventListener('click', () => {
        modal.style.display = "none";
    });

    // Fermer la modale lorsque l'utilisateur clique en dehors de la modale
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });
});

// Fonction pour gérer la navigation entre les onglets
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
