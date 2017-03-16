[![Build Status](https://travis-ci.org/jembi/atna-audit.svg)](https://travis-ci.org/jembi/atna-audit) [![codecov.io](https://codecov.io/github/jembi/atna-audit/coverage.svg?branch=master)](https://codecov.io/github/jembi/atna-audit?branch=master)

# ATNA Audit Trail library

Assists in the creation of ATNA audit trail messages for IHE profiles.

Install with:

```bash
$ npm install --save atna-audit
```

Use the simple convenience function as follows:

```js
var audit = atna.construct.userLoginAudit(atna.OUTCOME_SUCCESS, 'openhim', 'x.x.x.x', 'testUser', 'testRole', '123');
var syslog = atna.construct.wrapInSyslog(audit);
```

Or construct your own custom audits like this:

```js
var eventID = new atna.construct.Code(110114, 'UserAuthenticated', 'DCM');
var typeCode = new atna.construct.Code(110122, 'Login', 'DCM');
var eIdent = new atna.construct.EventIdentification(atna.EVENT_ACTION_EXECUTE, new Date(), atna.OUTCOME_SUCCESS, eventID, typeCode);
var sysRoleCode = new atna.construct.Code(110150, 'Application', 'DCM');
var sysParticipant = new atna.construct.ActiveParticipant(sysname, '', true, sysIp, atna.NET_AP_TYPE_IP, [sysRoleCode]);
var userRoleCodeDef = new atna.construct.Code(userRole, userRole, userRoleCode);
var userParticipant = new atna.construct.ActiveParticipant(username, '', true, null, null, [userRoleCodeDef]);
var sourceTypeCode = new atna.construct.Code(atna.AUDIT_SRC_TYPE_UI, '', '');
var sourceIdent = new atna.construct.AuditSourceIdentification(null, sysname, sourceTypeCode);
var audit = new atna.construct.AuditMessage(eIdent, [sysParticipant, userParticipant], null, [sourceIdent]);
var xml = audit.toXML();
```

## Sending an Audit to an ATNA supported server

Connection Details

```js
var connDetails = {
  interface: 'udp|tls|tcp', // specify the interface to use when sending the audit
  host: 'localhost', // specify the host 
  port: 5050, // specify the port 
  options: { // when interface type is 'tls', you need to supply the certificate details
    key: fs.readFileSync('./path/to/key.pem').toString(), 
    cert: fs.readFileSync('./path/to/cert.pem').toString(),
    ca: fs.readFileSync('./path/to/cert.pem').toString(),
  }
}
```

Sending the Audit


```js
atna.send.sendAuditEvent(msg, connDetail, function (err) {
  // handle errors if needed
})
```

## Testing

To test the code you will need `xmllint` and `trang` on your PATH. `sudo apt-get install libxml2-utils trang`

Then run `npm test`
