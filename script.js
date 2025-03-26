/* Para buscar os dados da PokeAPI e exibir as informações. */

function handleKeyPress(event) {
    if (event.key === "Enter") {
        searchPokemon();
    }
}

function searchPokemon() {
    const input = document.getElementById('pokemonInput').value.toLowerCase();
    const url = `https://pokeapi.co/api/v2/pokemon/${input}`;
    
    const translations = {
        stats: {
            "hp": "Pontos de Vida",
            "attack": "Ataque",
            "defense": "Defesa",
            "special-attack": "Ataque Especial",
            "special-defense": "Defesa Especial",
            "speed": "Velocidade"
        },
        types: {
            "normal": "Normal",
            "fire": "Fogo",
            "water": "Água",
            "grass": "Grama",
            "electric": "Elétrico",
            "ice": "Gelo",
            "fighting": "Lutador",
            "poison": "Venenoso",
            "ground": "Terra",
            "flying": "Voador",
            "psychic": "Psíquico",
            "bug": "Inseto",
            "rock": "Pedra",
            "ghost": "Fantasma",
            "dragon": "Dragão",
            "dark": "Sombrio",
            "steel": "Aço",
            "fairy": "Fada"
        }
    };

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Pokemon não encontrado!');
            }
            return response.json();
        })
        .then(data => {
            const pokemonInfo = document.getElementById('pokemonInfo');	
            pokemonInfo.innerHTML = `
                <!-- Bloco de imagens -->
                <div class="pokemon-container">
                    <div class="pokemon-images">
                    <img src="${data.sprites.front_default}" alt="${data.name}">
                    <img src="${data.sprites.back_default}" alt="Visão Traseira">
                    <img src="${data.sprites.front_shiny}" alt="Versão Shiny">
                </div>

                <!-- Bloco de detalhes -->
                <div class="pokemon-details">
                    <h2 id="pokemonName">${data.name.toUpperCase()}</h2>
                    <p><strong>Número:</strong> ${data.id}</p>
                    <p><strong>Tipo:</strong> ${data.types.map(t =>
                        translations.types[t.type.name] || t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)
                    ).join(", ")}</p>
                    <p><strong>Altura:</strong> ${(data.height / 10).toFixed(1)} m</p>
                    <p><strong>Peso:</strong> ${(data.weight / 10).toFixed(1)} kg</p>
                    <p><strong>Estatisticas Base:</strong></p>
                    <ul>
                        ${data.stats.map(stat => 
                            `<li>${translations.stats[stat.stat.name] || stat.stat.name}: ${stat.base_stat}</li>`
                        ).join("")}
                    </ul>
                    <p><strong>Habilidades:</strong> ${data.abilities.map(a =>
                        a.ability.name.charAt(0).toUpperCase() + a.ability.name.slice(1)
                    ).join(", ")}</p>
                </div>
            </div>
        `;
    })
    .catch(error => {
        document.getElementById("pokemonInfo").innerHTML = "<p>Pokemon não encontrado!</p>";
    })
}

