document.addEventListener("DOMContentLoaded", () => {
    const pokedex = document.getElementById('pokedex');
    const searchForm = document.getElementById('search-form');
    const searchName = document.getElementById('search-name');
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
            const allPokemon = await rateLimitRequests(generationData.pokemon_species.map(async (species) => {
                const pokemonResponse = await fetch(species.url.replace('pokemon-species', 'pokemon'));
                return await pokemonResponse.json();
            }), 5);
            console.log('Fetched Pokemon (raw):', allPokemon);
            return allPokemon;
        } catch (error) {
            console.error('Erreur lors de la récupération des données Pokémon:', error);
            return [];
        }
    }

    async function rateLimitRequests(promises, limit) {
        const results = [];
        const executing = [];

        for (const promise of promises) {
            const p = Promise.resolve().then(() => promise);
            results.push(p);

            if (limit <= promises.length) {
                const e = p.then(() => executing.splice(executing.indexOf(e), 1));
                executing.push(e);
                if (executing.length >= limit) {
                    await Promise.race(executing);
                }
            }
        }
        return Promise.all(results);
    }

    function sortPokemonByNumber(pokemons) {
        const sortedPokemons = pokemons.sort((a, b) => a.id - b.id);
        console.log('Sorted Pokemon:', sortedPokemons);
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

            const animatedSprite = pokemon.sprites.versions['generation-v']['black-white'].animated.front_default;
            const staticSprite = pokemon.sprites.front_default;
            const spriteToUse = animatedSprite || staticSprite;

            pokemonCard.innerHTML = `
                <div class="pokemon-number">#${pokemon.id}</div>
                <div class="pokemon-image">
                    <img src="${spriteToUse}" alt="${nameInFrench}" loading="lazy">
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
                ${await fetchPokemonForms(speciesData.varieties)}
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

    async function fetchPokemonForms(varieties) {
        if (!varieties || varieties.length <= 1) {
            return "<p>Aucune forme alternative disponible.</p>";
        }

        let formsHTML = '';

        for (const variety of varieties) {
            if (variety.is_default) continue;

            const formResponse = await fetch(variety.pokemon.url);
            const formData = await formResponse.json();
            const speciesResponse = await fetch(formData.species.url);
            const speciesData = await speciesResponse.json();
            const nameInFrench = speciesData.names.find(name => name.language.name === 'fr')?.name || formData.name;

            const typeInFrench = formData.types.map(typeInfo => typeTranslation[typeInfo.type.name]).join(', ');

            formsHTML += `
                <div class="pokemon-form">
                    <h4>${nameInFrench}</h4>
                    <img src="${formData.sprites.front_default}" alt="${nameInFrench}">
                    <p><strong>Type:</strong> ${typeInFrench}</p>
                    <p><strong>Poids:</strong> ${formData.weight / 10} kg</p>
                    <p><strong>Taille:</strong> ${formData.height / 10} m</p>
                </div>
            `;
        }

        return formsHTML;
    }

    async function showPokemonLocations(pokemon) {
        const locationResponse = await fetch(pokemon.location_area_encounters);
        const locations = await locationResponse.json();

        const locationHTML = locations.map(location => `<p>${location.location_area.name}</p>`).join('');

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

    function filterPokemon(pokemons, name, type, number, heightMin, heightMax, weightMin, weightMax) {
        if (!pokemons) return [];
        return pokemons.filter(pokemon => {
            const matchesName = !name || pokemon.name.toLowerCase() === name.toLowerCase();
            const matchesType = type.length === 0 || pokemon.types.some(p => type.includes(p.type.name));
            const matchesNumber = number === '' || pokemon.id == number;
            const matchesHeight = pokemon.height / 10 >= heightMin && pokemon.height / 10 <= heightMax;
            const matchesWeight = pokemon.weight / 10 >= weightMin && pokemon.weight / 10 <= weightMax;
            return matchesName && matchesType && matchesNumber && matchesHeight && matchesWeight;
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

    function updateFormWithPokemon(pokemon) {
        searchGeneration.value = pokemon.generation;
        const typeOptions = Array.from(searchType.options);
        typeOptions.forEach(option => {
            option.selected = pokemon.types.includes(option.value);
        });
        searchHeightMin.value = pokemon.heightMin;
        searchHeightMax.value = pokemon.heightMax;
        searchWeightMin.value = pokemon.weightMin;
        searchWeightMax.value = pokemon.weightMax;
        updateHeightOutput();
        updateWeightOutput();
    }

    async function handleSearch() {
        const name = searchName.value.toLowerCase();
        const generationId = searchGeneration.value;
        const type = Array.from(searchType.selectedOptions).map(option => option.value);
        const number = searchNumber.value;
        const heightMin = searchHeightMin.value;
        const heightMax = searchHeightMax.value;
        const weightMin = searchWeightMin.value;
        const weightMax = searchWeightMax.value;

        selectedCriteria.innerHTML = `
            <p>Nom: ${name}</p>
            <p>Génération: ${generationId}</p>
            <p>Types: ${type.join(', ')}</p>
            <p>Numéro du Pokédex: ${number}</p>
            <p>Taille: ${heightMin} - ${heightMax} m</p>
            <p>Poids: ${weightMin} - ${weightMax} kg</p>
        `;

        let allPokemon = [];
        if (generationId) {
            allPokemon = await fetchPokemonDataByGeneration(generationId);
        } else if (name) {
            allPokemon = await fetchPokemonDataByName(name);
        } else {
            pokedex.style.display = 'none';
            return;
        }

        const filteredPokemon = filterPokemon(allPokemon, name, type, number, heightMin, heightMax, weightMin, weightMax);
        allPokemonData = filteredPokemon;
        await displayPokemon(filteredPokemon, true);

        pokedex.style.display = filteredPokemon.length ? 'flex' : 'none';
        noResultsMessage.style.display = filteredPokemon.length ? 'none' : 'block';

        if (filteredPokemon.length === 1) {
            updateFormWithPokemon(filteredPokemon[0]);
        }
    }

    async function fetchPokemonDataByName(name) {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
            if (!response.ok) {
                if (response.status === 404) {
                    noResultsMessage.textContent = 'Aucun Pokémon trouvé pour ce nom.';
                    noResultsMessage.style.display = 'block';
                }
                throw new Error('Erreur de récupération des données');
            }
            const pokemonData = await response.json();
            noResultsMessage.style.display = 'none';
            return [pokemonData];
        } catch (error) {
            console.error('Erreur lors de la récupération des données Pokémon par nom:', error);
            return [];
        }
    }

    function initializeEventListeners() {
        searchName.addEventListener('input', handleSearch);
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

        const tabLinks = document.querySelectorAll(".tablinks");
        tabLinks.forEach(tab => {
            tab.addEventListener("click", (event) => {
                openTab(event, tab.dataset.tab);
            });
        });
    }

    function createPokeball() {
        const pokeball = document.createElement('div');
        pokeball.classList.add('pokeball');

        function getRandomPosition() {
            const screenWidth = window.innerWidth;
            const ballWidth = 50;
            const scrollbarWidth = 15;
            const maxPosition = screenWidth - ballWidth - scrollbarWidth;
            return Math.random() * maxPosition;
        }

        const randomPosition = getRandomPosition();
        pokeball.style.left = `${randomPosition}px`;
        pokeball.style.animationDuration = `${Math.random() * 3 + 2}s`;

        document.getElementById('pokeball-animation-container').appendChild(pokeball);

        pokeball.addEventListener('animationend', () => {
            console.log('Animation terminée, suppression de la Pokéball');
            pokeball.remove();
        });
    }

    function openTab(evt, tabName) {
        let i, tabcontent, tablinks;

        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }

        tablinks = document.getElementsByClassName("tablinks");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }

        document.getElementById(tabName).style.display = "block";
        if (evt) {
            evt.currentTarget.className += " active";
        }
    }

    setInterval(createPokeball, 250);

    initializeEventListeners();
});
