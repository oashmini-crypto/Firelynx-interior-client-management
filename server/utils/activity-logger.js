const { db, activityLogs } = require('../database');

/**
 * Activity Logger Utility
 * Provides convenient functions to log various activities throughout the application
 */

// Action types enum for consistency
const ACTION_TYPES = {
  // File operations
  FILE_UPLOAD: 'file_upload',
  FILE_DELETE: 'file_delete',
  FILE_VISIBILITY_CHANGE: 'file_visibility_change',
  
  // Milestone operations
  MILESTONE_CREATE: 'milestone_create',
  MILESTONE_UPDATE: 'milestone_update',
  MILESTONE_COMPLETE: 'milestone_complete',
  MILESTONE_DELETE: 'milestone_delete',
  
  // Approval operations
  APPROVAL_CREATE: 'approval_create',
  APPROVAL_SEND: 'approval_send',
  APPROVAL_APPROVE: 'approval_approve',
  APPROVAL_REJECT: 'approval_reject',
  APPROVAL_DELETE: 'approval_delete',
  
  // Variation operations
  VARIATION_CREATE: 'variation_create',
  VARIATION_SUBMIT: 'variation_submit',
  VARIATION_APPROVE: 'variation_approve',
  VARIATION_REJECT: 'variation_reject',
  VARIATION_UPDATE: 'variation_update',
  VARIATION_DELETE: 'variation_delete',
  
  // Invoice operations
  INVOICE_CREATE: 'invoice_create',
  INVOICE_SEND: 'invoice_send',
  INVOICE_PAID: 'invoice_paid',
  INVOICE_UPDATE: 'invoice_update',
  INVOICE_DELETE: 'invoice_delete',
  
  // Ticket operations
  TICKET_CREATE: 'ticket_create',
  TICKET_ASSIGN: 'ticket_assign',
  TICKET_UPDATE: 'ticket_update',
  TICKET_CLOSE: 'ticket_close',
  TICKET_REOPEN: 'ticket_reopen',
  
  // Team operations
  TEAM_ADD_MEMBER: 'team_add_member',
  TEAM_REMOVE_MEMBER: 'team_remove_member',
  TEAM_CHANGE_ROLE: 'team_change_role',
  
  // Project operations
  PROJECT_CREATE: 'project_create',
  PROJECT_UPDATE: 'project_update',
  PROJECT_STATUS_CHANGE: 'project_status_change',
  PROJECT_DELETE: 'project_delete'
};

/**
 * Core logging function
 * @param {string} projectId - The project ID
 * @param {string} userId - The user ID performing the action
 * @param {string} actionType - The type of action (use ACTION_TYPES)
 * @param {string} description - Human-readable description of the action
 * @param {object} metadata - Additional data about the action
 */
async function logActivity(projectId, userId, actionType, description, metadata = null) {
  try {
    if (!projectId || !userId || !actionType || !description) {
      console.warn('⚠️ Activity log skipped - missing required fields:', { projectId, userId, actionType, description });
      return null;
    }

    const logEntry = await db.insert(activityLogs).values({
      projectId,
      userId,
      actionType,
      description,
      metadata
    }).returning();

    console.log(`📝 Activity logged: ${actionType} by user ${userId} in project ${projectId}`);
    return logEntry[0];
  } catch (error) {
    console.error('❌ Failed to log activity:', error);
    return null;
  }
}

/**
 * Convenience functions for common activities
 */

// File operations
async function logFileUpload(projectId, userId, fileName, fileType, milestoneId = null) {
  const description = milestoneId 
    ? `Uploaded file "${fileName}" to milestone`
    : `Uploaded file "${fileName}"`;
  
  return logActivity(projectId, userId, ACTION_TYPES.FILE_UPLOAD, description, {
    fileName,
    fileType,
    milestoneId
  });
}

async function logFileDelete(projectId, userId, fileName) {
  return logActivity(projectId, userId, ACTION_TYPES.FILE_DELETE, `Deleted file "${fileName}"`, {
    fileName
  });
}

