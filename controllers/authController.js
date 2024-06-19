const jwt = require('jsonwebtoken');
require('dotenv').config();


const auth = (req,res,next)=>{

    let token =  req.cookies.token;
    console.log(token);
    if(token){
        jwt.verify(token,process.env.SECRET_KEY,(err,decoded)=>{
            if(err){
                return res.status(400).json({message : 'Please Log In Again'});
            }
            req.user = decoded;
            next();
        });
    }
    else{
        return res.render('signup.ejs');
    }
    
}

module.exports = {auth};
