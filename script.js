const pokemonContainer = document.getElementById('pokemon-container');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

// Função para buscar dados na PokeAPI
async function fetchPokemon(query) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${String(query).toLowerCase()}`);
        if (!response.ok) throw new Error('Pokemon não encontrado');
        const data = await response.json();
        return data;
    } catch (error) {
        alert(error.message);
        return null;
    }
}
// Função para capitalizar a primeira letra do nome
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Função para criar um card de Pokemon
function createPokemonCard(pokemon) {
    const card = document.createElement('div');
    card.classList.add('pokemon-card');
    card.innerHTML = `
        <h2>${capitalizeFirstLetter(pokemon.name)}</h2>
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <p>Tipo: ${pokemon.types.map(type => type.type.name).join(', ')}</p>
    `;
    pokemonContainer.innerHTML = ''; // Ajuda a limpar os resultados anteriores
    pokemonContainer.appendChild(card);
}

// Função para carregar múltiplos Pokemons
async function loadPokemons() {
    pokemonContainer.innerHTML = ''; // Ajuda a limpar os resultados anteriores
    for (let i = 1; i <= 10; i++) { // Carrega os 10 primeiros Pokemons
        const pokemon = await fetchPokemon(i);
        if (pokemon) createPokemonCard(pokemon);
    }
}

// Função de pesquisa
async function searchPokemon() {
    const query = searchInput.value.trim();
    if (!query) {
        alert('Por favor insira um nome ou número de Pokemon, VALIDO!');
        return;
    }
    const pokemon = await fetchPokemon(query);
    if (pokemon) createPokemonCard(pokemon);
}

// Adiciona evento ao botão de pesquisa
searchButton.addEventListener('click', searchPokemon);

searchInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        searchPokemon();
    }
})

// Inicializa a Pokedex
loadPokemons();