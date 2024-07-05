const User = require("../models/user");
const bcrypt = require("bcrypt");
const crypto = require('crypto');
const {validationResult} = require('express-validator');
// var redis = require('redis');
// var JWTR =  require('jwt-redis').default;
// //ES6 import JWTR from 'jwt-redis';
// var redisClient = redis.createClient();
// const jwt = require("jsonwebtoken");
require("dotenv").config();
const {deleteFile} = require('../utils/file');
const {sendMail,sendInvoiceMail,sendPasswordMail} = require('./mail');

// const initialise = async ()=>{
//   await redisClient.connect();
//   return new JWTR(redisClient);
// }

// let jwtr;

// initialise().then((jwtrclient)=>{
//   jwtr = jwtrclient;
// }).catch((err)=>{
//   console.log(err);
// });


const create = (req,res,next)=>{
    res.render('signup.ejs',{
      alrex : req.flash('existsalr'),
      errors : [],
      oldEmail : '',
      oldPassword : '',
      oldName : '',
      oldPhone : ''
    });
}

const log = (req, res, next) => {
 
  res.render('login.ejs', {
    timeup : req.flash('timeUP')[0]||null,
    errorEmail: req.flash('error')[0]||null,
    errorPass: req.flash('wrongpass')[0]||null,
    linkExpire : req.flash('expired')[0]||null, 
    oldEmail : '',
    oldPassword : '',
    errors : []
  });
}

const createAccount = async (req, res, next) => {
  try {
    const { name, email, password ,phone} = req.body;
    const result = validationResult(req);
    const errors = result.array();
    console.log(errors);
    if(!result.isEmpty()){
      return res.status(422).render('signup.ejs',{
      alrex : errors[0].msg,
      errors : errors,
      oldEmail : email,
      oldName : name,
      oldPhone : phone
    })
    }
    
      const pass = await bcrypt.hash(password, 10);
      const newUser = new User({
        name: name,
        password: pass,
        email: email,
        phone : phone
      });
      await newUser.save();
      req.session.user = newUser;
      //const token = await jwtr.sign({ email: email , id : newUser._id}, process.env.SECRET_KEY,{expiresIn : '10m'});
      //console.log(token);
      sendMail(newUser.email).then((result)=>{
        console.log(result);
        //res.cookie('token',token,{httpOnly : true});
        return res.redirect('/home')}).catch((err)=>{
            console.log(err);
        });
      //res.setHeader('Authorization', `Bearer ${token}`);
    
  } catch (err) {
    const erro = new Error(err);
    erro.httpStatusCode = 500;
    console.log(err)
    return next(erro);
  }
};

const logAccount = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result2 = validationResult(req);
    const errors = result2.array();
    console.log(errors);
    if(!result2.isEmpty()){
      return res.status(422).render('login.ejs',{
      timeup : req.flash('timeUP')[0]||null,  
      errorEmail : errors[0].msg,
      errorPass: req.flash('wrongpass')[0]||null,
      linkExpire : req.flash('expired')[0]||null,
      oldEmail : email,
      oldPassword : password,
      errors : errors
    })
    }
    const user = await User.findOne({ email: email });

      const result = await bcrypt.compare(password, user.password);
      if (!result) {
        req.flash('wrongpass','Wrong Password, Please try again.');
        return res.redirect('/log');
      } else {
        //const token = await jwtr.sign({ email: email , id : user._id}, process.env.SECRET_KEY,{expiresIn : '10m'});
        //res.cookie('token',token,{httpOnly : true});
        req.session.user = user;
        return req.session.save(()=>{
          res.redirect('/home');
        })
    }
    
  } catch (err) {
    const erro = new Error(err);
      erro.httpStatusCode = 500;
      return next(erro);
  }
};

const getHome = async(req,res,next)=>{
    //console.log(req.user);
    const id = req.session.user._id;
    const user =await User.findOne({_id : id});
    // console.log(user);
    let imageSrc = '';
    if (user.image && user.image.data && user.image.contentType) {
        imageSrc = `data:${user.image.mimetype};charset=utf-8;base64,${user.image.data.toString('base64')}`;
    }
    // console.log('IMAGE SRCCC',imageSrc);
    res.render('home.ejs', {name : user.name , image : imageSrc, path : 'toHome'});
}

