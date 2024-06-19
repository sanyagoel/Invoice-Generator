
const express = require('express');
const router = express.Router();
const {createAccount, logAccount ,getHome,create,log,getUserDetails,postUserDetails} = require('../controllers/userController');
const {auth} = require('../controllers/authController');
const {getaddClient,postaddClient,getClients, sendInvoice} = require('../controllers/clientController');

router.get('/home',auth,getHome);

router.get('/log',log);

router.get('/',create);

router.post('/register',createAccount);

router.post('/login', logAccount);

router.get('/addClient',auth,getaddClient);

router.post('/addClient',auth,postaddClient);

router.get('/updateDetails',auth,getUserDetails);

router.post('/updateDetails',auth,postUserDetails);

router.get('/getClients',auth,getClients);

//router.post('/sendInvoice',auth,sendInvoice);

module.exports = router;

