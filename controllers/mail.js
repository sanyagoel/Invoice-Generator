require("dotenv").config();

const nodemailer = require('nodemailer');
const { google } = require('googleapis');



const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';


const oauth2client = new google.auth.OAuth2(CLIENT_ID,CLIENT_SECRET,REDIRECT_URI);
oauth2client.setCredentials({refresh_token : REFRESH_TOKEN});

async function sendMail(useremail){
    try{
        const accessToken = oauth2client.getAccessToken();
        const transport = nodemailer.createTransport({
            service : 'gmail',
            auth : {
                type : 'OAuth2',
                user : 'invoicegen1989@gmail.com',
                clientId : CLIENT_ID,
                clientSecret : CLIENT_SECRET,
                refreshToken : REFRESH_TOKEN,
                accessToken : accessToken

            }
        })
        const mailOptions = {
            from : 'INVOICEGEN <invoicegen1989@gmail.com>',
            to : useremail,
            subject : 'New Account Created!',
            text : 'Welcome to Invoice Generator! ',
            html : '<h1>Welcome to Invoice Generator!</h1>'

        };
        const result = await transport.sendMail(mailOptions);
        return result;

    }catch(err){
        console.log(err);
    }
}

async function sendInvoiceMail(useremail,attachment,data){
    try{
        const accessToken = oauth2client.getAccessToken();
        const transport = nodemailer.createTransport({
            service : 'gmail',
            auth : {
                type : 'OAuth2',
                user : 'invoicegen1989@gmail.com',
                clientId : CLIENT_ID,
                clientSecret : CLIENT_SECRET,
                refreshToken : REFRESH_TOKEN,
                accessToken : accessToken

            }
        })
        const mailOptions = {
            from : 'INVOICEGEN <3 <invoicegen1989@gmail.com>',
            to : useremail,
            subject : `Invoice From ${data.yourWebsite}`,
            text : 'Welcome to Invoice Generator! ',
            html : `<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.6;
        }
        .container {
            width: 100%;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .header {
            background-color: #ff5733;
            color: white;
            padding: 10px 20px;
            text-align: center;
        }
        .content {
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            margin-top: 20px;
        }
        .content h1 {
            color: #ff5733;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #666;
        }
        .footer p {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Invoice from ${data.yourWebsite}</h1>
        </div>
        <div class="content">
            <h1>Hello ${data.name},</h1>
            <p>Thank you for your business! Please find attached the invoice for the services provided.</p>
            <p>If you have any questions or need further assistance, feel free to reach out to us at ${data.yourEmail}.</p>
            <p>We appreciate your prompt payment and look forward to serving you again.</p>
            <p>Best regards,</p>
            <p><strong>${data.yourWebsite} Team</strong></p>
        </div>
        <div class="footer">
            <p><strong>Contact Us:</strong></p>
            <p>Email: ${data.yourEmail}</p>
            <p>Phone: ${data.yourPhone}</p>
            <p>Website: ${data.yourWebsite}</p>
            <p>Address: ${data.yourAddress}, ${data.yourCity}, ${data.yourState}, ${data.yourCountry} - ${data.yourZipcode}</p>
        </div>
    </div>
</body>
</html>`,
            attachments :[{filename: `invoice_${data.invoiceNumber}.pdf`,
                content: attachment,
                contentType: 'application/pdf'
            }]
        };
        const result = await transport.sendMail(mailOptions);
        return result;

    }catch(err){
        console.log(err);
    }
}

module.exports = {sendMail,sendInvoiceMail};