const getUserDetails = async(req,res,next)=>{
  const userID = req.session.user._id;

  const user = await User.findOne({_id : userID});
  console.log(user);
    res.render('addUserDetails.ejs', {user :  user, error : '' });
}

const postUserDetails = async(req,res,next)=>{
    const userID = req.session.user._id;
    const user = await User.findOne({_id : userID});
   // console.log(user);

    const {website,address,city,state,country,zipcode} = req.body;
    const image = req.file;

    let imgData;
    let imgContentType;
    if (image) {
      imgData = image.buffer;
      imgContentType = image.mimetype;
    }

    //console.log('multer image',image);
    const updateData = {
      website : website,
      address : address,
      city : city,
      state : state,
      country : country,
      zipcode : zipcode
  }
  if (image) {
    updateData.image = {
        data: image.buffer,
        contentType: image.mimetype
    };
}
    const updateUser = await User.findByIdAndUpdate(userID,updateData)
    
    res.redirect('/home');
    console.log(updateUser);
}

const getresetPassword = async(req,res,next)=>{
try{
  const token = req.params.token;
  const user = await User.findOne({mailToken : token ,mailTokenExpire:  {$gt: Date.now()}});
  if(!user){
    req.flash('expired','Your link has expired, please send another request.')
    return res.redirect('/log');
  }
  console.log(user);
  return res.render('password-reset.ejs',{
    notmatch : req.flash('unmatched'),
    token : token,
    user_id : user._id
  });
}catch(err){
  const erro = new Error(err);
  erro.httpStatusCode = 500;
  return next(erro);
}
}

const resetPassword = async(req,res,next)=>{
try{
  const {token,userID,password,match_password} = req.body;
  //throw new Error('dummyy');
  const user = await User.findOne({mailToken : token ,mailTokenExpire:  {$gt: Date.now()},_id : userID});
  if(!user){
    req.flash('expired','Your link has expired, please send another request');
    return res.redirect('/log');
  }
  if(password!==match_password){
    req.flash('unmatched','Passwords do not match.')
    return res.redirect(`/resetPassword/${token}`);
  }
  const hashedPassword = await bcrypt.hash(password,10);
  user.password = hashedPassword;
  user.mailToken = undefined;
  user.mailTokenExpire = undefined;
  await user.save();
  return res.redirect('/log');
}catch(err){
  const erro = new Error(err);
  erro.httpStatusCode = 500;
  return next(erro);
}
}

const reset = async(req,res,next)=>{
  res.render('reset-email.ejs',{
    emailmis : req.flash('emailmiss'),
    errors : '',
    know : "yes"
  });
}

const postreset=async(req,res,next)=>{
    
 try{
  const result2 = validationResult(req);
  const errors = result2.array();
  console.log(errors);
  if(!result2.isEmpty()){
   return res.render('reset-email.ejs',{
      emailmis : req.flash('emailmiss'),
      errors : errors[0].msg,
      know : "yes"
    })
  }
  const {mail} = req.body;
  const user = await User.findOne({email : mail});
  crypto.randomBytes(32,async (err,buffer)=>{
  if(!user){
    req.flash('emailmiss','This email does not belong to any account.');
    return res.redirect('/reset');
  }
  const token = buffer.toString('hex');
  user.mailToken = token;
  user.mailTokenExpire = Date.now() + 600000;
  await user.save();
  sendPasswordMail(user.email,token);
  res.redirect('/log');
  })
 }catch(err){
  const erro = new Error(err);
  erro.httpStatusCode = 500;
  return next(erro);
 }
}

const logOut = async(req,res,next)=>{
  req.session.destroy(()=>{
    console.log('User logged out');
    res.redirect('/');
  });
}

const getAboutUs = (req,res,next)=>{
  res.render('AboutUs');
}

module.exports = { createAccount,logAccount,getHome,create,log , getUserDetails,postUserDetails,logOut,resetPassword,getresetPassword,reset,postreset,getAboutUs};

