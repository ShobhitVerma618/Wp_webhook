const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios')

const app = express();
const port = 3620; // Change to the port you prefer

// Parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Handle POST requests to your webhook endpoint
app.post('/webhook', (req, res) => {
  const data = req.body; // Data submitted to the webhook

  // Process and store the data as needed
  console.log('Received data:', data);
  createLead(data.fields,data.meta);
  // Respond with a success message
  res.status(200).send('Data received successfully.');
});


//code to format email

function sliceStringFromAt(string) {
  const index = string.indexOf("@");
  if (index !== -1) {
      const slicedString = string.slice(index + 1);
      return slicedString;
  } else {
      return "";
  }
}

//code to format phone number

function addPrefix(string) {
  let digits = "";
  let foundDigit = false;

  for (let char of string) {
      if (char.match(/[0-9]/)) {
          if (char !== "0" || foundDigit) {
              digits += char;
              foundDigit = true;
          }
      } else if (digits) {
          break;
      }
  }

  if (digits) {
      const result = "+61" + digits;
      return result;
  } else {
      return "";
  }
}

function createLead(Wdata,meta){
    console.log(Wdata.businessname.value);
    console.log(Wdata.fname.value);
    console.log(Wdata.lname.value);
    console.log(Wdata.email.value);
    console.log(Wdata.mobile.value);
    console.log(Wdata.state.value);
    console.log(meta.value);

    const emailString = Wdata['Email'];
    const formattedEmail = sliceStringFromAt(emailString);
    console.log(formattedEmail);

    const phoneString = Wdata['Mobile'];
    const formattedPhone = addPrefix(phoneString);
    console.log(formattedPhone);

}



// Start the server
app.listen(port, () => {
  console.log(`Webhook server listening on port ${port}`);
});
