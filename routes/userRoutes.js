
const express = require('express');
const router = express.Router();
const {createAccount, logAccount ,getHome,create,log,getUserDetails,postUserDetails,logOut,resetPassword, getresetPassword,reset,postreset} = require('../controllers/userController');
const {auth} = require('../controllers/authController');
const {getaddClient,postaddClient,getClients, sendInvoice} = require('../controllers/clientController');
const {check,body} = require('express-validator');
const User = require('../models/user');
router.get('/home',auth,getHome);

router.get('/log',log);

router.get('/',create);

router.post('/register',check('email').isEmail().normalizeEmail().withMessage('The Email You Entered Is Not Valid :(').custom(async (value, {req})=>{

    const user = await User.findOne({ email: value });
    if (user) {
        throw new Error('Email Already exists, choose different one');
    } 

}),check('name').custom((value)=>{
    if(value==='San'){
        throw new Error('This name is banned');
    }
    return true;
}),body('password','Please enter a valid password, max allowed 8, with no special characters :)').isLength({min : 5 , max : 8}).isAlphanumeric().trim(),body('phone','Invalid Phone Number. It should be 10 digits.').isLength({min :  10, max : 10}),createAccount);

router.post('/login',check('email').isEmail().withMessage('The email is not valid, please try again.').custom(async (value,{req})=>{
    const user = await User.findOne({ email: value });
    if (!user) {
        throw new Error('No Account exists with this email -_-');
      } 
}),check('password').trim(), logAccount);

router.get('/addClient',auth,getaddClient);
//name, email, phone, business, address, city, state, country, zipcode, stuff, subtotal, tax, totalPrice, dateOfIssue
router.post('/addClient',auth,[check('email','Please enter valid Email.').isEmail().trim(),body('phone','Phone Number should be 10 digits only.').isLength({min : 10, max : 10}),body('address','Address should be within 10-100 characters only. :)').isLength({max : 100 , min : 10}).trim()],postaddClient);

router.get('/updateDetails',auth,getUserDetails);

router.post('/updateDetails',auth,postUserDetails);

router.get('/getClients',auth,getClients);

router.get('/logout',logOut);

//router.post('/sendInvoice',auth,sendInvoice);

router.get('/resetPassword/:token',getresetPassword);

router.post('/resetPassword',resetPassword);

router.get('/reset',reset);

router.post('/reset',postreset);

module.exports = router;

