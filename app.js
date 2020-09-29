const Alexa = require('ask-sdk-core');
const express = require('express');
const axios = require('axios');

const { ExpressAdapter } = require('ask-sdk-express-adapter');

const POKEMON_URL_BASE = "https://pokeapi.co/api/v2/pokemon";

const UNKNOWN_POKEMON = "Hmmmm I don't think I'm familiar with that pokemon 👀 could you try again?"
const UNKNOWN_TRAIT_STATMENT = " is something I am not sure about 🤔 ";

const LAUNCH_INTENT_MSG = "Hello! Welcome to your pokedex 🐼"
const HELP_INTENT_MSG = "Ask me anything about pokemon! For example, 'what is pikachu's height?' Would you like to continue? (yes/no)";
const STOP_INTENT_MSG = "Closing pokedex... peace out! ✌️";
const YES_INTENT_MSG = "Yay! ask me more about pokemon!!👺" ;

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
        return handlerInput.responseBuilder
            .speak(LAUNCH_INTENT_MSG)
            .reprompt(LAUNCH_INTENT_MSG)
            .getResponse();
    }
}

const HelpHandler = {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(HELP_INTENT_MSG)
            .reprompt(HELP_INTENT_MSG)
            .getResponse();
    }
};

const StopNoHandler = {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest' 
        && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent');
    },
    handle(handlerInput) {
      return handlerInput.responseBuilder
        .speak(STOP_INTENT_MSG)
        .getResponse();
    },
};

const YesHandler = {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest' 
        && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent';
    },
    handle(handlerInput) {
      return handlerInput.responseBuilder
        .speak(YES_INTENT_MSG)
        .reprompt(YES_INTENT_MSG)
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
 
        const traitStatement = await getPokemonTrait(pokemonName, pokemonTrait);
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
    StopNoHandler,
    YesHandler,
    PokemonInfoHandler,
    PokemonTraitHandler
);

const skill = skillBuilder.create(); 
const adapter = new ExpressAdapter(skill, true, true);

app.post('/',  adapter.getRequestHandlers());

app.listen(port, () => {
  console.log(`Pokemon Alexa Skill listening at http://localhost:${port}`)
})