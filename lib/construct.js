'use strict';

var js2xml = require('js2xmlparser');
var os = require('os');
var constants = require('./constants.js');

function Code(code, originalText, codeSystemName, displayName) {
  this['@'] = {
    'csd-code': code,
    originalText: originalText,
    codeSystemName: codeSystemName
  };
  if (displayName) {
    this['@'].displayName = displayName;
  }
}
Code.prototype.constructor = Code;
Code.prototype.toXML = function() {
  return js2xml('Code', this);
};
exports.Code = Code;

/**
 * ValuePair class
 *  
 * @param  {String} type the type 
 * @param  {String} val  the value, this will be automatically base64 encoded 
 */ 
function ValuePair(type, val) {
  this['@'] = {
    type: type,
    value: new Buffer(val).toString('base64')
  };
}
ValuePair.prototype.constructor = ValuePair;
ValuePair.prototype.toXML = function() {
  return js2xml('ValuePair', this);
};
exports.ValuePair = ValuePair;

function EventIdentification(actionCode, datetime, outcome, eventID, typeCode) {
  this['@'] = {
    EventActionCode: actionCode,
    EventDateTime: datetime.toISOString(),
    EventOutcomeIndicator: outcome
  };
  this.EventID = eventID;
  if (typeCode) {
    this.EventTypeCode = typeCode;
  }
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
    AuditSourceID: auditSourceId,
    code: auditSourceTypeCode['@']['csd-code'],
    codeSystemName: auditSourceTypeCode['@'].codeSystemName,
    originalText: auditSourceTypeCode['@'].originalText
  };
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
  if (auditSources && auditSources.length > 0) {
    this.AuditSourceIdentification = auditSources;
  }
  if (participantObjs && participantObjs.length > 0) {
    this.ParticipantObjectIdentification = participantObjs;
  }
}
AuditMessage.prototype.constructor = AuditMessage;
AuditMessage.prototype.toXML = function() {
  return js2xml('AuditMessage', this);
};
exports.AuditMessage = AuditMessage;

function wrapInSyslog(msg) {
  return '<85>1 ' + new Date().toISOString() + ' ' + os.hostname() + ' atna-audit.js ' + process.pid + ' IHE+RFC-3881 - ' + msg;
}
exports.wrapInSyslog = wrapInSyslog;

exports.userLoginAudit = function(outcome, sysname, hostname, username, userRole, userRoleCode) {
  var eventID = new Code(110114, 'UserAuthenticated', 'DCM');
  var typeCode = new Code(110122, 'Login', 'DCM');
  var eIdent = new EventIdentification(constants.EVENT_ACTION_EXECUTE, new Date(), outcome, eventID, typeCode);

  var sysRoleCode = new Code(110150, 'Application', 'DCM');
  var sysParticipant = new ActiveParticipant(sysname, '', false, hostname, constants.NET_AP_TYPE_DNS, [sysRoleCode]);

  var userRoleCodeDef = new Code(userRole, userRole, userRoleCode);
  var userParticipant = new ActiveParticipant(username, '', true, null, null, [userRoleCodeDef]);

  var sourceTypeCode = new Code(constants.AUDIT_SRC_TYPE_UI, '', '');
  var sourceIdent = new AuditSourceIdentification(null, sysname, sourceTypeCode);

  var audit = new AuditMessage(eIdent, [sysParticipant, userParticipant], null, [sourceIdent]);
  return  audit.toXML();
};

exports.appActivityAudit = function(isStart, sysname, hostname, username) {
  if (!username) {
    username = 'root';
  }

  var eventID = new Code(110100, 'Application Activity', 'DCM');
  var typeCode;
  if (isStart) {
    typeCode = new Code(110120, 'Application Start', 'DCM');
  } else {
    typeCode = new Code(110121, 'Application Stop', 'DCM');
  }
  var eIdent = new EventIdentification(constants.EVENT_ACTION_EXECUTE, new Date(), constants.OUTCOME_SUCCESS, eventID, typeCode);

  var sysRoleCode = new Code(110150, 'Application', 'DCM');
  var sysParticipant = new ActiveParticipant(sysname, '', false, hostname, constants.NET_AP_TYPE_DNS, [sysRoleCode]);

  var userRoleCodeDef = new Code(110151, 'Application Launcher', 'DCM');
  var userParticipant = new ActiveParticipant(username, '', true, null, null, [userRoleCodeDef]);

  var sourceTypeCode = new Code(constants.AUDIT_SRC_TYPE_WEB_SERVER, '', '');
  var sourceIdent = new AuditSourceIdentification(null, sysname, sourceTypeCode);

  var audit = new AuditMessage(eIdent, [sysParticipant, userParticipant], null, [sourceIdent]);
  return audit.toXML();
};

