// Função para lidar com erros
export function handleError(message) {
    console.error(message);
    alert(message);
}

// Função para capitalizar a primeira letra de uma string
export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}