document.addEventListener("DOMContentLoaded", () => {
    const pokedex = document.getElementById('pokedex');
    const searchForm = document.getElementById('search-form');
    const searchType = document.getElementById('search-type');
    const searchNumber = document.getElementById('search-number');
    const searchGeneration = document.getElementById('search-generation');
    const searchHeightMin = document.getElementById('search-height-min');
    const searchHeightMax = document.getElementById('search-height-max');
    const searchWeightMin = document.getElementById('search-weight-min');
    const searchWeightMax = document.getElementById('search-weight-max');
    const selectedCriteria = document.getElementById('selected-criteria');
    const noResultsMessage = document.getElementById('no-results-message');
    const resetButton = document.getElementById('reset-button');
    const modal = document.getElementById("pokemon-modal");
    const closeButton = document.querySelector(".close-button");

    let allPokemonData = [];
    const displayedPokemonIds = new Set();

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

    pokedex.style.display = 'none';

    async function fetchPokemonDataByGeneration(generationId) {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/generation/${generationId}`);
            const generationData = await response.json();
            const allPokemon = await Promise.all(generationData.pokemon_species.map(async (species) => {
                const pokemonResponse = await fetch(species.url.replace('pokemon-species', 'pokemon'));
                return await pokemonResponse.json();
            }));
            console.log('Fetched Pokemon (raw):', allPokemon); // Ajout de log
            return allPokemon;
        } catch (error) {
            console.error('Erreur lors de la récupération des données Pokémon:', error);
            return [];
        }
    }

    function sortPokemonByNumber(pokemons) {
        const sortedPokemons = pokemons.sort((a, b) => a.id - b.id);
        console.log('Sorted Pokemon:', sortedPokemons); // Ajout de log
        return sortedPokemons;
    }

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

    async function renderAttacks(moves) {
        const attackNames = await Promise.all(moves.map(async (move) => {
            const moveResponse = await fetch(move.move.url);
            const moveData = await moveResponse.json();
            const nameInFrench = moveData.names.find(name => name.language.name === 'fr')?.name;
            return nameInFrench ? `<li>${nameInFrench}</li>` : '';
        }));
        return attackNames.join('');
    }

    function filterPokemon(pokemons, type, number, heightMin, heightMax, weightMin, weightMax) {
        if (!pokemons) return [];
        return pokemons.filter(pokemon => {
            const matchesType = type.length === 0 || pokemon.types.some(p => type.includes(p.type.name));
            const matchesNumber = number === '' || pokemon.id == number;
            const matchesHeight = pokemon.height / 10 >= heightMin && pokemon.height / 10 <= heightMax;
            const matchesWeight = pokemon.weight / 10 >= weightMin && pokemon.weight / 10 <= weightMax;
            return matchesType && matchesNumber && matchesHeight && matchesWeight;
        });
    }

    function updateHeightOutput() {
        const heightMin = searchHeightMin.value;
        const heightMax = searchHeightMax.value;
        document.getElementById('height-min-val').textContent = heightMin;
        document.getElementById('height-max-val').textContent = heightMax;
    }

    function updateWeightOutput() {
        const weightMin = searchWeightMin.value;
        const weightMax = searchWeightMax.value;
        document.getElementById('weight-min-val').textContent = weightMin;
        document.getElementById('weight-max-val').textContent = weightMax;
    }

    // Ajout des écouteurs d'événements pour dynamiser la recherche
    searchGeneration.addEventListener('change', handleSearch);
    searchType.addEventListener('change', handleSearch);
    searchNumber.addEventListener('input', handleSearch);
    searchHeightMin.addEventListener('input', updateHeightOutput);
    searchHeightMax.addEventListener('input', updateHeightOutput);
    searchWeightMin.addEventListener('input', updateWeightOutput);
    searchWeightMax.addEventListener('input', updateWeightOutput);
    searchHeightMin.addEventListener('input', handleSearch);
    searchHeightMax.addEventListener('input', handleSearch);
    searchWeightMin.addEventListener('input', handleSearch);
    searchWeightMax.addEventListener('input', handleSearch);

    resetButton.addEventListener('click', () => {
        searchForm.reset();
        pokedex.style.display = 'none';
        selectedCriteria.innerHTML = '';
        noResultsMessage.style.display = 'none';
    });

    closeButton.addEventListener('click', () => {
        modal.style.display = "none";
    });

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });

    function createPokeball() {
        const pokeball = document.createElement('div');
        pokeball.classList.add('pokeball');
        pokeball.style.top = `${Math.random() * window.innerHeight}px`;
        pokeball.style.animationDuration = `${Math.random() * 3 + 2}s`;
        document.getElementById('pokeball-animation-container').appendChild(pokeball);
        pokeball.addEventListener('animationend', () => {
            pokeball.remove();
        });
    }

    setInterval(createPokeball, 750);

    async function handleSearch() {
        const generationId = searchGeneration.value;
        const type = Array.from(searchType.selectedOptions).map(option => option.value);
        const number = searchNumber.value;
        const heightMin = searchHeightMin.value;
        const heightMax = searchHeightMax.value;
        const weightMin = searchWeightMin.value;
        const weightMax = searchWeightMax.value;

        selectedCriteria.innerHTML = `
            <p>Génération: ${generationId}</p>
            <p>Types: ${type.join(', ')}</p>
            <p>Numéro du Pokédex: ${number}</p>
            <p>Taille: ${heightMin} - ${heightMax} m</p>
            <p>Poids: ${weightMin} - ${weightMax} kg</p>
        `;

        if (!generationId) {
            pokedex.style.display = 'none';
            return;
        }

        try {
            const allPokemon = await fetchPokemonDataByGeneration(generationId);
            console.log('Fetched Pokémon:', allPokemon);
            const filteredPokemon = filterPokemon(allPokemon, type, number, heightMin, heightMax, weightMin, weightMax);
            console.log('Filtered Pokémon:', filteredPokemon);
            allPokemonData = filteredPokemon;
            await displayPokemon(filteredPokemon, true);
            pokedex.style.display = filteredPokemon.length ? 'flex' : 'none';
            noResultsMessage.style.display = filteredPokemon.length ? 'none' : 'block';
        } catch (error) {
            console.error('Erreur lors de la récupération des données Pokémon:', error);
            pokedex.style.display = 'none';
            noResultsMessage.style.display = 'block';
        }
    }

    // Ajout de la fonction openTab
    function openTab(evt, tabName) {
        // Déclaration de toutes les variables
        let i, tabcontent, tablinks;

        // Obtenez tous les éléments avec la classe "tabcontent" et cachez-les
        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }

        // Obtenez tous les éléments avec la classe "tablinks" et supprimez la classe "active"
        tablinks = document.getElementsByClassName("tablinks");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }

        // Affichez l'onglet actuel et ajoutez une classe "active" au bouton qui a ouvert l'onglet
        document.getElementById(tabName).style.display = "block";
        if (evt) {
            evt.currentTarget.className += " active";
        }
    }

    // Ajoutez un écouteur d'événement aux onglets pour gérer le changement d'onglet
    const tabLinks = document.querySelectorAll(".tablinks");
    tabLinks.forEach(tab => {
        tab.addEventListener("click", (event) => {
            openTab(event, tab.dataset.tab);
        });
    });

});
