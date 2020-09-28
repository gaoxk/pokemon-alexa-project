const express = require('express');
const Alexa = require('ask-sdk-core');
const { ExpressAdapter } = require('ask-sdk-express-adapter');

const app = express();
const port = 3000;
const skillBuilder = Alexa.SkillBuilders.custom();

//add request handlers 

const skill = skillBuilder.create(); 
const adapter = new ExpressAdapter(skill, true, true);

app.post('/', adapter.getRequestHandlers());

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})