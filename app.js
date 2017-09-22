/*
  @ Required Dependecies *
*/
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');




/*
  @ DATABASE Connect *
*/

mongoose.connect('mongodb://localhost/nodekb', {useMongoClient: true});
let db = mongoose.connection;

/*
  @ DATABASE ERROR *
*/

db.on('error', function(err) {
  console.log(err);
});

/*
  @ app init *
*/

const app = express();

/*
  @ MODEL *
*/

let Article =require('./models/article');


/*
  @ PATH for view engine (PUG)
*/


app.set('path', path.join(__dirname,'views'));
app.set('view engine', 'pug');


/*
  @ JSON parser
*/


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


/*
  @ Static directory as a PUBLIC
*/

app.use(express.static(path.join(__dirname, 'public')));

/*
  @ Express Session *
*/

app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,

}));


/*
  @ Express messages middleware *
*/


app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});



/*
  @ Express validator *
*/


app.use(expressValidator({
  errorFormatatter: function(param, msg, value) {
    var namespace = param.split('.'),
    root = namespace.shift(),
    formParam = root;

    while(namespace.length){
      formParam += '[' +namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };

  }
}));

/*
  @ Passport config
*/
 require('./config/passport')(passport);

//passport middleware

app.use(passport.initialize());
app.use(passport.session());


app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});


/*
  @ Home route *
*/

app.get('/', function (req, res){

  Article.find({}, function(err, articles){
    if(err){
      console.log(err);
    }else{
      res.render('index',{
        title :'Blogs',
        articles : articles
      });
    }
  });
});



let articles = require('./routes/articles');
let users = require('./routes/users');

app.use('/articles', articles);
app.use('/users', users);




/*
  @ SERVER RUN
*/

app.listen(3000, function () {
  console.log('App listening on port 3000!');
});
