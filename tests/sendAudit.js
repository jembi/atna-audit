'use strict';

var ATNA = require('../index');
var tap = require('tap');
var fs = require('fs');

const getFileContent = (path) => {
  if (!path) {
    return
  }

  return fs.readFileSync(path, 'utf8', function (err, data) {
    if (err) {
      return logger.error(err)
    }
    return data
  }).toString()
}

var setupConfig = function (callback) {
  var connDetails = {
    interface: 'udp',
    host: 'localhost',
    port: 5050,
    options: {
      key: getFileContent('./tests/resources/localhost.key'),
      cert: getFileContent('./tests/resources/localhost.cert')
    }
  }

  callback(connDetails)
}

tap.test('should throw an error for an invalid interface type', function (t) {
  setupConfig(function (config) {
    config.interface = 'NOTVALID'

    ATNA.send.sendAuditEvent('This is a test message', config, function (err) {
      t.ok(err);
      t.end();
    });
  }); 
});

tap.test('should send the Audit via UDP', function (t) {
  setupConfig(function (config) {
    config.interface = 'udp'
    config.port = 5050

    ATNA.send.sendAuditEvent('This is a test message', config, function (err) {
      t.error(err);
      t.end();
    });
  });
});

/*tap.test('should send the Audit via TLS', function (t) {
  setupConfig(function (config) {
    config.interface = 'tls'
    config.port = 5051
    config.options.requestCert = true
    config.options.rejectUnauthorized = false

    ATNA.send.sendAuditEvent('This is a test message', config, function (err) {
      t.error(err);
      t.end();
    });
  });
});

tap.test('should send the Audit via TLS and fail - Certificate not valid - Self Signed', function (t) {
  setupConfig(function (config) {
    config.interface = 'tls'
    config.port = 5051
    config.options.requestCert = true
    config.options.rejectUnauthorized = true

    ATNA.send.sendAuditEvent('This is a test message', config, function (err) {
      t.ok(err);
      t.end();
    });
  });
});

tap.test('should send the Audit via TLS and fail - Certificate not valid', function (t) {
  setupConfig(function (config) {
    config.interface = 'tls'
    config.port = 5051
    config.options = {
      key: null,
      cert: null
    }

    ATNA.send.sendAuditEvent('This is a test message', config, function (err) {
      t.ok(err);
      t.end();
    });
  });
});*/

tap.test('should send the Audit via TCP', function (t) {
  setupConfig(function (config) {
    config.interface = 'tcp'
    config.port = 5052

    ATNA.send.sendAuditEvent('This is a test message', config, function (err) {
      t.error(err);
      t.end();
    });
  });
});
