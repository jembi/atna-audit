# ATNA Audit Trail library

Assists in the creation of ATNA audit trail messages for IHE profiles.

Install with:

```bash
$ npm install --save atna-audit
```

Use the simple convenience function as follows:

```js
let audit = atna.userLoginAudit(0, 'openhim', 'x.x.x.x', 'testUser', 'testRole', '123');
let syslog = atna.wrapInSyslog(audit);
```

Or construct your own custom audits like this:

```js
let eventID = new atna.Code(110114, 'UserAuthenticated', 'DCM');
let typeCode = new atna.Code(110122, 'Login', 'DCM');
let eIdent = new atna.EventIdentification('E', new Date(), 0, eventID, typeCode);
let sysRoleCode = new atna.Code(110150, 'Application', 'DCM');
let sysParticipant = new atna.ActiveParticipant(sysname, '', true, sysIp, 2, [sysRoleCode]);
let userRoleCodeDef = new atna.Code(userRole, userRole, userRoleCode);
let userParticipant = new atna.ActiveParticipant(username, '', true, null, null, [userRoleCodeDef]);
let sourceTypeCode = new atna.Code(1, '', '');
let sourceIdent = new atna.AuditSourceIdentification(null, sysname, sourceTypeCode);
let audit = new atna.AuditMessage(eIdent, [sysParticipant, userParticipant], null, [sourceIdent]);
let xml = audit.toXML();
```

Validate your audit XML against the rfc-3881 xsd like this:

```js
atna.validateAudit(xml);
```

This function will throw an exception if a problem is found.
