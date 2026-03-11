/**
 * Tenant roles - single source of truth for role definitions.
 * Used by UserForm, UserFormSettings, TenantUserManagement, and API documentation.
 */
export const TENANT_ROLES = [
  "TenantAdmin",
  "TenantUser",
  "TenantParticipant",
  "TenantParticipantAdmin",
];

export const TENANT_ROLE_METADATA = {
  TenantAdmin: {
    label: "Tenant Admin",
    description: "Full administrative access to the tenant",
  },
  TenantUser: {
    label: "Tenant User",
    description: "Standard user access to tenant resources",
  },
  TenantParticipant: {
    label: "Tenant Participant",
    description: "Limited participant access to tenant",
  },
  TenantParticipantAdmin: {
    label: "Tenant Participant Admin",
    description: "Administrative access to tenant participants",
  },
};
