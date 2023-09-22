const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000; // Change to the port you prefer

// Parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Handle POST requests to your webhook endpoint
app.post('/webhook', (req, res) => {
  const data = req.body; // Data submitted to the webhook

  // Process and store the data as needed
  console.log('Received data:', data);

  // Respond with a success message
  res.status(200).send('Data received successfully.');
});

// Start the server
app.listen(port, () => {
  console.log(`Webhook server listening on port ${port}`);
});
