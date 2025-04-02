const pokemonContainer = document.getElementById('pokemon-container');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
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

// Função para traduzir tipos de Pokemon
function translateType(type) {
    return typeTranslations[type] || type; // Retorna o tipo original se não houver tradução    
}

// Função para criar um card de Pokemon
function createPokemonCard(pokemon) {
    const card = document.createElement('div');
    card.classList.add('pokemon-card');
    card.innerHTML = `
        <h2>${capitalizeFirstLetter(pokemon.name)}</h2>
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <p><strong>Tipo:</strong> ${pokemon.types.map(type => translateType(type.type.name)).join(', ')}</p>
        <p><strong>Peso:</strong> ${(pokemon.weight / 10).toFixed(1)} kg</p>
        <p><strong>Altura:</strong> ${(pokemon.height / 10).toFixed(1)} m</p> 
        <p><strong>Ataques Especiais:</strong> ${pokemon.moves.slice(0, 5).map(move => capitalizeFirstLetter(move.move.name)).join(',  ')}</p>
    `;
    pokemonContainer.innerHTML = ''; // Ajuda a limpar os resultados anteriores
    pokemonContainer.appendChild(card);

    //Adicionar evolução, se disponivel.
    fetchEvolutionDetails(pokemon.id).then(evolutionDetails => {
        if (evolutionDetails) {
            const evolutionInfo = document.createElement('p');
            evolutionInfo.innerHTML = `<strong>Evoluções:</strong> ${evolutionDetails}`;
            card.appendChild(evolutionInfo);
        }
    });
}

//Função para buscar detalhes de evolução
async function fetchEvolutionDetails(pokemonId) {
    try {
        const speciesResponse = await fetch(`https:pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
        if (!speciesResponse.ok) throw new Error('Detalhes da evolução não encontrados.');
        const speciesData = await speciesResponse.json();

        if (!speciesData.evolution_chain) return "Este pokemon, não tem evoluções.";

        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        if (!evolutionResponse.ok) throw new Error('Cadeia de evolução não disponivel.');
        const evolutionData = await evolutionResponse.json();

        const evolutions = [];
        let current = evolutionData.chain;

        do{
            evolutions.push(capitalizeFirstLetter(current.species.name));
            current = current.evolves_to[0]; // Pega a primeira evolução se existir
        } while (current);

        return evolutions.join(' → '); // Retorna as evoluções em formato de string
    } catch (error) {
        console.error(error.message);
        return null; // Retorna nulo se houver erro
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