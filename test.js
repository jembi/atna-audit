'use strict';

var atna = require('./index');

var syslog = atna.wrapInSyslog('test');
console.log(syslog);

var audit = atna.userLoginAudit(atna.OUTCOME_SUCCESS, 'openhim', 'openhim.org', 'testUser', 'testRole', '123');
atna.validateAudit(audit);
console.log(audit);

audit = atna.appActivityAudit(true, 'openhim', 'openhim.org');
atna.validateAudit(audit);
console.log(audit);
