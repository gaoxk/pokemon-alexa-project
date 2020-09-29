//Pokemon utils
const axios = require('axios');

const POKEMON_URL_BASE = "https://pokeapi.co/api/v2/pokemon";
//TODO: Introduce error handling that utilies this
const UNKNOWN_POKEMON = "Hmmmm I don't think I'm familiar with that pokemon 👀 could you try again?"
const UNKNOWN_TRAIT_STATMENT = " is something I am not sure about 🤔 ";

const pokemonNameSanitizer = name => {
    return name.replace("'s", "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
}

//Pokemon API utils
const getPokemonData = async (name) => {
    //TODO: throw error for invalid pokemon name request
    const pokemonInfoUrl = POKEMON_URL_BASE + "/" + name;
    return await axios.get(pokemonInfoUrl);
}

const getPokemonTrait = async (name, trait) => {
    const data = await getPokemonData(name);
    return getPokemonTraitFromData(data, trait);
}
const getPokemonTraitFromData = (data, trait) => {
    //TODO: expand implementation to return information nested in json return (eg, types)
    return !data.data[trait] ?
     trait + UNKNOWN_TRAIT_STATMENT : trait + " is " + data.data[trait];
}

module.exports = {
    pokemonNameSanitizer,
    getPokemonData,
    getPokemonTrait,
    getPokemonTraitFromData
}