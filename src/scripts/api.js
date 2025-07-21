export const API_BASE_URL = 'https://pokeapi.co/api/v2';
export const INITIAL_LOAD_LIMIT = 10;

// Função para buscar dados de um Pokémon
export async function fetchPokemon(query) {
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
        // Retorne as variedades para que a interface decida o que fazer
        return { pokemon, varieties: varietyNames };
    }
    return { pokemon };
}

// Função para buscar detalhes da espécie e evolução
export async function fetchEvolutionDetails(pokemonId) {
    const speciesData = await fetchSpeciesData(pokemonId);
    if (!speciesData.evolution_chain) return [];

    const evolutionData = await fetchData(speciesData.evolution_chain.url);
    return await collectEvolutionDetails(evolutionData.chain);
}

// Função para buscar dados da espécie
export async function fetchSpeciesData(pokemonId) {
    const response = await fetch(`${API_BASE_URL}/pokemon-species/${pokemonId}`);
    if (!response.ok) throw new Error('Detalhes da espécie não encontrados');
    return await response.json();
}

// Função para coletar detalhes da cadeia de evolução
export async function collectEvolutionDetails(chain) {
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

// Função genérica para buscar dados de uma URL
export async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Erro ao buscar dados');
    return await response.json();
}