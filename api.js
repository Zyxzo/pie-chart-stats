// Define the data to send
const postdata = {
    'auth_token': '09650371-b367-428a-8fb1-37df1f62c440',
    'child_api_id': 'infoskjerm'
};

// Define the API endpoint to your local proxy server
const apiEndpoint = 'https://aat-api.altifiber.no/api/portal/?infoskjerm'; // Update this line

// Function to make the POST request
async function sendData() {
    try {
        const response = await fetch(apiEndpoint, {
            method: 'POST', // Specify the request method
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(postdata) 
        });

        // Check if the request was successful
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        // Parse and handle the JSON response
        const data = await response.json();
        console.log('Response from the server:', data);
        
        // Example of displaying data on the page
        document.getElementById('output').innerText = JSON.stringify(data, null, 2); // Display JSON response in a preformatted way
    } catch (error) {
        console.error('Error:', error);
    }
}


sendData();
