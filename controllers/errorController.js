const get404 = (req,res,next)=>{
    res.status(404).render('404nf.ejs');
}

const get500 = (req,res,next)=>{
    res.status(500).render('500er.ejs');
}
module.exports = {get404,get500};