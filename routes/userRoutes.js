
const express = require('express');
const router = express.Router();
const {createAccount, logAccount ,getHome,create,log,getUserDetails,postUserDetails,logOut,resetPassword, getresetPassword,reset,postreset,getAboutUs} = require('../controllers/userController');
const {auth} = require('../controllers/authController');
const {getaddClient,postaddClient,getClients, downloadpdf} = require('../controllers/clientController');
const {check,body} = require('express-validator');
const User = require('../models/user');
const multer = require('multer');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'images/')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now(); //+ '-' + Math.round(Math.random() * 1E9)
      cb(null,  uniqueSuffix + '-' + file.originalname )
    }
  })

const uploadImage = multer({storage : storage, fileFilter : function(req,file,cb){
    if(file.mimetype==='image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
      cb(null,true);
    }
    else{
      cb(null,false);
    }
  }});


router.get('/home',auth,getHome);

router.get('/log',log);

router.get('/',create);

router.post('/register',check('email').isEmail().withMessage('The Email You Entered Is Not Valid :(').custom(async (value, {req})=>{

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

router.post('/updateDetails',auth,uploadImage.single('image'),postUserDetails);

router.get('/getClients',auth,getClients);

router.get('/logout',logOut);

//router.post('/sendInvoice',auth,sendInvoice);

router.get('/resetPassword/:token',getresetPassword);

router.post('/resetPassword',resetPassword);

router.get('/reset',reset);

router.post('/reset',check('mail').isEmail().withMessage('The email is not valid.'),postreset);

router.get('/AboutUs',getAboutUs);

router.post('/download-pdf',auth,downloadpdf);

module.exports = router;

