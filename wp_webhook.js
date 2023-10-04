const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios')

const app = express();
const port = 3629; // Change to the port you prefer

// Parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Define your Close API endpoint and API key
const apiUrl = 'https://api.close.com/api/v1/lead/';
const apiUrl2 = 'https://api.close.com/api/v1/task/';
const apiUrl3 = 'https://api.close.com/api/v1/opportunity/';
const apiKey = 'Basic YXBpXzVwdXdwOTZOUnY2b21SeGFHZ1d4bTcuNm9IdzFVTEVSdWFKY3NZeUdOQUs4Nzo6'; // Replace with your Close API key

 // Set the headers with your API key
 const headers = {
    'Content-Type': 'application/json',
    'Authorization': `${apiKey}`,
};

// Handle POST requests to your webhook endpoint
app.post('/webhook', (req, res) => {
  const data = req.body; // Data submitted to the webhook

  // Process and store the data as needed
  console.log('Received data:', data);
  createLead(data.form.name,data.fields,data.meta);
  // Respond with a success message
  res.status(200).send('Data received successfully.');
});

function createLead2(form,Wdata,meta){
    
    Bname = (Wdata.businessname.value);
    fname = (Wdata.fname.value);
    lname = (Wdata.lname.value);
    email = (Wdata.email.value);
    mobile = (Wdata.mobile.value);
    state = (Wdata.state.value);
    meta2 = (meta.user_agent.value);
  console.log(fname);
  console.log(lname);
  console.log(email);
  console.log(mobile);
  console.log(state);
  console.log(meta2);
  console.log(meta.time.value);
  console.log(meta.date.value);
}
//code to format date
function getDate(){
    const currentTimestamp = Date.now();
    const currentDate = new Date(currentTimestamp);

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');

    let amOrPm = 'am'; // Default to 'am'
    let formattedHours = hours;

    if (currentDate.getHours() >= 12) {
        amOrPm = 'pm';
        if (currentDate.getHours() > 12) {
            formattedHours = String(currentDate.getHours() - 12).padStart(2, '0');
        }
    }

    const formattedDate = `${year}-${month}-${day} at ${formattedHours}:${minutes} ${amOrPm}`;
    console.log(formattedDate);

}

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


async function getUserId(){

    var user = "";

    await axios.get('https://taskassigner.onrender.com/user')
  .then(function (response) {
    // Handle the successful response here
    user = response.data;
    console.log('Data:', user);
  })
  .catch(function (error) {
    // Handle any errors that occurred during the request
    console.error('Error:', error);
  });

  if(user === "Ben Wright"){
    return "user_J1uZtxhtHJLCvg8s51uXRnrStRSirkbBRKA2yLQTaej";
  }
  else if(user === "Nicolas Comin Marques"){
    return "user_V9UwK5PaEsOQUmXcyeoER3kL48BrNC0VSxraZXFffd7";
  }
  else{
    console.log('invalid user');
  }
}


async function createLead(form,Wdata,meta){
    var Fdata = {
        "form":form,
        "Bname":Wdata.businessname.value,
        "fname":Wdata.fname.value,
        "lname":Wdata.lname.value,
        "email":Wdata.email.value,
        "mobile":Wdata.mobile.value,
        "state":Wdata.state.value,
        "meta":meta.user_agent.value,
        "date":meta.date.value,
        "time":meta.time.value
    }

    const emailString = Fdata.email;
    const formattedEmail = sliceStringFromAt(emailString);
    console.log(formattedEmail);

    const phoneString = Fdata.mobile;
    const formattedPhone = addPrefix(phoneString);
    console.log(formattedPhone);
    //create lead
    var leadid = await createlead(Fdata,formattedEmail,formattedPhone);
    console.log(leadid);
    //get user to assign 
    var user = await getUserId();
    //create task
    await createTask(leadid,user,Fdata.date);
    //create Opportunity
    await createOppertunity(Fdata,leadid,user);

}

//create lead
async function createlead(data,url,fPhone){
  
    // Define the lead data you want to create
    var leadData = {
        "name": data.Bname,
        "url": url,
        "description": "",
        "status_id": "stat_J3QKmUJP1rzw3ps9nGrzFZJd5IHOkksGjDVwqa229Fc",
        "contacts": [
            {
                "name": `${data.fname} ${data.lname}`,
                "emails": [
                    {
                        "type": "direct",
                        "email": data.email
                    }
                ],
                "phones": [
                    {
                        "type": "mobile",
                        "phone":fPhone
                    }
                ],
                "url":data.email
            }
        ],
        "addresses": [
            {
                "state": data.state,
                "country":"Australia"
            }
        ],
        "text":`${data.fname} ${data.lname}\n${data.state}\n${data.mobile}\n${data.date}\n${data.time}\n${data.form}\n${data.meta}\n${data.email}`,
        "source":"none"
    };
  var lead = ""
  // Make a POST request to create the lead
  await axios.post(apiUrl, leadData, { headers })
      .then(function (response) {
          // Handle the successful response here
          console.log('Lead created successfully:', response.data);
          lead = response.data.id;
      })
      .catch(function (error) {
          // Handle any errors that occurred during the request
          console.error('Error creating lead:', error);
      });
  
    return lead;
    
}

//create task

async function createTask(leadid,user,date){
    var dateTime = getDate();
    var taskData = {
        "_type": "lead",
        "lead_id": leadid,
        "assigned_to": user,
        "text": "Call: Website Submisssion",
        "due_date":dateTime,
        "is_complete": false
      }
      
          // Make a POST request to create the task
      await axios.post(apiUrl2, taskData, { headers })
      .then(function (response) {
          // Handle the successful response here
          console.log('task created successfully:', response.data);
      })
      .catch(function (error) {
          // Handle any errors that occurred during the request
          console.error('Error creating task:', error);
      });
}

//create Opportunity

async function createOppertunity(data,leadid,user){

    var Oppdata = {
        "note": `${data.fname} ${data.lname}\n${data.state}\n${data.mobile}\n${data.date}\n${data.time}\n${data.form}\n${data.meta}\n${data.email}`,
        "lead_id": leadid,
        "status_id": "stat_OKYGQZDN7o3OQHm7gV272mhqZzSexBR4RAKk2WE1V8r",
        "value": 100,
        "value_period": "one_time",
        "assigned_to":user
      }
      
      // Make a POST request to create opportunity
      await axios.post(apiUrl3, Oppdata, { headers })
          .then(function (response) {
              // Handle the successful response here
              console.log('Oppertunity created successfully:', response.data);
          })
          .catch(function (error) {
              // Handle any errors that occurred during the request
              console.error('Error creating oppertunity:', error);
          });
}



// Start the server
app.listen(port, () => {
  console.log(`Webhook server listening on port ${port}`);
});
