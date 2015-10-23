'use strict';

const js2xml = require('js2xmlparser');
const os = require('os');
const libxml = require('libxmljs');
const fs = require('fs');

var validate = true;

exports.disableValidation = () => validate = false;
exports.enableValidation = () => validate = true;

function Code(code, displayName, codeSystemName) {
  this['@'] = {
    code: code,
    displayName: displayName,
    codeSystemName: codeSystemName
  };
}
Code.prototype.constructor = Code;
Code.prototype.toXML = function() {
  return js2xml('Code', this);
};
exports.Code = Code;

function TypeValue(type, val) {
  this['@'] = {
    type: type,
    value: val
  };
}
TypeValue.prototype.constructor = TypeValue;
TypeValue.prototype.toXML = function() {
  return js2xml('TypeValue', this);
};
exports.TypeValue = TypeValue;

function EventIdentification(actionCode, datetime, outcome, eventID, typeCode) {
  this['@'] = {
    EventActionCode: actionCode,
    EventDateTime: datetime.toISOString(),
    EventOutcomeIndicator: outcome
  };
  this.EventID = eventID;
  this.EventTypeCode = typeCode;
}
EventIdentification.prototype.constructor = EventIdentification;
EventIdentification.prototype.toXML = function() {
  return js2xml('EventIdentification', this);
};
exports.EventIdentification = EventIdentification;

function ActiveParticipant(userId, altUserId, userIsRequestor, netAccessPointId, netAccessPointTypeCode, roleCodes) {
  this['@'] = {
    UserID: userId,
    AlternativeUserID: altUserId,
    UserIsRequestor: userIsRequestor
  };
  if (netAccessPointId) {
    this['@'].NetworkAccessPointID = netAccessPointId;
  }
  if (netAccessPointTypeCode) {
    this['@'].NetworkAccessPointTypeCode = netAccessPointTypeCode;
  }
  this.RoleIDCode = roleCodes;
}
ActiveParticipant.prototype.constructor = ActiveParticipant;
ActiveParticipant.prototype.toXML = function() {
  return js2xml('ActiveParticipant', this);
};
exports.ActiveParticipant = ActiveParticipant;

function ParticipantObjectIdentification(objId, objTypeCode, objTypeCodeRole, objDataLifeCycle, objSensitivity, objIdTypeCode, objName, objQuery, objDetails) {
  this['@'] = {
    ParticipantObjectID: objId
  };
  if (objTypeCode) {
    this['@'].ParticipantObjectTypeCode = objTypeCode;
  }
  if (objTypeCodeRole) {
    this['@'].ParticipantObjectTypeCodeRole = objTypeCodeRole;
  }
  if (objDataLifeCycle) {
    this['@'].ParticipantObjectDataLifeCycle = objDataLifeCycle;
  }
  if (objSensitivity) {
    this['@'].ParticipantObjectSensitivity = objSensitivity;
  }
  this.ParticipantObjectIDTypeCode = objIdTypeCode;
  if (objName) {
    this.ParticipantObjectName = objName;
  } else if (objQuery) {
    this.ParticipantObjectQuery = objQuery;
  }
  if (objDetails && objDetails.length > 0) {
    this.ParticipantObjectDetail = objDetails;
  }
}
ParticipantObjectIdentification.prototype.constructor = ParticipantObjectIdentification;
ParticipantObjectIdentification.prototype.toXML = function() {
  return js2xml('ParticipantObjectIdentification', this);
};
exports.ParticipantObjectIdentification = ParticipantObjectIdentification;

function AuditSourceIdentification(auditEnterpriseSiteId, auditSourceId, auditSourceTypeCode) {
  this['@'] = {
    AuditEnterpriseSiteID: auditEnterpriseSiteId,
    AuditSourceID: auditSourceId
  };
  this.AuditSourceTypeCode = auditSourceTypeCode;
}
AuditSourceIdentification.prototype.constructor = AuditSourceIdentification;
AuditSourceIdentification.prototype.toXML = function() {
  return js2xml('AuditSourceIdentification', this);
};
exports.AuditSourceIdentification = AuditSourceIdentification;

