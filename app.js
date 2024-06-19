const express = require('express');
require('dotenv').config();

const app = new express();
const bodyparser = require('body-parser');
const {MONGO_URI} = require('./utils/db');
const { default: mongoose } = require('mongoose');
const { MongoClient } = require("mongodb");
const PORT = 3000;
const userRouter = require('./routes/userRoutes');
const rootDir = require('./utils/path');
const path = require('path');

const cookieParser = require('cookie-parser');

app.use(cookieParser());


app.set('view engine','ejs');
app.set('views',path.join(rootDir,'public','views'));

app.use(express.static(path.join(rootDir,'public')));

app.use(bodyparser.urlencoded({extended : true}));

app.use('/',userRouter);



mongoose.connect(MONGO_URI, {

  }).then(() => {
    console.log('Connected to MongoDB');
  }).catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });

app.listen(PORT,()=>{
    console.log(`Server running at port: ${PORT}`);
})

