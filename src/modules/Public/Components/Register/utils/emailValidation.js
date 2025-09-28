// Email validation utility for company email addresses
export const validateCompanyEmail = (email) => {
  const commonDomains = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'aol.com',
    'icloud.com',
    'mail.com'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (!email) {
    return 'Email is required';
  }
  
  if (!email.includes('@')) {
    return 'Please enter a valid email address';
  }
  
  if (commonDomains.includes(domain)) {
    return 'Please use your company email address';
  }
  
  return '';
};
