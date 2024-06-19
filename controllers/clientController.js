const Client = require('../models/client.js');
const User = require('../models/user.js');
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

const { sendMail, sendInvoiceMail} = require('./mail');

const getaddClient = (req,res,next)=>{
   res.render('addClient.ejs');
}
const rootDir = require('../utils/path');

async function printPDF(userData) {
    try {
        const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
        const page = await browser.newPage();

        const invoiceTemplatePath = path.join(rootDir, 'public', 'views', 'invoiceTemplate.ejs');
        const html = await ejs.renderFile(invoiceTemplatePath, { user: userData });
        
        await page.setContent(html, { waitUntil: 'load' }); //so that external css sheets work wait until is used
        console.log('HTML content set successfully');

        const pdf = await page.pdf({ format: 'A4', printBackground : true }); // Set a longer timeout
        console.log('PDF generated successfully');

        await browser.close();
        console.log('Browser closed');

        // const pdfPath = path.join(rootDir, 'invoices', `invoice_${userData.invoiceNumber}.pdf`);
        // fs.writeFile(pdfPath, pdf,(data)=>{console.log(data)});
        // console.log(`Invoice PDF saved to: ${pdfPath}`);
        
        return pdf;

    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error; // Rethrow the error to handle it in the calling function
    }
}

const postaddClient = async (req, res, next) => {
    try {
      const userid = req.user.id;
      const { name, email, phone, business, address, city, state, country, zipcode, stuff, subtotal, tax, totalPrice, dateOfIssue } = req.body;
      let stuff1 = JSON.parse(stuff);
      const invoiceNo = Math.floor(Math.random() * Math.floor(Math.random() * Date.now()));
      const newClient = new Client({
        name,
        email,
        phone,
        business,
        address,
        city,
        state,
        country,
        zipcode,
        stuff: stuff1,
        subtotal,
        tax,
        totalPrice,
        userID: userid,
        dateOfIssue,
        invoiceNumber: invoiceNo
      });
      await newClient.save();
  
      const user = await User.findOne({ _id: userid });
      const data = {
        name,
        email,
        phone,
        business,
        address,
        city,
        state,
        country,
        zipcode,
        stuff: stuff1,
        subtotal,
        tax,
        totalPrice,
        userID: userid,
        dateOfIssue,
        invoiceNumber: invoiceNo,
        yourPhone: user.phone,
        yourEmail: user.email,
        yourWebsite: user.website,
        yourAddress: user.address,
        yourCity: user.city,
        yourState: user.state,
        yourCountry: user.country,
        yourZipcode: user.zipcode
      };
      const data2 = await printPDF(data);
      //console.log(data2,"haaaaaaaaaaaaaaaa");
      sendInvoiceMail(data.email,data2,data);
      return res.redirect('/home');
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).send('Internal Server Error');
    }
  };


const getClients =async (req,res,next)=>{
    const userID = req.user.id;
    const clients = await Client.find({userID : userID});
    console.log(clients);
    res.render('getClients.ejs',{clients : clients});
}

// const sendInvoice = async(req,res,next)=>{
//   const clientId = req.body.clientID;
//   const client = Client.findOne({_id : clientId});
//   if(!client){
//    return res.status(404).json({'message' : 'Client does not exist'});
//   }
//   const clientEmail = client.email;
//   const clientInvoice = client.invoiceNumber;

// }



module.exports = { getaddClient,postaddClient,getClients};