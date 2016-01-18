'use strict';

var atna = require('./index');
var exec = require('child_process').exec;
var fs = require('fs');
var tap = require('tap');

function validateAudit(auditXml, callback) {
  fs.writeFileSync('test.xml', auditXml);
  exec('xmllint --noout --relaxng dicom.rng test.xml', function(err, stdout, stderr) {
    if (err) { return callback(err); }
    fs.unlinkSync('test.xml');
    if (/test\.xml validates/.test(stderr)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  });
}

tap.test('should wrap an audit message in syslog format', function (t) {
  var syslog = atna.wrapInSyslog('test');
  t.match(syslog, /<85>1 \S* \S* atna-audit\.js \d* IHE\+RFC-3881 - test/);
  t.end();
});

tap.test('Login audit should validate against relax ng schema', function (t) {
  var audit = atna.userLoginAudit(atna.OUTCOME_SUCCESS, 'openhim', 'openhim.org', 'testUser', 'testRole', '123');
  validateAudit(audit, function (err, valid) {
    t.error(err);
    t.ok(valid);
    t.end();
  });
});

tap.test('App Activity audit should validate against relax ng schema', function (t) {
  var audit = atna.appActivityAudit(true, 'openhim', 'openhim.org');
  validateAudit(audit, function (err, valid) {
    t.error(err);
    t.ok(valid);
    t.end();
  });
});

tap.test('Node authentication audit should validate against relax ng schema', function (t) {
  var audit = atna.nodeAuthentication('1.2.3.4', 'openhim', 'openhim.org', 4);
  validateAudit(audit, function (err, valid) {
    t.error(err);
    t.ok(valid);
    t.end();
  });
});
