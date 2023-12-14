
# GENIE VIRTUAL ASSISTANT USING JAVASCRIPT
Javascript based Virtual Assistant and interface is made using HTML and CSS.

Inspired by Siri, the Google Assistant and Alexa, Inertia responses according to user commands. User can give voice command and if that command matches the syntax then desired output is given but if not then it searches the user response on web and returns the same. The response is prodided in the form of speech.

# Features

- It trigger a voice command given by user and return a voice response
- Date / Time
- Opening Apps
- Searching Web

# commands

- hi / hello / hey / how are you / whats up
- open google / open instagram / open youtube
- what is / what are / who is / who are + < your query >
- wikipedia + < your query >
- time / date
- open calculator






function startWakeUpCommand() {
    const wakeUpPhrase = 'GENIE'; 
    const userResponse = prompt('Please say "GENIE" to activate voice commands.');

    if (userResponse && userResponse.toLowerCase() === wakeUpPhrase.toLowerCase()) {
        speak('Activating GENIE');
        recognitionActive = true;
        startRecognition();
    } else {
        alert('Invalid wake-up phrase. Please try again.');
    }
}