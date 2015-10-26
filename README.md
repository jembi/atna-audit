[![Build Status](https://travis-ci.org/jembi/atna-audit.svg)](https://travis-ci.org/jembi/atna-audit)

# ATNA Audit Trail library

Assists in the creation of ATNA audit trail messages for IHE profiles.

Install with:

```bash
$ npm install --save atna-audit
```

Use the simple convenience function as follows:

```js
var audit = atna.userLoginAudit(atna.OUTCOME_SUCCESS, 'openhim', 'x.x.x.x', 'testUser', 'testRole', '123');
var syslog = atna.wrapInSyslog(audit);
```

Or construct your own custom audits like this:

```js
var eventID = new atna.Code(110114, 'UserAuthenticated', 'DCM');
var typeCode = new atna.Code(110122, 'Login', 'DCM');
var eIdent = new atna.EventIdentification(atna.EVENT_ACTION_EXECUTE, new Date(), atna.OUTCOME_SUCCESS, eventID, typeCode);
var sysRoleCode = new atna.Code(110150, 'Application', 'DCM');
var sysParticipant = new atna.ActiveParticipant(sysname, '', true, sysIp, atna.NET_AP_TYPE_IP, [sysRoleCode]);
var userRoleCodeDef = new atna.Code(userRole, userRole, userRoleCode);
var userParticipant = new atna.ActiveParticipant(username, '', true, null, null, [userRoleCodeDef]);
var sourceTypeCode = new atna.Code(atna.AUDIT_SRC_TYPE_UI, '', '');
var sourceIdent = new atna.AuditSourceIdentification(null, sysname, sourceTypeCode);
var audit = new atna.AuditMessage(eIdent, [sysParticipant, userParticipant], null, [sourceIdent]);
var xml = audit.toXML();
```
