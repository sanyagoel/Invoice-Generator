const Client = require("../models/client.js");
const User = require("../models/user.js");
const puppeteer = require("puppeteer");
const ejs = require("ejs");
const path = require("path");
const rootDir = require("../utils/path");
const fs = require("fs");
const { validationResult } = require("express-validator");
const { sendMail, sendInvoiceMail } = require("./mail");
const TOTAL_ITEMS_PERPAGE = 3;

const getaddClient = (req, res, next) => {
  res.render("addClient.ejs", {
    errors: [],
    oldOutput: {
      oldName: "",
      oldEmail: "",
      oldPhone: "",
      oldBusiness: "",
      oldAddress: "",
      oldCity: "",
      oldState: "",
      oldCountry: "",
      oldZipcode: "",
      oldStuff: [],
      oldSubtotal: "",
      oldTax: "",
      olddof: "",
    },
    errorMessage: "",
  });
};

async function printPDF(userData) {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();

    const invoiceTemplatePath = path.join(
      rootDir,
      "public",
      "views",
      "invoiceTemplate.ejs"
    );
    const html = await ejs.renderFile(invoiceTemplatePath, { user: userData });

    await page.setContent(html, { waitUntil: "load" }); //so that external css sheets work wait until is used
    console.log("HTML content set successfully");

    const pdf = await page.pdf({ format: "A4", printBackground: true }); // Set a longer timeout
    console.log("PDF generated successfully");

    await browser.close();
    console.log("Browser closed");

    const pdfPath = path.join(
      rootDir,
      "invoices",
      `invoice_${userData.invoiceNumber}.pdf`
    );
    fs.writeFile(pdfPath, pdf, (data) => {
      console.log(data);
    });
    console.log(`Invoice PDF saved to: ${pdfPath}`);

    return pdf;
  } catch (error) {
    console.error("Error generating PDF:", error);
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
}

const postaddClient = async (req, res, next) => {
  try {
    const userid = req.session.user._id;
    const {
      name,
      email,
      phone,
      business,
      address,
      city,
      state,
      country,
      zipcode,
      stuff,
      subtotal,
      tax,
      totalPrice,
      dateOfIssue,
    } = req.body;
    const result = validationResult(req);
    const errors = result.array();
    console.log(errors);
    //throw new Error('dummy');
    if (!result.isEmpty()) {
      return res.render("addClient.ejs", {
        errors: errors,
        oldOutput: {
          oldName: name,
          oldEmail: email,
          oldPhone: phone,
          oldBusiness: business,
          oldAddress: address,
          oldCity: city,
          oldState: state,
          oldCountry: country,
          oldZipcode: zipcode,
          oldStuff: JSON.parse(stuff),
          oldSubtotal: subtotal,
          oldTax: tax,
          olddof: dateOfIssue,
        },
        errorMessage: errors[0].msg,
      });
    }
    let stuff1 = JSON.parse(stuff);
    const invoiceNo = Math.floor(
      Math.random() * Math.floor(Math.random() * Date.now())
    );
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
      invoiceNumber: invoiceNo,
    });
    await newClient.save();
    console.log("before data", invoiceNo);
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
      yourZipcode: user.zipcode,
    };
    console.log("after data", invoiceNo);
    const data2 = await printPDF(data);
    // newClient.pdf = data2;
    // await newClient.save();
    //console.log(data2,"haaaaaaaaaaaaaaaa");
    sendInvoiceMail(data.email, data2, data);
    return res.redirect("/home");
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};

const getClients = async (req, res, next) => {
  const curpage = req.query.page || 1;
  const userID = req.session.user._id;
  //console.log(userID);
  const total_products = await Client.countDocuments({ userID: userID });
  const totalPages = Math.ceil(total_products / TOTAL_ITEMS_PERPAGE);
  const clients = await Client.find({ userID: userID })
    .skip((curpage - 1) * TOTAL_ITEMS_PERPAGE)
    .limit(TOTAL_ITEMS_PERPAGE);
  //console.log(clients);
  res.render("getClients.ejs", {
    clients: clients,
    curpage: curpage,
    totalPages: totalPages,
  });
};

// const sendInvoice = async(req,res,next)=>{
//   const clientId = req.body.clientID;
//   const client = Client.findOne({_id : clientId});
//   if(!client){
//    return res.status(404).json({'message' : 'Client does not exist'});
//   }
//   const clientEmail = client.email;
//   const clientInvoice = client.invoiceNumber;

// }

const downloadpdf = async (req, res, next) => {
  try {
    const clientID = req.body.clientID;
    const client = await Client.findById(clientID);
    console.log(client);
    const pdfname = `invoice_${client.invoiceNumber}.pdf`;
    const pdfPath = path.join(rootDir, "invoices", pdfname);

    // fs.readFile(pdfPath,(err,data)=>{
    //   if(err){
    //     return next(err);
    //   }
    //   res.setHeader('Content-Type', 'application/pdf');
    //   return res.send(data);
    // })

    const file = fs.createReadStream(pdfPath);
    res.setHeader("Content-Type", "application/pdf");
    file.pipe(res);
  } catch (err) {
    return next(err);
  }
};

const deleteClientinfo = async (req, res, next) => {
  try {
    const clientID = req.params.clientID;
    const userID = req.session.user._id;

    const client = await Client.find({ userID: userID, _id: clientID });
    if (!client) {
      return res.status(500).json({ message: "Client does not exist" });
    }
    const result = await Client.deleteOne({ _id: clientID, userID: userID });
    if (result) {
      return res.status(200).json({ message: "SUCCESFULLY DESTROYED" });
    }
  } catch (err) {
    return res.status(500).json({ message: "failed in deleting client" });
  }
};

module.exports = {
  getaddClient,
  postaddClient,
  getClients,
  downloadpdf,
  deleteClientinfo,
};
