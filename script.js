document.addEventListener("DOMContentLoaded", () => {
    const pokedex = document.getElementById('pokedex');
    const searchForm = document.getElementById('search-form');
    const searchType = document.getElementById('search-type');
    const searchNumber = document.getElementById('search-number');
    const modal = document.getElementById("pokemon-modal");
    const closeButton = document.querySelector(".close-button");

    // Fonction pour récupérer les données des Pokémon depuis l'API
    async function fetchPokemonData() {
        try {
            const allPokemon = [];
            for (let i = 1; i <= 150; i++) { // Récupérer les 150 premiers Pokémon
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);
                const pokemon = await response.json();
                allPokemon.push(pokemon);
            }
            return allPokemon;
        } catch (error) {
            console.error('Erreur lors de la récupération des données Pokémon:', error);
        }
    }

    // Fonction pour afficher les Pokémon dans le pokédex
    async function displayPokemon(pokemons) {
        pokedex.innerHTML = ''; // Vider le pokédex
        for (const pokemon of pokemons) {
            const speciesResponse = await fetch(pokemon.species.url);
            const speciesData = await speciesResponse.json();
            const nameInFrench = speciesData.names.find(name => name.language.name === 'fr').name;
            
            const pokemonCard = document.createElement('div');
            pokemonCard.classList.add('pokemon-card');
            pokemonCard.dataset.pokemonId = pokemon.id;

            pokemonCard.innerHTML = `
                <img src="${pokemon.sprites.front_default}" alt="${nameInFrench}">
                <h2>${nameInFrench}</h2>
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
        const speciesResponse = await fetch(pokemon.species.url);
        const speciesData = await speciesResponse.json();
        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        const evolutionData = await evolutionResponse.json();
        
        document.getElementById('Informations').innerHTML = `
            <h2>${nameInFrench}</h2>
            <img src="${pokemon.sprites.front_default}" alt="${nameInFrench}">
            <p><strong>Type:</strong> ${pokemon.types.map(typeInfo => typeInfo.type.name).join(', ')}</p>
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

        document.getElementById('Localisations').innerHTML = `
            <h3>Localisations</h3>
            <p>Les localisations dans les jeux où ce Pokémon peut être trouvé seront affichées ici.</p>
        `;

        document.getElementById('Attaques').innerHTML = `
            <h3>Attaques</h3>
            <ul>
                ${pokemon.moves.map(move => `<li>${move.move.name}</li>`).join('')}
            </ul>
        `;

        document.getElementById('Descriptions').innerHTML = `
            <h3>Description du Pokédex</h3>
            <p>${speciesData.flavor_text_entries.find(entry => entry.language.name === 'fr').flavor_text}</p>
        `;

        modal.style.display = "block";
        openTab(null, 'Informations'); // Afficher l'onglet 'Informations' par défaut
    }

    // Fonction pour afficher la chaîne d'évolution avec images
    async function renderEvolutionChain(chain) {
        if (!chain) return "<p>Aucune information d'évolution disponible.</p>";

        let evolutionHTML = '';
        let currentChain = chain;

        do {
            const pokemonName = currentChain.species.name;
            const minLevel = currentChain.evolution_details[0] ? ` (Niveau min: ${currentChain.evolution_details[0].min_level})` : '';
            const pokemonData = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`).then(res => res.json());
            const pokemonImage = pokemonData.sprites.front_default;
            const speciesResponse = await fetch(pokemonData.species.url);
            const speciesData = await speciesResponse.json();
            const nameInFrench = speciesData.names.find(name => name.language.name === 'fr').name;
            
            evolutionHTML += `<p><img src="${pokemonImage}" alt="${nameInFrench}"> ${nameInFrench}${minLevel}</p>`;
            console.log('Current Evolution:', pokemonName); // Debugging line
            currentChain = currentChain.evolves_to.length > 0 ? currentChain.evolves_to[0] : null;
        } while (currentChain);

        return evolutionHTML;
    }

    // Fonction pour filtrer les Pokémon en fonction des critères de recherche
    function filterPokemon(pokemons, type, number) {
        return pokemons.filter(pokemon => {
            const matchesType = type === '' || pokemon.types.some(p => p.type.name === type);
            const matchesNumber = number === '' || pokemon.id == number;
            return matchesType && matchesNumber;
        });
    }

    // Gestion de l'événement de soumission du formulaire de recherche
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const type = searchType.value;
        const number = searchNumber.value;
        fetchPokemonData().then(allPokemon => {
            const filteredPokemon = filterPokemon(allPokemon, type, number);
            displayPokemon(filteredPokemon);
        });
    });

    // Appel initial pour récupérer et afficher tous les Pokémon
    fetchPokemonData().then(allPokemon => {
        displayPokemon(allPokemon);
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


