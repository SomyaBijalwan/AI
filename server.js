const express = require('express');
const app = express();
const port = 5502;

app.use(express.json());

app.post('/log', (req, res) => {
    const message = req.body.message;
    console.log(message);
    res.json({ status: 'success' });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});


function logToTerminal(message) {
    fetch('http://localhost:5502/log', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.status);
    })
    .catch(error => {
        console.error('Error logging to terminal:', error);
    });
}


