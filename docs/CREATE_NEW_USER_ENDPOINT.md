# Create New User Backend Endpoint Documentation

## Overview
This document describes the backend API endpoint required to support the "Create New User" functionality in the Tenant User Management component.

## Endpoint Details

### URL
```
POST /api/user-tenants/CreateNewUser
```

### Headers
```
Content-Type: application/json
Authorization: Bearer {token}
X-Tenant-Id: {tenantId}
```

### Request Body
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "tenantRoles": ["TenantAdmin", "TenantUser"]
}
```

### Request Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | The user's email address (must be unique, will be used for login) |
| `name` | string | Yes | The user's full name |
| `tenantRoles` | array[string] | Yes | Array of tenant roles to assign to the user |

### Valid Tenant Roles
- `TenantAdmin` - Full administrative access to the tenant
- `TenantUser` - Standard user access to tenant resources
- `TenantParticipant` - Limited participant access to tenant

### Response Format

#### Success Response (201 Created)
```json
{
  "userId": "auto-generated-uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "tenantRoles": [
    {
      "tenant": "tenant-id-from-header",
      "roles": ["TenantAdmin", "TenantUser"],
      "is_approved": true
    }
  ],
  "createdAt": "2026-01-25T10:30:00Z",
  "isLockedOut": false
}
```

#### Error Response Format (RFC 9110)
All error responses follow the RFC 9110 Problem Details format:

#### Error Response (409 Conflict - Email Already Exists)
```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.10",
  "title": "Conflict",
  "status": 409,
  "detail": "A user with this email already exists in the system."
}
```

#### Error Response (400 Bad Request - Validation Error)
```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "Bad Request",
  "status": 400,
  "detail": "Validation failed: Email is required and must be valid."
}
```

#### Error Response (401 Unauthorized)
```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.2",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Unauthorized access."
}
```

#### Error Response (403 Forbidden - Insufficient Permissions)
```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.4",
  "title": "Forbidden",
  "status": 403,
  "detail": "You do not have permission to create users in this tenant."
}
```

## Backend Implementation Requirements

### Business Logic
1. **Validate Input**
   - Ensure email is in valid format
   - Ensure email is unique across the system
   - Ensure name is not empty
   - Ensure at least one tenant role is provided
   - Validate that provided roles are from the allowed list

2. **User Creation**
   - Generate a unique `userId` (UUID recommended)
   - Create the user account in the authentication system
   - Hash and store temporary password or send password reset link
   - Set initial user status (not locked out by default)
   - Record creation timestamp

3. **Tenant Association**
   - Associate the user with the tenant specified in `X-Tenant-Id` header
   - Assign the specified roles to the user for that tenant
   - Set `is_approved` to `true` (since admin is creating the user)

4. **Authorization Check**
   - Verify that the requesting user has `TenantAdmin` role for the specified tenant
   - Return 403 if user lacks permission

5. **Notification (Optional but Recommended)**
   - Send welcome email to the newly created user
   - Include login credentials or password reset link
   - Include information about tenant access

### Database Operations
```sql
-- Pseudo-code for database operations

BEGIN TRANSACTION;

-- 1. Check if email already exists
SELECT * FROM users WHERE email = ?;
-- If exists, return 409

-- 2. Create user record
INSERT INTO users (user_id, email, name, created_at, is_locked_out)
VALUES (?, ?, ?, NOW(), false);

-- 3. Create user-tenant relationship
INSERT INTO user_tenants (user_id, tenant_id, is_approved, created_at)
VALUES (?, ?, true, NOW());

-- 4. Assign roles
INSERT INTO user_tenant_roles (user_id, tenant_id, role)
VALUES (?, ?, ?), (?, ?, ?), ...;  -- One per role in tenantRoles array

COMMIT;
```

### Security Considerations
1. **Email Validation**: Use server-side email validation
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Audit Logging**: Log user creation events for security auditing
4. **Input Sanitization**: Sanitize all input fields to prevent injection attacks
5. **Password Generation**: Generate secure temporary passwords or send secure password reset links
6. **Authorization**: Ensure only TenantAdmin users can create new users

## Frontend Integration

The frontend makes the API call through the `userTenantApi.createNewUser()` method:

```javascript
await userTenantApi.createNewUser(
  token,
  {
    email: "user@example.com",
    name: "John Doe",
    tenantRoles: ["TenantAdmin", "TenantUser"]
  },
  tenantId
);
```

## Error Handling

The server returns errors in **RFC 9110 Problem Details** format with the following fields:
- `type`: URI reference to the error type documentation
- `title`: Short, human-readable summary of the problem
- `status`: HTTP status code
- `detail`: Human-readable explanation specific to this occurrence

The frontend handles the following error scenarios by reading the `detail` field:
- **409**: User with email already exists
- **400**: Validation errors
- **401**: Unauthorized
- **403**: Insufficient permissions
- **500**: Server error

### Frontend Error Extraction
The frontend extracts the error message in this priority:
1. `detail` field (RFC 9110 format) - Primary
2. `errorMessage` field (custom format) - Fallback
3. `title` field - Fallback
4. Generic message

## Testing Checklist

- [ ] Create user with valid data succeeds
- [ ] Create user with duplicate email returns 409
- [ ] Create user with invalid email format returns 400
- [ ] Create user without required fields returns 400
- [ ] Create user with invalid roles returns 400
- [ ] Unauthorized request returns 401
- [ ] Non-admin user cannot create users (403)
- [ ] User is correctly associated with tenant
- [ ] Roles are correctly assigned
- [ ] Welcome email is sent (if implemented)
- [ ] Audit log entry is created

## Related Endpoints

This endpoint complements the existing:
- `POST /api/user-tenants/AddUserToCurrentTenant` - Adds existing user to tenant
- `GET /api/user-tenants/tenantUsers` - Lists users in tenant
- `PUT /api/user-tenants/updateTenantUser` - Updates user tenant roles
- `DELETE /api/user-tenants/` - Removes user from tenant

## Notes

- **userId Generation**: The backend should auto-generate the `userId` (typically a UUID). The frontend does NOT send this field.
- **Password Handling**: The endpoint should either:
  - Generate a temporary password and send it via email
  - Send a password reset/setup link to the user's email
  - Use an invitation flow where the user sets their own password
- **Multiple Roles**: Users can have multiple roles simultaneously within a tenant
- **Default State**: New users should be in an active (not locked out) state by default
