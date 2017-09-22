
const express = require('express');
const router = express.Router();


/*
  @ MODEL *
*/
let Article = require('../models/article');

let User = require('../models/user');

/*
  @ add article route
*/

router.get('/add', ensureAuthenticated , function(req, res){
  res.render('add_article',{
    title :'Add Article'
  });
});

/*
  @ add article 
*/

 router.post('/add', function(req, res){
  
  req.checkBody('title', 'Title is Required').notEmpty();
 // req.checkBody('author', 'Author is Required').notEmpty();
  req.checkBody('body', 'Body is Required').notEmpty();

  let errors = req.validationErrors();
  /*

  	DeprecationWarning: req.validationErrors() may be removed in a future version.
   	Use req.getValidationResult() instead.

  */

  if(errors){
    res.render('add_article',{
      title: 'Add Article',
      errors : errors
    });
  }else{
     let article = new Article();
      article.title = req.body.title;
      article.author = req.user._id;
      article.body = req.body.body;

      article.save(function(err){
        if(err){
          console.log(err);
          return;
        }else{
          req.flash('success', ' Article Added ');
          res.redirect('/');
        }
      });
  }
  
});


/*
  @ Edit route
*/

router.get('/edit/:id', ensureAuthenticated, function(req, res){
  Article.findById(req.params.id, function(err, article){
    if(article.author != req.user._id){
      req.flash('danger', 'Not Authorized');
      res.redirect('/');
    }
    res.render('edit_article',{
      title:'Edit Article',
      article : article
    });
  });
});


/*
  @ update article route
*/

router.post('/edit/:id',  function(req, res){
  let article = {};

  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  let query = {_id:req.params.id}

  Article.update(query, article, function(err){
    if(err){
      console.log(err);
      return;
    }else{
      req.flash('success', 'Updated');
      res.redirect('/');
    }
  });
});


/*
  @ Delete route
*/


router.delete('/:id', function(req, res){
  if(!req.user._id){
    res.status(500).send();

  }
  let query = {_id:req.params.id}

  Article.findById(req.params.id, function(err, article){
    if(article.author != req.user._id){
      res.status(500).send();

    }else{
         Article.remove(query, function(err){
            if(err){
              console.log(err);
            }
            res.send('Success');
        });
    }
 
  });


});


/*
  @ GET single article route
*/

router.get('/:id', function(req, res){
  Article.findById(req.params.id, function(err, article){
    User.findById(article.author, function(err, user){
       res.render('article',{
            article : article,
            author : user.name
        });
    });
   
  });
});


/*
**
  @ Profile Route
**
*/

router.get('/profile', ensureAuthenticated, function(req, res){
  res.render('profile');
});


/*
    **
    @  Access Control
    **
*/
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger', 'You have to login first');
    res.redirect('/users/login');
  }
}


module.exports = router ;