function AuditMessage(eventIdent, activeParticipants, participantObjs, auditSources) {
  if (eventIdent) {
    this.EventIdentification = eventIdent;
  }
  if (activeParticipants && activeParticipants.length > 0) {
    this.ActiveParticipant = activeParticipants;
  }
  if (participantObjs && participantObjs.lenght > 0) {
    this.ParticipantObjectIdentification = participantObjs;
  }
  if (auditSources && auditSources.length > 0) {
    this.AuditSourceIdentification = auditSources;
  }
}
AuditMessage.prototype.constructor = AuditMessage;
AuditMessage.prototype.toXML = function() {
  return js2xml('AuditMessage', this);
};
exports.AuditMessage = AuditMessage;

function validateAudit(auditXml) {
  var xsd = fs.readFileSync(`${__dirname}/rfc-3881.xsd`).toString();
  var xsdDoc = libxml.parseXml(xsd);
  var xml = libxml.parseXml(auditXml);
  if (!xml.validate(xsdDoc)) {
    throw new Error(`XML audit not valid according to XSD: \n ${xml.validationErrors}`);
  }
}
exports.validateAudit = validateAudit;

function wrapInSyslog(msg) {
  return `<85>1 ${new Date().toISOString()} ${os.hostname()} atna-audit.js ${process.pid} IHE+RFC-3881 - ${msg}`;
}
exports.wrapInSyslog = wrapInSyslog;

exports.userLoginAudit = function(outcome, sysname, hostname, username, userRole, userRoleCode) {
  let eventID = new Code(110114, 'UserAuthenticated', 'DCM');
  let typeCode = new Code(110122, 'Login', 'DCM');
  let eIdent = new EventIdentification('E', new Date(), outcome, eventID, typeCode);

  let sysRoleCode = new Code(110150, 'Application', 'DCM');
  let sysParticipant = new ActiveParticipant(sysname, '', true, hostname, 1, [sysRoleCode]);

  let userRoleCodeDef = new Code(userRole, userRole, userRoleCode);
  let userParticipant = new ActiveParticipant(username, '', true, null, null, [userRoleCodeDef]);

  let sourceTypeCode = new Code(1, '', '');
  let sourceIdent = new AuditSourceIdentification(null, sysname, sourceTypeCode);

  let audit = new AuditMessage(eIdent, [sysParticipant, userParticipant], null, [sourceIdent]);

  let xml = audit.toXML();
  if (validate) {
    validateAudit(xml);
  }
  return xml;
};

exports.appActivityAudit = function(isStart, sysname, hostname, username) {
  if (!username) {
    username = 'root';
  }

  let eventID = new Code(110100, 'Application Activity', 'DCM');
  let typeCode;
  if (isStart) {
    typeCode = new Code(110120, 'Application Start', 'DCM');
  } else {
    typeCode = new Code(110121, 'Application Stop', 'DCM');
  }
  let eIdent = new EventIdentification('E', new Date(), 0, eventID, typeCode);

  let sysRoleCode = new Code(110150, 'Application', 'DCM');
  let sysParticipant = new ActiveParticipant(sysname, '', true, hostname, 1, [sysRoleCode]);

  let userRoleCodeDef = new Code(110151, 'Application Launcher', 'DCM');
  let userParticipant = new ActiveParticipant(username, '', true, null, null, [userRoleCodeDef]);

  let sourceTypeCode = new Code(3, '', '');
  let sourceIdent = new AuditSourceIdentification(null, sysname, sourceTypeCode);

  let audit = new AuditMessage(eIdent, [sysParticipant, userParticipant], null, [sourceIdent]);

  let xml = audit.toXML();
  if (validate) {
    validateAudit(xml);
  }
  return xml;
};
