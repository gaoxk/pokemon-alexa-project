# pokemon-alexa-project
Alexa Skill Express server for handling Pokemon related queries 🐈

![alt text](convo.png "Pokemon conversation")

### Improvements 
The current project does _very_ little error catching, and is not graceful in the slightest. 
In particular, there is no error handling on an invalid pokemon being requested. If I had more time, I would 
handle this error gracefully and repromt the user. 

Conversational strings are currently stored in constants littered throughout files. 
I would like to centralize these into a module that would make future language translation efforts possible. 

Finaly, the yes/no's after asking for help are not dependent on the help intent. If a user says yes or no at anytime for no reason, 
the yes message will fire or the skill will exit, even if help was not asked for. 

### To run 
Download and extract code, and run `ndoe app.js`. The server uses port 3000 by default.