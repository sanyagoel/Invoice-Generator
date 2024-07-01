const path = require('path');
const fs = require('fs');

const deleteFile = (filepath)=>{
    fs.unlink(filepath,(err)=>{
        if(err){
            console.log(err);
        }
    })
}


module.exports   = {deleteFile};