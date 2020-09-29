const Alexa = require('ask-sdk-core');
const express = require('express');
const axios = require('axios');

const { ExpressAdapter } = require('ask-sdk-express-adapter');

const POKEMON_URL_BASE = "https://pokeapi.co/api/v2/pokemon";
const UNKNOWN_POKEMON = "Hmmmm I don't think I'm familiar with that pokemon 👀 could you try again?"
const UNKNOWN_TRAIT_STATMENT = " is something I am not sure about 🤔 ";
const STOP_SKILL= "Closing pokedex... peace out! ✌️";

const app = express();
const port = 3000;
const skillBuilder = Alexa.SkillBuilders.custom();

//common util
const pokemonNameSanitizer = name => {
    return name.replace("'s", "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
}

//Pokemon API utils
//TODO: throw error for invalid pokemon name request
const getPokemonInfo = async (name) => {
    const pokemonInfoUrl = POKEMON_URL_BASE + "/" + name;
    console.log(pokemonInfoUrl);
    return await axios.get(pokemonInfoUrl);
}

const getPokemonTrait = async (name, trait) => {
    const data = await getPokemonInfo(name);
    return getPokemonTraitFromData(data, trait);
}
const getPokemonTraitFromData = (data, trait) => {
    //TODO: expand implementation to return information nested in json return (eg, types)
    return !data.data[trait] ?
     trait + UNKNOWN_TRAIT_STATMENT : trait + " is " + data.data[trait];
}

//Request Handlers  
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = 'Hello, welcome to your pokedex!';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
}

const HelpHandler = {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'Try asking me about a pokemon!';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const StopHandler = {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest' 
        && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent';
    },
    handle(handlerInput) {
      return handlerInput.responseBuilder
        .speak(STOP_SKILL)
        .getResponse();
    },
  };

const PokemonInfoHandler = {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'pokemon_info';
    },
    async handle(handlerInput) {
        const pokemonName =
            pokemonNameSanitizer(handlerInput.requestEnvelope.request.intent.slots.pokemon.value);
        const data = await getPokemonInfo(pokemonName);
        const heightStatement = getPokemonTraitFromData(data, "height");
        const weightStatement = getPokemonTraitFromData(data, "weight");
    
        const speechText = pokemonName + " is a pokemon, whos " 
             + heightStatement + " and " 
             + weightStatement + ". "
             + "What else would you like to know?";
      
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
}

const PokemonTraitHandler = {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'pokemon_trait';
    },
    async handle(handlerInput) {
        const pokemonName =
            pokemonNameSanitizer(handlerInput.requestEnvelope.request.intent.slots.pokemon.value);
        const pokemonTrait =
            handlerInput.requestEnvelope.request.intent.slots.trait.value;
 
        console.log(pokemonTrait);
        console.log(pokemonName);
        const traitStatement = await getPokemonTrait(pokemonName, pokemonTrait);
    
        console.log(traitStatement);

        const speechText = pokemonName + "'s " 
             + traitStatement + ". "
             + "What else would you like to know?";
      
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
}

skillBuilder.addRequestHandlers(
    LaunchRequestHandler,
    HelpHandler,
    StopHandler,
    PokemonInfoHandler,
    PokemonTraitHandler
);

const skill = skillBuilder.create(); 
const adapter = new ExpressAdapter(skill, true, true);

app.post('/',  adapter.getRequestHandlers());

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})