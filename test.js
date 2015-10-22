'use strict';

const atna = require('./index');

var audit = atna.userLoginAudit(0, 'openhim', 'x.x.x.x', 'testUser', 'testRole', '123');
atna.validateAudit(audit);

let syslog = atna.wrapInSyslog('test');
console.log(syslog);