/**
 * Generates a 'Audit Log Used' audit message in XML format
 * @param  {Number} outcome       the desired outcome, e.g. atna.OUTCOME_SUCCESS.
 * @param  {String} sysname       the system name of the system that generated this audit.
 * @param  {String} hostname      the hostname of the system that generated this audit.
 * @param  {String} username      the username of the person viewing the audit
 * @param  {String} userRole      the user role of the person viewing the audit
 * @param  {String} userRoleCode  the role code of the person viewing the audit
 * @param  {String} auditLogURI   a URI identifying the used audit message
 * @param  {Object} objDetails    (optional) participant object details. Should be a ValuePair object
 * @return {String}               the xml of this audit message.
 */
exports.auditLogUsedAudit = function(outcome, sysname, hostname, username, userRole, userRoleCode, auditLogURI, objDetails) {
  var eventID = new Code(110101, 'Audit Log Used', 'DCM');
  var eIdent = new EventIdentification(constants.EVENT_ACTION_READ, new Date(), outcome, eventID, null);

  var sysRoleCode = new Code(110150, 'Application', 'DCM');
  var sysParticipant = new ActiveParticipant(sysname, '', false, hostname, constants.NET_AP_TYPE_DNS, [sysRoleCode]);

  var userRoleCodeDef = new Code(userRole, userRole, userRoleCode);
  var userParticipant = new ActiveParticipant(username, '', true, null, null, [userRoleCodeDef]);

  var sourceTypeCode = new Code(constants.AUDIT_SRC_TYPE_UI, '', '');
  var sourceIdent = new AuditSourceIdentification(null, sysname, sourceTypeCode);

  var objIdTypeCode = new Code(constants.OBJ_ID_TYPE_URI, 'URI');
  var participantObj = new ParticipantObjectIdentification(
    auditLogURI, constants.OBJ_TYPE_SYS_OBJ, constants.OBJ_TYPE_CODE_ROLE_SECURITY_RESOURCE, null, null, objIdTypeCode, 'Security Audit Log', objDetails
  );
  var audit = new AuditMessage(eIdent, [sysParticipant, userParticipant], [participantObj], [sourceIdent]);
  return  audit.toXML();
}

/*
 * Generates a node authentication audit.
 *  
 * @param  {String} nodeIP    the IP address of the node that attempted authentication.
 * @param  {String} sysname   the system name of the system that generated this audit.
 * @param  {String} hostname  the hostname of the system that generated this audit.
 * @param  {Number} outcome   the desired outcome, for authentication failure use atna.OUTCOME_MINOR_FAILURE.
 * @return {String}           the xml of this audit message.
 */ 
exports.nodeAuthentication = function (nodeIP, sysname, hostname, outcome) {
  var eventID = new Code(110113, 'Security Alert', 'DCM');
  var typeCode = new Code(110126, 'Node Authentication', 'DCM');
  var eIdent = new EventIdentification(constants.EVENT_ACTION_EXECUTE, new Date(), outcome, eventID, typeCode);
  
  var sysRoleCode = new Code(110150, 'Application', 'DCM');
  var sysParticipant = new ActiveParticipant(sysname, '', false, hostname, constants.NET_AP_TYPE_DNS, [sysRoleCode]);

  var objIdTypeCode = new Code(110182, 'Node ID', 'DCM');
  var nodeParticipant = new ParticipantObjectIdentification(nodeIP, 2, null, null, null, objIdTypeCode, nodeIP, null, null);
  
  var sourceTypeCode = new Code(constants.AUDIT_SRC_TYPE_WEB_SERVER, '', '');
  var sourceIdent = new AuditSourceIdentification(null, sysname, sourceTypeCode);
  
  var audit = new AuditMessage(eIdent, [sysParticipant], [nodeParticipant], [sourceIdent]);
  return audit.toXML();
};
