const jwt = require('jsonwebtoken');
require('dotenv').config();
var redis = require('redis');
var JWTR =  require('jwt-redis').default;
//ES6 import JWTR from 'jwt-redis';
var redisClient = redis.createClient();

// const initialise = async()=>{
//     await redisClient.connect();
//     return new JWTR(redisClient);
// }
// let jwtr;

// initialise().then((jwtrclient)=>{
//     jwtr = jwtrclient;
// }).catch((err)=>{
//     console.log(err);
// })

const auth = (req,res,next)=>{
    //let token =  req.cookies.token;
    // //console.log(token);
    // if(token){
    //     jwtr.verify(token,process.env.SECRET_KEY,(err,decoded)=>{
    //         if(err){
    //             return res.status(400).json({message : 'Please Log In Again'});
    //         }
    //         req.user = decoded;
    //         next();
    //     });
    // }
    // else{
    //     return res.render('signup.ejs');
    // }

    if(req.session.user){
        next();
    }
    else{
        req.flash('timeUP','Time is up, you have to login to continue :)')
        return res.status(400).redirect('/log');
    }
}

module.exports = {auth};
