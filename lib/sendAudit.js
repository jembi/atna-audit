'use strict';

var dgram = require('dgram')
var net = require('net')
var tls = require('tls')

var sendUDPAudit = function(msg, host, port, callback) {
  var client = dgram.createSocket('udp4');

  return client.send(msg, 0, msg.length, port, host, function(err) {
    client.close();
    return callback(err);
  });
};

var sendTLSAudit = function(msg, host, port, options, callback) {
  var client = tls.connect(port, host, options, function() {
    if (!client.authorized) {
      return callback(client.authorizationError);
    }
    client.write(msg.length + " " + msg);
    return client.end();
  });
  client.on('error', function(err) {
    return callback(err)
  });
  client.on('close', function(had_error) {
    if (had_error) {
      return callback();
    }
  });
};

var sendTCPAudit = function(msg, host, port, callback) {
  var client = net.connect(port, host, function() {
    client.write(msg.length + " " + msg);
    return client.end();
  });
  client.on('error', function(err) {
    return callback(err)
  });
  client.on('close', function(had_error) {
    if (!had_error) {
      return callback();
    }
  });
};

exports.sendAuditEvent = function(msg, connDetail, callback) {
  if (callback == null) {
    callback = (function() {});
  }
  var done = function(err) {
    if (err) {
      return callback(err)
    }
    return callback();
  };
  
  switch (connDetail.interface) {
    case 'udp':
      return sendUDPAudit(msg, connDetail.host, connDetail.port, done);
    case 'tls':
      return sendTLSAudit(msg, connDetail.host, connDetail.port, connDetail.options, done);
    case 'tcp':
      return sendTCPAudit(msg, connDetail.host, connDetail.port, done);
    default:
      return done(new Error("Invalid audit event interface '" + connDetail.interface + "'"));
  }
};