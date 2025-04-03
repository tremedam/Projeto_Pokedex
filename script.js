// Seletores de elementos HTML
const pokemonContainer = document.getElementById('pokemon-container');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

// Tradução de tipos de Pokemon
const typeTranslations = {
    normal: 'Normal',
    fire: 'Fogo',
    water: 'Água',
    eletric: 'Elétrico',
    grass: 'Grama',
    ice: 'Gelo',
    fighting: 'Lutador',
    poison: 'Venenoso',
    ground: 'terra',
    flying: 'Voador',
    psychic: 'Psíquico',
    bug: 'Inseto',
    rock: 'Pedra',
    ghost: 'fantasma',
    dragon: 'Dragão',
    dark: 'Sombrio',
    steel: 'Aço',
    fairy: 'fada',
    unknown: 'Desconhecido',
}

// Função para buscar dados dos pokemons na PokeAPI
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

// Função para traduzir tipos de Pokemon
function translateType(type) {
    return typeTranslations[type] || type; // Retorna o tipo original se não houver tradução    
}

// Função para criar um card de Pokemon
function createPokemonCard(pokemon) {
    const card = document.createElement('div');
    card.classList.add('pokemon-card');
    card.innerHTML = `
        <h2>#${pokemon.id} ${capitalizeFirstLetter(pokemon.name)}</h2>
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <p><strong>Tipo:</strong> ${pokemon.types.map(type => translateType(type.type.name)).join(', ')}</p>
        <p><strong>Peso:</strong> ${(pokemon.weight / 10).toFixed(1)} kg</p>
        <p><strong>Altura:</strong> ${(pokemon.height / 10).toFixed(1)} m</p> 
        <p><strong>Ataques Especiais:</strong> ${pokemon.moves.slice(0, 5).map(move => capitalizeFirstLetter(move.move.name)).join(',  ')}</p>
    `;
    pokemonContainer.appendChild(card);
}

// Função para buscar detalhes de evolução
async function fetchEvolutionDetails(pokemonId) {
    try {
        const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
        if (!speciesResponse.ok) throw new Error('Detalhes da evolução não encontrados.');
        const speciesData = await speciesResponse.json();

        if (!speciesData.evolution_chain) return []; // Retorna um array vazio se não houver cadeia de evolução

        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        if (!evolutionResponse.ok) throw new Error('Cadeia de evolução não disponível.');
        const evolutionData = await evolutionResponse.json();

        const evolutions = [];
        const collectEvolutions = (chain) => {
            if (chain) {
                evolutions.push(chain.species.name); // Adiciona o nome do pokemon
                chain.evolves_to.forEach(collectEvolutions); 
            }
        };

        collectEvolutions(evolutionData.chain);

        const evolutionDetails = await Promise.all(
            evolutions.map(async (name) => {
                const pokemon = await fetchPokemon(name.toLowerCase());
                return pokemon;
            })
        )
        return evolutionDetails.filter(Boolean);
    } catch (error) {
        console.error(error.message);
        return []; // Retorna um array vazio em caso de erro
    }
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
    if (!pokemon) return;

    // Obter cadeia de evolução
    const evolutionDetails = await fetchEvolutionDetails(pokemon.id);
    if (!evolutionDetails || evolutionDetails.length === 0) {
        alert('Não foi possível obter a cadeia de evoluções deste Pokémon.');
        return;
    }

    // Limpar o container antes de exibir os resultados
    pokemonContainer.innerHTML = '';

    // Buscar e exibir todos os Pokémons da cadeia de evolução
    evolutionDetails.forEach((evolutionPokemon) => {
        createPokemonCard(evolutionPokemon);
    })
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