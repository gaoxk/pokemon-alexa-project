const Alexa = require('ask-sdk-core');
const express = require('express');
const pokemonUtil = require('./pokemon')

const { ExpressAdapter } = require('ask-sdk-express-adapter');

const LAUNCH_INTENT_MSG = "Hello! Welcome to your pokedex 🐼"
const HELP_INTENT_MSG = "Ask me anything about pokemon! For example, 'what is pikachu's height?' Would you like to continue? (yes/no)";
const STOP_INTENT_MSG = "Closing pokedex... peace out! ✌️";
const YES_INTENT_MSG = "Yay! ask me more about pokemon!!👺" ;

const app = express();
const port = 3000;
const skillBuilder = Alexa.SkillBuilders.custom();

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
            pokemonUtil.pokemonNameSanitizer(handlerInput.requestEnvelope.request.intent.slots.pokemon.value);
        const data = await pokemonUtil.getPokemonData(pokemonName);
        const heightStatement = pokemonUtil.getPokemonTraitFromData(data, "height");
        const weightStatement = pokemonUtil.getPokemonTraitFromData(data, "weight");
    
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
            pokemonUtil.pokemonNameSanitizer(handlerInput.requestEnvelope.request.intent.slots.pokemon.value);
        const pokemonTrait =
            handlerInput.requestEnvelope.request.intent.slots.trait.value;
 
        const traitStatement = await pokemonUtil.getPokemonTrait(pokemonName, pokemonTrait);
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