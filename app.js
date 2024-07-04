const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const csrf = require('csurf'); 
const {MONGO_URI} = require('./utils/db');
const {get404,get500} = require('./controllers/errorController');
const app = express();
const bodyparser = require('body-parser');
const { default: mongoose } = require('mongoose');
const PORT = 3000;
const userRouter = require('./routes/userRoutes');
const rootDir = require('./utils/path');
const path = require('path');
const flash = require('connect-flash');

var MongoDBStore = require('connect-mongodb-session')(session);
var store = new MongoDBStore({
  uri: MONGO_URI,
  collection: 'mySessions'
});
const csrfprotection = csrf();

store.on('error', function(error) {
  console.log(error);
});

app.use(cookieParser(process.env.cookieParserSecret));

app.set('view engine', 'ejs');
app.set('views', path.join(rootDir, 'public', 'views'));

app.use(express.static(path.join(rootDir, 'public')));
app.use('/images',express.static(path.join(rootDir, 'images')));
//app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(bodyparser.urlencoded({ extended: true }));


app.use(session({
  secret: process.env.SESSION_SECRETKEY,
  cookie: { maxAge: 600000 },
  store: store,
  saveUninitialized: false,
  resave: false
}));

app.use(flash());

app.use(csrfprotection);
// const { csrfSynchronisedProtection } = csrfSync({
//   getTokenFromRequest: (req) => req.body._csrf, // Ensure this matches the input field name in your form
//   value: (req) => req.session.csrfSecret,
//   secretLength: 32,
//   secretNamespace: 'formCsrfSecret'
// });

// app.use(csrfSynchronisedProtection);


app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});


app.get('/500',get500);

app.use('/', userRouter);

app.use(get404);

app.use((err,req,res,next)=>{
  console.log(err);
  res.redirect('/500');
})

app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    req.flash('timeUP','Time is up, you have to login to continue :)')
    res.redirect('/log'); // Redirect to login or another appropriate page
  } else {
    next();
  }
});


//Paytm integration
// const axios = require('axios');

// PHONEPE_MERCHANTID=process.env.PHONEPE_MERCHANTID
// PHONEPE_KEYINDEX=process.env.PHONEPE_KEYINDEX
// PHONEPE_KEY=process.env.PHONEPE_KEY
// PHONEPE_HOSTURL=process.env.PHONEPE_HOSTURL

// app.post('/pay',(req,res,next)=>{


//   const payload = {
//     "merchantId": PHONEPE_MERCHANTID,
//     "merchantTransactionId": "MT7850590068188104",
//     "merchantUserId": "MUID123",
//     "amount": 10000,
//     "redirectUrl": "https://webhook.site/redirect-url",
//     "redirectMode": "REDIRECT",
//     "callbackUrl": "https://webhook.site/callback-url",
//     "mobileNumber": "9999999999",
//     "paymentInstrument": {
//       "type": "PAY_PAGE"
//     }
//   }
  


//   const options = {
//     method: 'post',
//     url: 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay',
//     headers: {
//           accept: 'text/plain',
//           'Content-Type': 'application/json',
//           },
//   data: {
//   }
//   };
//   axios
//     .request(options)
//         .then(function (response) {
//         console.log(response.data);
//     })
//     .catch(function (error) {
//       console.error(error);
//     });
// })


mongoose.connect(MONGO_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Failed to connect to MongoDB', err);
});

app.listen(PORT, () => {
  console.log(`Server running at port: ${PORT}`);
});
