'use strict';

var ATNA = require('../index');
var tap = require('tap');
var fs = require('fs');
var dgram = require('dgram');
var net = require('net')
var tls = require('tls')

var setupConfig = function (callback) {
  var connDetails = {
    interface: 'udp',
    host: 'localhost',
    port: 5050,
    options: {
      key: fs.readFileSync('./tests/resources/client-tls/key.pem').toString(),
      cert: fs.readFileSync('./tests/resources/client-tls/cert.pem').toString(),
      ca: fs.readFileSync('./tests/resources/server-tls/cert.pem').toString(),
    }
  }

  callback(connDetails)
}

var setupUDPserver = function (port, callback) {
  var server = dgram.createSocket('udp4');

  server.bind({
    port: port
  });

  server.on('listening', function() {
    callback()
  });

  server.on('message', function(msg, rinfo) {
    server.close();
  })

  server.on('error', function (err) {
    callback(err)
  });
}

var setupTLSserver = function (port, callback) {
  var options = {
    key: fs.readFileSync('./tests/resources/server-tls/key.pem').toString(),
    cert: fs.readFileSync('./tests/resources/server-tls/cert.pem').toString(),
    requestCert: true,
    rejectUnauthorized: false,
    secureProtocol: 'TLSv1_method'
  };

  var server = tls.createServer(options, function(sock) {
    sock.on('data', function(data) {
      server.close();
    });
  });

  server.listen(port, 'localhost', function() {
    callback();
  });
}

var setupTCPserver = function (port, callback) {
  var server = net.createServer(function(sock) {
    sock.on('data', function(data) {
      server.close();
    });
  });

  server.listen(port, 'localhost', function() {
    callback();
  });
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
    config.port = 6050

    setupUDPserver(config.port, function () {
      ATNA.send.sendAuditEvent('This is a test message', config, function (err) {
        t.error(err);
        t.end();
      });
    });
  })
});

tap.test('should send the Audit via TLS', function (t) {
  setupConfig(function (config) {
    config.interface = 'tls'
    config.port = 6051
    config.options.requestCert = true
    config.options.rejectUnauthorized = false

    setupTLSserver(config.port, function () {
      ATNA.send.sendAuditEvent('This is a test message', config, function (err) {
        console.log('in here')
        t.error(err);
        t.end();
      });
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
});

tap.test('should send the Audit via TCP', function (t) {
  setupConfig(function (config) {
    config.interface = 'tcp'
    config.port = 6052

    setupTCPserver(config.port, function () {
      ATNA.send.sendAuditEvent('This is a test message', config, function (err) {
        t.error(err);
        t.end();
      });
    });
  });
});
