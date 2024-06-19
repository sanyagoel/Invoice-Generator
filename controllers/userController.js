const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const sendMail = require('./mail');

const create = (req,res,next)=>{
    res.render('signup.ejs');
}

const log = (req,res,next)=>{
    res.render('login.ejs');
}

const createAccount = async (req, res, next) => {
  try {
    const { name, email, password ,phone} = req.body;
    const user = await User.findOne({ email: email });
    if (user) {
      return res
        .status(400)
        .json({ message: "Sorry, this email already exists" });
    } else {
      const pass = await bcrypt.hash(password, 10);
      const newUser = new User({
        name: name,
        password: pass,
        email: email,
        phone : phone
      });
      await newUser.save();
      const token = jwt.sign({ email: email , id : newUser._id}, process.env.SECRET_KEY,{expiresIn : '10m'});
      console.log(token);
      sendMail(newUser.email).then((result)=>{
        console.log(result);
        res.cookie('token',token,{httpOnly : true});
        return res.redirect('/home')}).catch((err)=>{
            console.log(err);
        });
      //res.setHeader('Authorization', `Bearer ${token}`);
    }
  } catch (err) {
    console.log(err);
  }
};

const logAccount = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "No account exists with this email id" });
    } else {
      const result = await bcrypt.compare(password, user.password);
      if (!result) {
        return res.status(400).json({ message: "Wrong Password" });
      } else {
        const token = jwt.sign({ email: email , id : user._id}, process.env.SECRET_KEY,{expiresIn : '10m'});
        res.cookie('token',token,{httpOnly : true});

        return res.redirect('/home');
    }
    }
  } catch (err) {
    console.log(err);
  }
};

const getHome = async(req,res,next)=>{
    //console.log(req.user);
    const id = req.user.id;
    const user =await User.findOne({_id : id});
    res.render('home.ejs', {name : user.name});
}

const getUserDetails = async(req,res,next)=>{
    res.render('addUserDetails.ejs');
}

const postUserDetails = async(req,res,next)=>{
    const userID = req.user.id;
    const {website,address,city,state,country,zipcode} = req.body;

    const updateUser = await User.findByIdAndUpdate(userID,{
        website : website,
        address : address,
        city : city,
        state : state,
        country : country,
        zipcode : zipcode
    })
    res.redirect('/home');
    console.log(updateUser);
}

module.exports = { createAccount,logAccount,getHome,create,log , getUserDetails,postUserDetails};
