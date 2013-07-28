var config = require('../config');
var bson = require('../bson');

exports.signup = function(req, res, next) {  
  var ctx = {
    title: '注册',
    editorTheme: config.options.editorTheme
  };

  res.render('signup', ctx);
};

exports.signin = function(req, res, next) {  
  var ctx = {
    title: '登录',
    editorTheme: config.options.editorTheme
  };

  res.render('signin', ctx);
};