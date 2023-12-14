const content = document.querySelector('.content');
const SpeechRecognition = window.speechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
const greetings = ['Hello sir', 'Hi master'];
let speech;
let logData = '';
let accumulateLogs = true; // Flag to accumulate logs



// Function to log messages to console and save to logData
function logAndSave(message) {
    console.log(message);
    logData += message + '\n';
    if (!accumulateLogs) {
        downloadLogs(); 
    }
}

window.addEventListener("load", function () {
    setTimeout(() => {
    }, 1000);

    speak('Activating GENIE');
    wishMe();
    startRecognition();
    updateDateTime();
});

function updateDateTime() {
    const date = new Date().toLocaleString(undefined, { month: "short", day: "numeric" });
    document.getElementById("CurDate").innerHTML = date;

    const time = new Date().toLocaleString(undefined, { hour: "numeric", minute: "numeric" });
    document.getElementById("CurTime").innerHTML = time;
}

recognition.onresult = async (event) => {
    const current = event.resultIndex;
    const transcript = event.results[current][0].transcript.toLowerCase();
    content.textContent = transcript;
    const { isWakeUpCommand, query } = checkWakeUpCommand(transcript);
    
    if (isWakeUpCommand) {
        speakThis(query);}

    //      // Example usage of OpenAI API within your existing code
    // const conversation = [
    //     { role: 'system', content: 'You are a helpful assistant.' },
    //     { role: 'user', content: transcript },
    // ];

    // try {
    //     const openaiResponse = await generateOpenAIResponse(conversation);
    //     console.log('OpenAI Response:', openaiResponse);
    //     speak(openaiResponse);
    // } catch (error) {
    //     console.error('Error:', error);
    //     speak("I encountered an error while processing your request.");
    // }

// Check if the user's command is a "who" or "what" query for Wikipedia
const searchWikipediaPattern = /\b(who|what)\s(.+)\b/i;
const searchMatch = transcript.match(searchWikipediaPattern);

if (searchMatch) {
    // Extract the search query from the matched pattern
    const searchQuery = searchMatch[2].trim();

    try {
        // Perform a Wikipedia search
        const wikipediaExtract = await searchWikipedia(searchQuery);

        if (wikipediaExtract) {
            // Speak the Wikipedia extract
            speak(wikipediaExtract);
        } else {
            console.warn(`Wikipedia API response is empty for the query: ${searchQuery}`);
            speak(`Sorry, I couldn't find information about ${searchQuery} on Wikipedia.`);
        }
    } catch (error) {
        console.error('Error searching Wikipedia:', error);
        speak("I encountered an error while searching Wikipedia.");
    }




    } else if (transcript.includes('search for')) {
        // Extract the search query following the command "search for"
        const searchQuery = transcript.replace('search for', '').trim();
        try {
            const searchResults = await searchGoogle(searchQuery);
            if (searchResults && searchResults.items && searchResults.items.length > 0) {
                const topResult = searchResults.items[0].snippet;
                speak(topResult);
            } else {
                speak(`Sorry, I couldn't find anything related to ${searchQuery}.`);
            }
        } catch (error) {
            console.error('Error searching Google:', error);
            speak("I encountered an error while searching.");
        }
    } else {
        if (transcript.includes('download logs')) {
            downloadLogs();
            speak("Logs downloaded.");

        } else {
            // Check if the user's command is a question and query Wolfram Alpha
            if (checkQuestion(transcript)) {
                try {
                    const wolframResult = await queryWolframAlpha(transcript);
                    speak(wolframResult);
                } catch (error) {
                    console.error('Error querying Wolfram Alpha:', error);
                    speak("I encountered an error while querying Wolfram Alpha.");
                
                }
            }else {
            speak("I'm waiting for your command. Say 'GENIE' to activate voice commands.");

            console.log('User said:', transcript);
            logAndSave('User said: ' + transcript);

            startRecognition();
        }}
    }
};

function startRecognition() {
    recognition.start();
}


