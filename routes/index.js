var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
var mongoObject = require('mongodb').ObjectID;
var assert = require('assert');


var url = 'mongodb://localhost:27017/';

/* GET home page. */
router.get('/', function (req, res, next) {
  //res.render('index', { title: 'Express only' });
  res.render('index');
});
router.get('/demo1', function (req, res, next) {
  res.render('test1');
});
router.get('/demo2', function (req, res, next) {
  res.render('test2');
});
router.post('/form1', function (req, res, next) {
  var val = req.body.name;
  res.render('test1', {
    val: req.body
  });
});
router.post('/form2', function (req, res, next) {
  var id = req.body.id;
  res.redirect('/demo3/' + id);
});

router.get('/demo3/:id', function (req, res, next) {
  res.render('test3', {
    id: req.params.id
  });
});

router.get('/formvalidation', function (req, res, next) {


  res.render('formvalidation', {
    errors: req.session.errors,
    success: req.session.success
  });

  req.session.errors = null;
  req.session.success = null;

});

router.post('/check', function (req, res, next) {
  var name = req.body.name;
  var email = req.body.email;

  req.checkBody('name', 'Name must more then 4 char').isLength({
    min: 4
  });
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Please enter a valid email').isEmail();


  var errors = req.validationErrors();
  if (errors) {
    req.session.errors = errors;
    res.redirect('/formvalidation');
  } 
  else {
    req.session.success = true;
    res.redirect('/formvalidation');
  }

});

router.get('/insert', function (req, res, next) {

  res.render('dataFrom', {
    error: req.session.error,
    success: req.session.success
  });
  req.session.error = null;
  req.session.success = null;
});

router.post('/saveData', function (req, res, next) {
  req.check('name', 'Must be more then 5 char').isLength({
    min: 6
  });
  req.check('email', 'Invalid email').isEmail();
  req.check('address', 'Enter Address').notEmpty();

  var error = req.validationErrors();
  if (error) {
    req.session.error = error;
    res.redirect('/insert');
  } 
  else {

    ///collection set
    var item = {
      name: req.body.name,
      address: req.body.address,
      email: req.body.email

    };
    /// data insertion start
    mongo.connect(url, function (err, db) {
      assert.equal(null, err);
      var dbObject = db.db('myDB');
      dbObject.collection('user').insertOne(item, function (err, result) {
        assert.equal(null, err);
        console.log('data insert');
        db.close();
      });

    });

    req.session.success = true;
    res.redirect('/insert');
  }

});

router.get('/show', function (req, res, next) {

  mongo.connect(url, function (err, db) {
    if (err) throw err;
    var dbObject = db.db("myDB");
    dbObject.collection("user").find({}).toArray(function (err, result) {
      if (err) throw err;
      console.log(result);
      db.close();
      res.render('Showdata', {
        data : result
      });
    });
  });
});


router.get('/delete/:id', function (req, res, next) {
  var id = req.params.id;
  mongo.connect(url, function (err, db) {
    if (err) throw err;
    var dbObject = db.db("myDB");
    dbObject.collection("user").deleteOne({
      "_id": mongoObject(id)
    }, function (err, result) {
      if (err) throw err;
      console.log(result);
      db.close();
      res.redirect('/show');
    });
  });
});

router.get('/updatePage/:id', function (req, res, next) {
  var id = req.params.id;
  mongo.connect(url, function (err, db) {
    if (err) throw err;
    var dbObject = db.db("myDB");
    dbObject.collection("user").findOne({
      "_id": mongoObject(id)
    }, function (err, result) {
      if (err) throw err;
      console.log(result);
      db.close();
      res.render('updatePage', {
        data: result,
        error:req.session.error,
      });
    });
  });
});




router.post('/update', function (req, res, next) {
  var id = req.body.id;
  req.check('name', 'Must be more then 5 char').isLength({
    min: 6
  });
  req.check('email', 'Invalid email').isEmail();
  req.check('address', 'Enter Address').notEmpty();

  var error = req.validationErrors();
  if (error) {
    req.session.error = error;
    res.redirect('/updatePage/'+id);
  } else {

    ///collection set
    var item = {
      name: req.body.name,
      address: req.body.address,
      email: req.body.email

    };
    /// data insertion start
    mongo.connect(url, function (err, db) {
      assert.equal(null, err);
      var dbObject = db.db('myDB');
      dbObject.collection('user').updateOne({"_id":mongoObject(id)},{$set:item} , function (err, result) {
        assert.equal(null, err);
        console.log('data update');
        db.close();
        req.session.success = true;
        res.redirect('/show');
      });

    });

    
  }

});








module.exports = router;