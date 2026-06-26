const SibApiV3Sdk = require('sib-api-v3-sdk');
const dotenv = require('dotenv');
dotenv.config();

// Create a FRESH client instance
const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY.trim();

console.log('API Key from .env (first 10 chars):', process.env.BREVO_API_KEY.substring(0, 10));
console.log('API Key from client (first 10 chars):', apiKey.apiKey.substring(0, 10));

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

sendSmtpEmail.subject = "BASHCARE DEBUG - Test";
sendSmtpEmail.htmlContent = "<html><body><h1>Debug Test</h1></body></html>";
sendSmtpEmail.sender = { "name": "Bashcare Hub", "email": "abdulbasitmoshood6@gmail.com" };
sendSmtpEmail.to = [{ "email": "abdulbasitmoshood6@gmail.com" }];

apiInstance.sendTransacEmail(sendSmtpEmail)
  .then(data => console.log('SUCCESS:', data))
  .catch(error => {
    console.error('FAILED');
    if (error.response) {
        console.error('Response Code:', error.response.status);
        console.error('Response Body:', JSON.stringify(error.response.body));
    } else {
        console.error('Error:', error.message);
    }
  });
