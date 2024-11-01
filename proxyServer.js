const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Require CORS

const app = express();
const port = 3002;

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON requests

// Define the proxy route
app.post('/proxy', async (req, res) => {
    try {
        const response = await axios.post('https://aat-api.altifiber.no/api/portal/?infoskjerm', req.body, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        res.json(response.data); // Send back the response data from the external API
    } catch (error) {
        console.error(error);
        res.status(500).send('Error occurred while fetching data');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Proxy server running at http://localhost:${port}`);
});
