import { getConfig } from '../../../../config';

class EntraIdTokenService {
  getOrganizations(token) {
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    // The claim for tenant/organization info for Entra ID.
    // This should be configurable, e.g., 'roles', 'groups', or a custom claim like 'tid' for tenant ID.
    var orgClaimPath = getConfig().organizationClaim;
    console.log("decodedToken", decodedToken);

    console.log(`EntraIdTokenService: Looking for organizations using claim: '${orgClaimPath}'`);

    // If using 'tid' (tenant ID) as the organization identifier
    if (orgClaimPath === null || orgClaimPath === undefined) {
      orgClaimPath = 'tid';
    }

    let orgInfo = decodedToken[orgClaimPath];
    console.log("orgInfo", orgInfo);
    // If using 'roles' or another claim that might be an array or a single string
    if (Array.isArray(orgInfo)) {
      return orgInfo;
    } else if (orgInfo) {
      return [orgInfo];
    }
    
    console.warn(`EntraIdTokenService: No organization information found. Claim '${orgClaimPath}' is empty and no 'tid' available.`);
    return []; // Default to empty if no clear mapping or fallback
  }

  // Add other Entra ID specific token utility functions if needed
  // e.g., getAppRoles(decodedToken), getGroups(decodedToken)
}

export default EntraIdTokenService;