async function logFileVisibilityChange(projectId, userId, fileName, oldVisibility, newVisibility) {
  return logActivity(projectId, userId, ACTION_TYPES.FILE_VISIBILITY_CHANGE, 
    `Changed file "${fileName}" visibility from ${oldVisibility} to ${newVisibility}`, {
    fileName,
    oldVisibility,
    newVisibility
  });
}

// Milestone operations
async function logMilestoneCreate(projectId, userId, milestoneTitle) {
  return logActivity(projectId, userId, ACTION_TYPES.MILESTONE_CREATE, 
    `Created milestone "${milestoneTitle}"`, { milestoneTitle });
}

async function logMilestoneUpdate(projectId, userId, milestoneTitle, changes) {
  return logActivity(projectId, userId, ACTION_TYPES.MILESTONE_UPDATE, 
    `Updated milestone "${milestoneTitle}"`, { milestoneTitle, changes });
}

async function logMilestoneComplete(projectId, userId, milestoneTitle) {
  return logActivity(projectId, userId, ACTION_TYPES.MILESTONE_COMPLETE, 
    `Completed milestone "${milestoneTitle}"`, { milestoneTitle });
}

// Approval operations
async function logApprovalCreate(projectId, userId, approvalTitle, approvalNumber) {
  return logActivity(projectId, userId, ACTION_TYPES.APPROVAL_CREATE, 
    `Created approval packet "${approvalTitle}" (${approvalNumber})`, { 
    approvalTitle, 
    approvalNumber 
  });
}

async function logApprovalSend(projectId, userId, approvalNumber) {
  return logActivity(projectId, userId, ACTION_TYPES.APPROVAL_SEND, 
    `Sent approval packet ${approvalNumber} to client`, { approvalNumber });
}

async function logApprovalDecision(projectId, userId, approvalNumber, decision) {
  const actionType = decision === 'approved' ? ACTION_TYPES.APPROVAL_APPROVE : ACTION_TYPES.APPROVAL_REJECT;
  return logActivity(projectId, userId, actionType, 
    `Approval packet ${approvalNumber} was ${decision}`, { approvalNumber, decision });
}

// Variation operations
async function logVariationCreate(projectId, userId, variationNumber, title) {
  return logActivity(projectId, userId, ACTION_TYPES.VARIATION_CREATE, 
    `Created variation request ${variationNumber}: "${title}"`, { 
    variationNumber, 
    title 
  });
}

async function logVariationSubmit(projectId, userId, variationNumber) {
  return logActivity(projectId, userId, ACTION_TYPES.VARIATION_SUBMIT, 
    `Submitted variation request ${variationNumber} for approval`, { variationNumber });
}

async function logVariationDecision(projectId, userId, variationNumber, decision, amount = null) {
  const actionType = decision === 'approved' ? ACTION_TYPES.VARIATION_APPROVE : ACTION_TYPES.VARIATION_REJECT;
  const amountText = amount ? ` (${amount})` : '';
  return logActivity(projectId, userId, actionType, 
    `Variation request ${variationNumber} was ${decision}${amountText}`, { 
    variationNumber, 
    decision, 
    amount 
  });
}

// Invoice operations
async function logInvoiceCreate(projectId, userId, invoiceNumber, amount) {
  return logActivity(projectId, userId, ACTION_TYPES.INVOICE_CREATE, 
    `Created invoice ${invoiceNumber} for ${amount}`, { 
    invoiceNumber, 
    amount 
  });
}

async function logInvoiceSend(projectId, userId, invoiceNumber) {
  return logActivity(projectId, userId, ACTION_TYPES.INVOICE_SEND, 
    `Sent invoice ${invoiceNumber} to client`, { invoiceNumber });
}

async function logInvoicePaid(projectId, userId, invoiceNumber, amount) {
  return logActivity(projectId, userId, ACTION_TYPES.INVOICE_PAID, 
    `Invoice ${invoiceNumber} marked as paid (${amount})`, { 
    invoiceNumber, 
    amount 
  });
}

