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