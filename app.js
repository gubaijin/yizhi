/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , mongoose = require('mongoose');

var _ = require('underscore');
var async = require('async');
var utils = require('./utils');

var mongodb = require('mongodb');
var cons = require('consolidate');
var swig = require('swig');
var swigFilters = require('./filters');
var app = express();

var config = require('./config');

//Set up swig
app.engine('html', cons.swig);
swig.init({
  root: __dirname + '/views',
  allowErrors: false,
  filters: swigFilters
});

//App configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'html');
  app.set('view options', {layout: false});
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(config.site.baseUrl,express.static(__dirname + '/public'));  
  app.use(express.bodyParser());
  app.use(express.cookieParser(config.site.cookieSecret));
  app.use(express.session({ secret: config.site.sessionSecret }));
  app.use(express.methodOverride());
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

//connect to DB
mongoose.connect('mongodb://localhost/yizhi_dev', function(err){
	if(!err){
		console.log('connected to MongoDB');
	}else{
		throw err;
	}
}); 
//View helper, sets local variables used in templates
app.all('*', function(req, res, next) {
  res.locals.baseHref = config.site.baseUrl;

  //Flash messages
  if (req.session.success) {
    res.locals.messageSuccess = req.session.success;
    delete req.session.success;
  }

  if (req.session.error) {
    res.locals.messageError = req.session.error;
    delete req.session.error;
  }

  return next();
});

//mongodb middleware
var middleware = function(req, res, next) {
  // req.adminDb = adminDb;
  // req.databases = databases; //List of database names
  // req.collections = collections; //List of collection names in all databases

  //// Allow page handlers to request an update for collection list
  // req.updateCollections = updateCollections;

  next();
};

//Routes
app.get(config.site.baseUrl, middleware,  routes.index);
app.get(config.site.baseUrl+'design', middleware, routes.design);
app.get(config.site.baseUrl+'signup', middleware, routes.signup);
app.get(config.site.baseUrl+'signin', middleware, routes.signin);
// app.put(config.site.baseUrl+'db/:database/:collection/:document', middleware, routes.updateDocument);
// app.del(config.site.baseUrl+'db/:database/:collection/:document', middleware, routes.deleteDocument);
// app.post(config.site.baseUrl+'db/:database/:collection', middleware, routes.addDocument);

// app.get(config.site.baseUrl+'db/:database/:collection', middleware, routes.viewCollection);
// app.put(config.site.baseUrl+'db/:database/:collection', middleware, routes.renameCollection);
// app.del(config.site.baseUrl+'db/:database/:collection', middleware, routes.deleteCollection);
// app.post(config.site.baseUrl+'db/:database', middleware, routes.addCollection);

// app.get(config.site.baseUrl+'db/:database', middleware, routes.viewDatabase);

//run as standalone App?
if (require.main === module){
  app.listen(config.site.port);
  console.log("server listening on port " + (config.site.port || 80));
}else{
  //as a module
  console.log('module ready to use on route "'+config.site.baseUrl+'*"');
  server=http.createServer(app);  
  module.exports=function(req,res,next){    
    server.emit('request', req, res);
  };
}


