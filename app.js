//Express app start poin
const Alexa = require('ask-sdk-core');
const express = require('express');
const handlers= require('./handlers')
const { ExpressAdapter } = require('ask-sdk-express-adapter');

const app = express();
const port = 3000;

const skillBuilder = Alexa.SkillBuilders.custom();
skillBuilder.addRequestHandlers(
   handlers.LaunchRequestHandler,
   handlers.HelpHandler,
   handlers.StopNoHandler,
   handlers.YesHandler,
   handlers.PokemonInfoHandler,
   handlers.PokemonTraitHandler
);

const skill = skillBuilder.create(); 
const adapter = new ExpressAdapter(skill, true, true);

app.post('/',  adapter.getRequestHandlers());

app.listen(port, () => {
  console.log(`Pokemon Alexa Skill listening at http://localhost:${port}`)
})