// Ticket operations
async function logTicketCreate(projectId, userId, ticketNumber, subject) {
  return logActivity(projectId, userId, ACTION_TYPES.TICKET_CREATE, 
    `Created ticket ${ticketNumber}: "${subject}"`, { 
    ticketNumber, 
    subject 
  });
}

async function logTicketAssign(projectId, userId, ticketNumber, assigneeName) {
  return logActivity(projectId, userId, ACTION_TYPES.TICKET_ASSIGN, 
    `Assigned ticket ${ticketNumber} to ${assigneeName}`, { 
    ticketNumber, 
    assigneeName 
  });
}

async function logTicketStatusChange(projectId, userId, ticketNumber, oldStatus, newStatus) {
  const actionType = newStatus === 'Closed' ? ACTION_TYPES.TICKET_CLOSE : 
                    newStatus === 'Open' && oldStatus === 'Closed' ? ACTION_TYPES.TICKET_REOPEN : 
                    ACTION_TYPES.TICKET_UPDATE;
  
  return logActivity(projectId, userId, actionType, 
    `Changed ticket ${ticketNumber} status from ${oldStatus} to ${newStatus}`, { 
    ticketNumber, 
    oldStatus, 
    newStatus 
  });
}

// Team operations
async function logTeamMemberAdd(projectId, userId, memberName, role) {
  return logActivity(projectId, userId, ACTION_TYPES.TEAM_ADD_MEMBER, 
    `Added ${memberName} to project team as ${role}`, { 
    memberName, 
    role 
  });
}

async function logTeamMemberRemove(projectId, userId, memberName) {
  return logActivity(projectId, userId, ACTION_TYPES.TEAM_REMOVE_MEMBER, 
    `Removed ${memberName} from project team`, { memberName });
}

async function logTeamRoleChange(projectId, userId, memberName, oldRole, newRole) {
  return logActivity(projectId, userId, ACTION_TYPES.TEAM_CHANGE_ROLE, 
    `Changed ${memberName}'s role from ${oldRole} to ${newRole}`, { 
    memberName, 
    oldRole, 
    newRole 
  });
}

// Project operations
async function logProjectCreate(projectId, userId, projectTitle) {
  return logActivity(projectId, userId, ACTION_TYPES.PROJECT_CREATE, 
    `Created project "${projectTitle}"`, { projectTitle });
}

async function logProjectUpdate(projectId, userId, projectTitle, changes) {
  return logActivity(projectId, userId, ACTION_TYPES.PROJECT_UPDATE, 
    `Updated project "${projectTitle}"`, { projectTitle, changes });
}

async function logProjectStatusChange(projectId, userId, projectTitle, oldStatus, newStatus) {
  return logActivity(projectId, userId, ACTION_TYPES.PROJECT_STATUS_CHANGE, 
    `Changed project "${projectTitle}" status from ${oldStatus} to ${newStatus}`, { 
    projectTitle, 
    oldStatus, 
    newStatus 
  });
}

module.exports = {
  ACTION_TYPES,
  logActivity,
  
  // File operations
  logFileUpload,
  logFileDelete,
  logFileVisibilityChange,
  
  // Milestone operations
  logMilestoneCreate,
  logMilestoneUpdate,
  logMilestoneComplete,
  
  // Approval operations
  logApprovalCreate,
  logApprovalSend,
  logApprovalDecision,
  
  // Variation operations
  logVariationCreate,
  logVariationSubmit,
  logVariationDecision,
  
  // Invoice operations
  logInvoiceCreate,
  logInvoiceSend,
  logInvoicePaid,
  
  // Ticket operations
  logTicketCreate,
  logTicketAssign,
  logTicketStatusChange,
  
  // Team operations
  logTeamMemberAdd,
  logTeamMemberRemove,
  logTeamRoleChange,
  
  // Project operations
  logProjectCreate,
  logProjectUpdate,
  logProjectStatusChange
};