// Function to download logs
function downloadLogs() {
    accumulateLogs = false; // Stop accumulating logs
    const allLogs = localStorage.getItem('userCommands') || '';
    const blob = new Blob([allLogs + '\n' + logData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'voice_commands_log.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    accumulateLogs = true; // Resume accumulating logs
}

async function speakThis(message) {
    logAndSave('System Voice Command: ' + message);
    speech = new SpeechSynthesisUtterance();
    speech.text = '';

    if (checkGreeting(message)) {
        const finalText = getRandomGreeting();
        speech.text = finalText;
        logAndSave('Final Text (System): ' + finalText);
    } else if (checkQuestion(message)) {
        handleQuestion(message);
``
    } else {
        handleDefault(message);
    }

    logAndSave('Speech Text (System): ' + speech.text);
    setTimeout(startRecognition, 100);
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
}


function checkWakeUpCommand(message) {
    const wakeUpPhrases = ['genie', 'geni', 'jinny', 'jeanie', 'geeni', 'ginny', 'jenie', 'jinny', 'jeannie', 'jini', 'jenny'];

    for (const phrase of wakeUpPhrases) {
        if (message.includes(phrase)) {
            // Extract the query following the wake-up command
            const query = message.replace(phrase, '').trim();
            return { isWakeUpCommand: true, query: query };
        }
    }

    return { isWakeUpCommand: false, query: message };
}

function checkGreeting(message) {
    return message.includes('hi') || message.includes('hello') || message.includes('hii') || message.includes('hey');
}

function getRandomGreeting() {
    return greetings[Math.floor(Math.random() * greetings.length)];
}

function checkQuestion(message) {
    return message.includes('how are you') || message.includes('whats up') || message.includes('name') || message.includes('time') || message.includes('date');
}

function handleQuestion(message) {
    if (message.includes('how are you') || message.includes('whats up')) {
        speak('I am fine sir. Tell me how can I help you');
    } else if (message.includes('name')) {
        speak('My name is GENIE');
    } else if (message.includes('time')) {
        const time = new Date().toLocaleString(undefined, { hour: "numeric", minute: "numeric" });
        speak(`The current time is ${time}`);
    } else if (message.includes('date')) {
        const date = new Date().toLocaleString(undefined, { month: "short", day: "numeric" });
        speak(`Today's date is ${date}`);
    } else {
        // Handle other types of questions or provide a default response
        speak("I'm not sure how to answer that question. Is there something else you'd like to know?");
    }
}

async function handleDefault(message) {

    if (checkGreeting(message)) {
        const finalText = greetings[Math.floor(Math.random() * greetings.length)];
        speak(finalText);
    } else if (checkQuestion(message)) {
        handleQuestion(message);
    } else if (message.includes('open google')) {
        openUrl(`http://google.com`,'Opening Google');
    } else if (message.includes('open instagram')) {
        openUrl('http://instagram.com', 'opening instagram');
    } else if (message.includes('open youtube')) {
        openUrl('http://youtube.com', 'opening youtube');
    } else if (message.includes('play') || message.includes('song') || message.includes('video')) {
        const songQuery = message.replace(/play\s(song|music)/, '').trim();
        playMusicFromYouTube(songQuery);
        speech.text = `Playing songs related to ${songQuery} on YouTube`;
    } else if (message.includes('wikipedia')) {
        openUrl(`https://en.wikipedia.org/wiki/${message.replace("wikipedia", "")}`, `showing result for ${message.replace("wikipedia", "")} on wikipedia`);
    } else if (message.includes('time')) {
        const time = new Date().toLocaleString(undefined, { hour: "numeric", minute: "numeric" });
        speak(time);
    } else if (message.includes('date')) {
        const date = new Date().toLocaleString(undefined, { month: "short", day: "numeric" });
        speak(date);
    } else if (message.includes('open calculator') || message.includes('calculate')) {
        openUrl('Calculator:///', 'opening calculator');
    } else {
        try {
            speak("Searching Google. Please wait.");
            const searchResults = await searchGoogle(message);
            const resultText = searchResults.items[0].snippet; // Extract the snippet from the first result
            speak(resultText);
        } catch (error) {
            console.error('Error searching Google:', error);
            speak("I encountered an error while searching Google.");
        }
    }
      

    setTimeout(startRecognition, 1);
}


async function queryWolframAlpha(query) {
    const apiKey = '9YRARV-G5XW6RG9AY';

    const apiUrl = `https://api.wolframalpha.com/v2/query?input=${encodeURIComponent(query)}&format=plaintext&output=JSON&appid=${apiKey}`;
    console.log('Wolfram Alpha API Response:', data);


    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
    
        // Process the response data
        if (data.queryresult.success) {
            const result = data.queryresult.pods.map(pod => pod.subpods[0].plaintext).join('\n');
            console.log('Wolfram Alpha API Response:', result);
            // Do something with the result
        } else {
            throw new Error('Wolfram Alpha API query failed.');
        }
    } catch (error) {
        console.error('Error querying Wolfram Alpha API:', error);
        // Handle errors
    }
}    


async function searchWikipedia(query) {
    const apiUrl = `http://localhost:5502/searchWikipedia/${encodeURIComponent(query)}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const pageId = Object.keys(data.query.pages)[0];
        const extract = data.query.pages[pageId].extract;

        return extract; // Return Wikipedia extract
    } catch (error) {
        console.error('Error searching Wikipedia:', error);
        throw error;
    }
}


async function searchGoogle(query) {
    const apiKey = 'AIzaSyC0c5Gu5gkYPLjL-ow8ZaIJQDt_bsPQQLE';
    const cx = 'f4911e6a8ff5846d8'; //Search Engine ID
    const apiUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${apiKey}&cx=${cx}`;
   
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Google Search API Response:', data);

        const searchResults = data.items;
        if (searchResults && searchResults.length > 0) {
            const resultText = searchResults.slice(0, 5).map(item => {
                const title = item.title;
                const snippet = item.snippet;
                const link = item.link;
                return `${title}: ${snippet}\n${link}`;
            }).join('\n\n');

            speak(resultText);
        } else {
            speak(`Sorry, I couldn't find anything related to ${query}.`);
        }

        return data;
    } catch (error) {
        console.error('Error searching Google:', error);
        speak("I encountered an error while searching Google.");
        throw error;
    }
}

