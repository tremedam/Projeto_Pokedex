import {
    INITIAL_LOAD_LIMIT,
    fetchPokemon,
    fetchEvolutionDetails   
} from './api.js';

import { 
    capitalizeFirstLetter 
} from './util.js';

export const pokemonContainer = document.getElementById('pokemon-container');
export const searchInput = document.getElementById('search-input');
export const searchButton = document.getElementById('search-button');
export const modal = document.getElementById('form-modal');
export const formOptions = document.getElementById('form-options');
export const confirmButton = document.getElementById('confirm-button');
export const cancelButton = document.getElementById('cancel-button');
export const themeToggleButton = document.getElementById('theme-toggle');

export const typeTranslations = {
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

export function setupThemeToggle(themeToggleButton) {
  const body = document.body;
  themeToggleButton.addEventListener('click', () => {
    body.classList.toggle('dark-theme');
  });
}

// Adiciona eventos aos elementos
export function addEventListeners() {
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
export async function loadInitialPokemons() {
    pokemonContainer.innerHTML = '';
    for (let i = 1; i <= INITIAL_LOAD_LIMIT; i++) {
        try {
            const result = await fetchPokemon(i);
            let pokemon;
            if (result.varieties) {
                // Se houver variedades, pega a primeira por padrão
                const varietyResult = await fetchPokemon(result.varieties[0]);
                pokemon = varietyResult.pokemon;
            } else {
                pokemon = result.pokemon;
            }
            if (pokemon) createPokemonCard(pokemon);
        } catch (error) {
            console.warn(error.message);
        }
    }
}

// Função para criar um card de Pokémon
export function createPokemonCard(pokemon) {
    const card = document.createElement('div');
    card.classList.add('pokemon-card');
    card.innerHTML = `
        <h2>#${pokemon.id} ${capitalizeFirstLetter(pokemon.name || '')}</h2>
        <img src="${pokemon.sprites?.front_default || ''}" alt="${pokemon.name || ''}">
        <p><strong>Tipo:</strong> ${pokemon.types?.map(type => translateType(type.type.name)).join(', ') || ''}</p>
        <p><strong>Peso:</strong> ${(pokemon.weight ? (pokemon.weight / 10).toFixed(1) : '?')} kg</p>
        <p><strong>Altura:</strong> ${(pokemon.height ? (pokemon.height / 10).toFixed(1) : '?')} m</p>
        <p><strong>Ataques Especiais:</strong> ${pokemon.moves?.slice(0, 5).map(move => capitalizeFirstLetter(move.move?.name || '')).join(', ') || ''}</p>
    `;
    pokemonContainer.appendChild(card);
}

// Função para lidar com a pesquisa
export async function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) {
        alert('Por favor, insira um nome ou número de Pokémon válido!');
        return;
    }

    try {
        const result = await fetchPokemon(query);
        let pokemon;
        if (result.varieties) {
            const selectedVariety = await showFormSelectionModal(result.pokemon.name, result.varieties);
            if (!selectedVariety) return;
            const varietyResult = await fetchPokemon(selectedVariety);
            pokemon = varietyResult.pokemon;
        } else {
            pokemon = result.pokemon;
        }

        pokemonContainer.innerHTML = '';
        createPokemonCard(pokemon);

        const evolutionDetails = await fetchEvolutionDetails(pokemon.id);
        const filteredEvolutions = evolutionDetails.filter(evo => evo && evo.id && evo.id !== pokemon.id);
        filteredEvolutions.forEach(createPokemonCard);
    } catch (error) {
        alert(error.message);
    }
}

// Função para exibir o modal de seleção de formas
export function showFormSelectionModal(pokemonName, varietyNames) {
    return new Promise((resolve) => {

        confirmButton.onclick = null;
        cancelButton.onclick = null;
        window.onclick = null;

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
export function closeModal() {
    modal.style.display = 'none';
}

// Função para traduzir tipos de Pokémon
export function translateType(type) {
    return typeTranslations[type] || type;
}