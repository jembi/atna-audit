'use strict';

var fs = require('fs');
var libxml = require('libxmljs');
var atna = require('./index');

function validateAudit(auditXml) {
  var xsd = fs.readFileSync(__dirname + '/rfc-3881.xsd').toString();
  var xsdDoc = libxml.parseXml(xsd);
  var xml = libxml.parseXml(auditXml);
  if (!xml.validate(xsdDoc)) {
    throw new Error('XML audit not valid according to XSD:\n' + xml.validationErrors);
  }
}
exports.validateAudit = validateAudit;

var syslog = atna.wrapInSyslog('test');
console.log(syslog);

var audit = atna.userLoginAudit(atna.OUTCOME_SUCCESS, 'openhim', 'openhim.org', 'testUser', 'testRole', '123');
validateAudit(audit);
console.log(audit);

audit = atna.appActivityAudit(true, 'openhim', 'openhim.org');
validateAudit(audit);
console.log(audit);
