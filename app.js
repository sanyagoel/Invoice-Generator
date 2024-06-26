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

mongoose.connect(MONGO_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Failed to connect to MongoDB', err);
});

app.listen(PORT, () => {
  console.log(`Server running at port: ${PORT}`);
});