function openUrl(url, finalText) {
    window.open(url, "_blank");
    speech.text = finalText;
}

function playMusicFromYouTube(query) {
    const apiKey = 'AIzaSyABv1v79RnrPsHLueD76ZKvIfBhzk33vpk'; 
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?q=${encodeURIComponent(query)}&part=snippet&maxResults=1&type=video&key=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                const videoId = data.items[0].id.videoId;
                const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
                window.open(youtubeUrl, '_blank');
            } else {
                speech.text = `Sorry, I couldn't find any songs related to ${query} on YouTube.`;
                window.speechSynthesis.speak(speech);
            }
        })
        .catch(error => {
            console.error('Error fetching data from YouTube API', error);
        });
}

// // Replace 'YOUR_OPENAI_API_KEY' with your actual OpenAI API key
// const openaiApiKey = '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';

// // Function to generate a response from OpenAI
// async function generateOpenAIResponse(messages) {
//     const openaiEndpoint = 'https://api.openai.com/v1/engines/gpt-3.5-turbo/completions';

//     const headers = {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${openaiApiKey}`,
//     };

//     const data = JSON.stringify({
//         model: 'gpt-3.5-turbo',
//         messages: messages,
//     });

//     try {
//         const response = await fetch(openaiEndpoint, {
//             method: 'POST',
//             headers: headers,
//             body: data,
//         });
    
//         if (!response.ok) {
//             console.error('OpenAI API Error: HTTP error! Status:', response.status);
//             console.error('OpenAI API Response:', await response.text());
//             throw new Error('HTTP error! Status: ' + response.status);
//         }
    
//         const responseData = await response.json();
//         const generatedText = responseData.choices[0].message.content;
    
//         return generatedText;
//     } catch (error) {
//         console.error('Error generating response from OpenAI API:', error);
//         throw error;
//     }
    
// }

function speak(message) {
    logAndSave('System Voice Command: ' + message);
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 1;
    utterance.pitch = 1;

    logAndSave('System Voice Response: ' + message);
    
    window.speechSynthesis.speak(utterance);
}

function wishMe() {
    const hr = new Date().getHours();
    if (hr >= 0 && hr < 12) {
        speak('Good Morning sir');
    } else if (hr === 12) {
        speak('Good Noon sir');
    } else if (hr >= 12 && hr <= 17) {
        speak('Good Afternoon sir');
    } else {
        speak('Good Evening sir');
    }
}






////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
