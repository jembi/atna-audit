'use strict';

var atna = require('./index');

// Validate manually so the test fail here
atna.disableValidation();

var syslog = atna.wrapInSyslog('test');
console.log(syslog);

var audit = atna.userLoginAudit(0, 'openhim', 'openhim.org', 'testUser', 'testRole', '123');
atna.validateAudit(audit);
console.log(audit);

audit = atna.appActivityAudit(true, 'openhim', 'openhim.org');
atna.validateAudit(audit);
console.log(audit);
