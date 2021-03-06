var express = require('express');
var router = express.Router();
var db = require('../models/mymongo');
var cache = require('../models/myredis');
var errlog = require('../errlog');
var debug = require('debug')('express-demo');
var valid = require('validator');
var format = require('date-format');
var util = require('util');

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});
router.post('/register', function(req, res) {
  registerProc(db, req, res);
});
router.post('/login', function(req, res) {
  loginProc(db, req, res);
});
router.post('/logout', function(req, res) {
  logoutProc(db, req, res);
});
router.post('/passwd', function(req, res) {
  passwdProc(db, req, res);
});
router.post('/uploads', function(req, res) {
  uploadsProc(db, req, res);
});

function registerProc(db, req, res) {
  var user_id = req.body.phone;
  var user_name = req.body.name;
  var user_pass = req.body.password;

  debug('user_id:' + user_id);
  debug('user_name:' + user_name);
  debug('user_pass:' + user_pass);

  if (!valid.isNumeric(user_id) || !valid.isLength(user_id, 11, 11)) {
    res.send({code: -1, info: '输入数据错误!'});
    return;
  }
  if (valid.isNull(user_name)) {
    res.send({code: -1, info: '输入数据错误!'});
    return;
  }
  if (!valid.isLength(user_pass, 6)) {
    res.send({code: -1, info: '输入数据错误!'});
    return;
  }

  var user_doc = {
    '_id': user_id,
    'name': user_name,
    'password': user_pass,
    'reg_date': new Date()
  };

  db.collection('users', function(err, collection) {
    if (err) {
      errlog('Open collection ' + err);
      res.send({code: -1, info: '数据库操作失败!'});
      return;
    }

    collection.insert(user_doc, {w: 1}, function(err, records) {
      if (err) {
        errlog('Insert documents ' + err);
        if (err.message.indexOf('E11000') != -1) {
          res.send({code: -1, info: '用户已存在，请勿重复注册!'});
        } else {
          res.send({code: -1, info: '数据库操作失败!'});
        }
        return;
      }

      res.send({code: 0, info: 'Success'});
      incUserTotal(user_doc.reg_date);
    });
  });
};

function incUserTotal(reg_date) {
  var y_key = format.asString('yyyy', reg_date);
  var m_key = format.asString('yyyyMM', reg_date);
  var d_key = format.asString('yyyyMMdd', reg_date);

  var multi = cache.multi();
  multi.HINCRBY('sys.number.sum', 'users', 1);
  multi.HINCRBY('sys.number.' + y_key, 'new_users', 1);
  multi.HINCRBY('sys.number.' + m_key, 'new_users', 1);
  multi.HINCRBY('sys.number.' + d_key, 'new_users', 1);
  multi.exec(function(err, results) {
    if (err) {
      errlog('MULTI HINCRBY for new user registeration ' + err);
    }
  });
};

function loginProc(db, req, res) {
  var user_id = req.body.phone;
  var user_pass = req.body.password;

  debug('user_id:' + user_id);
  debug('user_pass:' + user_pass);

  if (!valid.isNumeric(user_id) || !valid.isLength(user_id, 11, 11)) {
    res.send({code: -1, info: '输入数据错误!'});
    return;
  }
  if (!valid.isLength(user_pass, 6)) {
    res.send({code: -1, info: '输入数据错误!'});
    return;
  }

  db.collection('users', function(err, collection) {
    if (err) {
      errlog('Open collection ' + err);
      res.send({code: -1, info: '数据库操作失败!'});
      return;
    }

    collection.findOne({_id: user_id}, function(err, user_doc) {
      if (err) {
        errlog('Find documents ' + err);
        res.send({code: -1, info: '数据库操作失败!'});
        return;
      }
      if (!user_doc) {
        res.send({code: -1, info: '用户信息不存在!'});
        return;
      }
      if (user_pass !== user_doc.password) {
        res.send({code: -1, info: '用户密码不正确!'});
        return;
      }
      user_doc.password = '';

      req.session.user = user_id;

      res.send({code: 0, user: user_doc});
    });
  });
};

function logoutProc(db, req, res) {
  var user_id = req.body.phone;

  debug('user_id:' + user_id);

  if (!valid.isNumeric(user_id) || !valid.isLength(user_id, 11, 11)) {
    res.send({code: -1, info: '输入数据错误!'});
    return;
  }

  if (req.session.user !== user_id) {
    res.send({code: -1, info: '请先登录！'});
    return;
  }

  req.session.user = null;
  res.send({code: 0, info: 'Success'});
};

function passwdProc(db, req, res) {
  var user_id = req.body.phone;
  var user_old_pass = req.body.old_password;
  var user_new_pass = req.body.new_password;

  debug('user_id:' + user_id);
  debug('user_old_pass:' + user_old_pass);
  debug('user_new_pass:' + user_new_pass);

  if (!valid.isNumeric(user_id) || !valid.isLength(user_id, 11, 11)) {
    res.send({code: -1, info: '输入数据错误!'});
    return;
  }
  if (!valid.isLength(user_old_pass, 6)) {
    res.send({code: -1, info: '输入数据错误!'});
    return;
  }
  if (!valid.isLength(user_new_pass, 6)) {
    res.send({code: -1, info: '输入数据错误!'});
    return;
  }

  if (req.session.user !== user_id) {
    res.send({code: -1, info: '请先登录！'});
    return;
  }

  db.collection('users', function(err, collection) {
    if (err) {
      errlog('Open collection ' + err);
      res.send({code: -1, info: '数据库操作失败!'});
      return;
    }

    collection.update({_id: user_id, password: user_old_pass},
                      {$set: {password: user_new_pass}},
                      {w: 1}, function(err, count) {
      if (err) {
        errlog('Update documents ' + err);
        res.send({code: -1, info: '数据库操作失败!'});
        return;
      }
      if (!count) {
        res.send({code: -1, info: '用户旧密码不正确!'});
        return;
      }

      res.send({code: 0, info: 'Success'});
    });
  });
};

function uploadsProc(db, req, res) {
  var user_id = req.body.phone;

  debug('user_id:' + user_id);

  if (!valid.isNumeric(user_id) || !valid.isLength(user_id, 11, 11)) {
    res.send({code: -1, info: '输入数据错误!'});
    return;
  }

  if (req.session.user !== user_id) {
    res.send({code: -1, info: '请先登录！'});
    return;
  }

  var photos = req.files.photos
  var org_names = [];
  var new_names = [];
  if (util.isArray(photos)) {
    for (i = 0; i < photos.length; i++) {
      org_names.push(photos[i].originalname);
      new_names.push(photos[i].name);
    }
  } else {
    org_names.push(photos.originalname);
    new_names.push(photos.name);
  }

  res.send({code: 0, file_num: org_names.length,
            old_names: org_names, new_names: new_names});
};

module.exports = router;
