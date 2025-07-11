// Configurações e constantes
const API_BASE_URL = 'https://pokeapi.co/api/v2';
const INITIAL_LOAD_LIMIT = 10;

// Seletores de elementos HTML
const pokemonContainer = document.getElementById('pokemon-container');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const modal = document.getElementById('form-modal');
const formOptions = document.getElementById('form-options');
const confirmButton = document.getElementById('confirm-button');
const cancelButton = document.getElementById('cancel-button');
const themeToggleButton = document.getElementById('theme-toggle');

// Tradução de tipos de Pokémon
const typeTranslations = {
    normal: 'Normal',
    fire: 'Fogo',
    water: 'Água',
    eletric: 'Elétrico',
    grass: 'Grama',
    ice: 'Gelo',
    fighting: 'Lutador',
    poison: 'Venenoso',
    ground: 'Terra',
    flying: 'Voador',
    psychic: 'Psíquico',
    bug: 'Inseto',
    rock: 'Pedra',
    ghost: 'Fantasma',
    dragon: 'Dragão',
    dark: 'Sombrio',
    steel: 'Aço',
    fairy: 'Fada',
    unknown: 'Desconhecido',
};

document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    themeToggleButton.addEventListener('click', () => {
        body.classList.toggle('dark-theme');
    });
});

// Função principal para inicializar a Pokedex
async function initializePokedex() {
    addEventListeners();
    await loadInitialPokemons();
}

// Adiciona eventos aos elementos
function addEventListeners() {
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') handleSearch();
    });

    cancelButton.onclick = () => closeModal(null);

    window.onclick = (event) => {
        if (event.target === modal) closeModal(null);
    };
}

// Função para carregar os Pokémons iniciais
async function loadInitialPokemons() {
    pokemonContainer.innerHTML = '';
    for (let i = 1; i <= INITIAL_LOAD_LIMIT; i++) {
        const pokemon = await fetchPokemon(i);
        if (pokemon) createPokemonCard(pokemon);
    }
}

// Função para buscar dados de um Pokémon
async function fetchPokemon(query) {
    try {
        // Valida se o query é uma string ou número válido
        if (!query || (typeof query !== 'string' && typeof query !== 'number')) {
            throw new Error('Consulta inválida. Insira um nome ou número de Pokémon válido.');
        }

        const queryString = String(query).toLowerCase(); // Garante que query seja uma string
        const response = await fetch(`${API_BASE_URL}/pokemon/${queryString}`);
        if (!response.ok) throw new Error('Pokémon não encontrado');
        const pokemon = await response.json();

        // Verifica se há variações disponíveis
        const speciesData = await fetchSpeciesData(pokemon.id);
        if (speciesData.varieties && speciesData.varieties.length > 1) {
            const varietyNames = speciesData.varieties.map(form => form.pokemon.name);
            const selectedVariety = await showFormSelectionModal(pokemon.name, varietyNames);

            if (selectedVariety) {
                // Busca a variação selecionada
                const varietyResponse = await fetch(`${API_BASE_URL}/pokemon/${selectedVariety}`);
                if (!varietyResponse.ok) throw new Error('Pokemon não encontrada');
                return await varietyResponse.json();
            }
        }
        return pokemon;
    } catch (error) {
        handleError(error.message);
        return null;
    }
}

// Função para buscar detalhes da espécie e evolução
async function fetchEvolutionDetails(pokemonId) {
    try {
        const speciesData = await fetchSpeciesData(pokemonId);
        if (!speciesData.evolution_chain) return [];

        const evolutionData = await fetchData(speciesData.evolution_chain.url);
        return await collectEvolutionDetails(evolutionData.chain);
    } catch (error) {
        handleError(error.message);
        return [];
    }
}

// Função para buscar dados da espécie
async function fetchSpeciesData(pokemonId) {
    const response = await fetch(`${API_BASE_URL}/pokemon-species/${pokemonId}`);
    if (!response.ok) throw new Error('Detalhes da espécie não encontrados');
    return await response.json();
}

// Função para coletar detalhes da cadeia de evolução
async function collectEvolutionDetails(chain) {
    const evolutions = [];
    const collect = (node) => {
        if (node && node.species && node.species.name) {
            evolutions.push(node.species.name);
            node.evolves_to.forEach(collect);
        }
    };
    collect(chain);

    const evolutionDetails = await Promise.all(
        evolutions.map(async (name) => {
            try {
                return await fetchPokemon(name.toLowerCase());
            } catch {
                console.warn(`Falha ao buscar evolução: ${name}`);
                return null;
            }
        })
    );
    return evolutionDetails.filter(Boolean); // Remove valores nulos
}

// Função para criar um card de Pokémon
function createPokemonCard(pokemon) {
    const card = document.createElement('div');
    card.classList.add('pokemon-card');
    card.innerHTML = `
        <h2>#${pokemon.id} ${capitalizeFirstLetter(pokemon.name)}</h2>
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <p><strong>Tipo:</strong> ${pokemon.types.map(type => translateType(type.type.name)).join(', ')}</p>
        <p><strong>Peso:</strong> ${(pokemon.weight / 10).toFixed(1)} kg</p>
        <p><strong>Altura:</strong> ${(pokemon.height / 10).toFixed(1)} m</p>
        <p><strong>Ataques Especiais:</strong> ${pokemon.moves.slice(0, 5).map(move => capitalizeFirstLetter(move.move.name)).join(', ')}</p>
    `;
    pokemonContainer.appendChild(card);
}

// Função para lidar com a pesquisa
async function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) {
        alert('Por favor, insira um nome ou número de Pokémon válido!');
        return;
    }

    const pokemon = await fetchPokemon(query);
    if (!pokemon) return;

    pokemonContainer.innerHTML = '';
    createPokemonCard(pokemon);

    const evolutionDetails = await fetchEvolutionDetails(pokemon.id);
    const filteredEvolutions = evolutionDetails.filter(evo => evo.id !== pokemon.id);
    filteredEvolutions.forEach(createPokemonCard);
}

// Função para exibir o modal de seleção de formas
function showFormSelectionModal(pokemonName, varietyNames) {
    return new Promise((resolve) => {
        formOptions.innerHTML = varietyNames
            .map((variety, index) => `
                <label>
                    <input type="radio" name="variety" value="${variety.toLowerCase().trim()}" ${index === 0 ? 'checked' : ''}>
                    ${capitalizeFirstLetter(variety)}
                </label><br>
            `)
            .join('');
        console.log('Exibindo modal...');
        modal.style.display = 'block';

        confirmButton.onclick = () => {
            const selectedVariety = document.querySelector('input[name="variety"]:checked')?.value;
            closeModal();
            resolve(selectedVariety || null); // Garante que nunca será undefined
        };

        cancelButton.onclick = () => {
            closeModal();
            resolve(null);
        };

        window.onclick = (event) => {
            if (event.target === modal) {
                closeModal();
                resolve(null);
            }
        };
    });
}

// Função para fechar o modal
function closeModal() {
    modal.style.display = 'none';
}

// Função para traduzir tipos de Pokémon
function translateType(type) {
    return typeTranslations[type] || type;
}

// Função para capitalizar a primeira letra de uma string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Função genérica para buscar dados de uma URL
async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Erro ao buscar dados');
    return await response.json();
}

// Função para lidar com erros
function handleError(message) {
    console.error(message);
    alert(message);
}

// Inicializa a Pokedex
initializePokedex();