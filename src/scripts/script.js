// --------------------------------Importações de UI-------------------------------------
// Seletores de elementos HTML
import {
  setupThemeToggle,
  themeToggleButton,
  addEventListeners,
  loadInitialPokemons
} from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    setupThemeToggle(themeToggleButton);
});

// Função principal para inicializar a Pokedex
async function initializePokedex() {
    addEventListeners();
    await loadInitialPokemons();
}

// Inicializa a Pokedex
initializePokedex();