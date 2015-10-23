'use strict';

const atna = require('./index');

// I'm validate manually so the test fail here
atna.disableValidation();

let syslog = atna.wrapInSyslog('test');
console.log(syslog);

let audit = atna.userLoginAudit(0, 'openhim', 'x.x.x.x', 'testUser', 'testRole', '123');
atna.validateAudit(audit);
console.log(audit);

audit = atna.appActivityAudit(true, 'openhim', 'x.x.x.x');
atna.validateAudit(audit);
console.log(audit);
