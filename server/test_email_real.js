const SibApiV3Sdk = require('sib-api-v3-sdk');
const dotenv = require('dotenv');
dotenv.config();

const defaultClient = SibApiV3Sdk.ApiClient.instance;
// Use the 'api-key' authentication
let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

// ... rest of the file ...

const testEmail = 'abdulbasitmoshood6@gmail.com'; // Sending to self for test

sendSmtpEmail.subject = "CRITICAL TEST - Bashcare Hub";
sendSmtpEmail.htmlContent = "<html><body><h1>If you see this, Brevo is working!</h1></body></html>";
sendSmtpEmail.sender = { "name": "Bashcare Test", "email": process.env.SENDER_EMAIL };
sendSmtpEmail.to = [{ "email": testEmail }];

console.log('Attempting to send test email to:', testEmail);
console.log('Using Sender:', process.env.SENDER_EMAIL);

apiInstance.sendTransacEmail(sendSmtpEmail)
  .then(data => {
    console.log('SUCCESS! Email sent.');
    console.log('Response:', JSON.stringify(data));
  })
  .catch(error => {
    console.error('FAILURE! Email not sent.');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Body:', JSON.stringify(error.response.body));
    } else {
      console.error('Error:', error.message);
    }
  });
