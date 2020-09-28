const express = require('express');
const Alexa = require('ask-sdk-core');
const { ExpressAdapter } = require('ask-sdk-express-adapter');

const app = express();
const port = 3000;
const skillBuilder = Alexa.SkillBuilders.custom();

//add request handlers 
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

const PokemonInfoHandler = {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'pokemon_info';
    },
    handle(handlerInput) {
        const pokemonName =
            handlerInput.requestEnvelope.request.intent.slots.pokemon.value;

        const speechText = "eyo you are askin bout " + pokemonName;
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
}

skillBuilder.addRequestHandlers(
    LaunchRequestHandler,
    HelpHandler,
    PokemonInfoHandler
);

const skill = skillBuilder.create(); 
const adapter = new ExpressAdapter(skill, true, true);

app.post('/',  adapter.getRequestHandlers());

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})