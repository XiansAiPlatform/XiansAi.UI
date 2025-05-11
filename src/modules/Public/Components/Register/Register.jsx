import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FiPlusCircle } from 'react-icons/fi';
import { HiUserGroup } from 'react-icons/hi';
import { useRegistrationApi } from '../../services/registration-api';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const registrationApi = useRegistrationApi();
  
  // Get step from URL or default to 1
  const getStepFromUrl = () => {
    const params = new URLSearchParams(location.search);
    const step = parseInt(params.get('step')) || 1;
    return step > 2 ? 1 : step;
  };

  const [step, setStep] = useState(getStepFromUrl());
  const [formData, setFormData] = useState({
    tenantName: '',
    companyUrl: '',
    companyEmail: '',
    subscription: 'Free',
    joinExisting: null,
    joinEmail: '',
  });

  const [emailError, setEmailError] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationDigits, setVerificationDigits] = useState(['', '', '', '', '', '']);
  const digitRefs = [
    React.useRef(null),
    React.useRef(null),
    React.useRef(null),
    React.useRef(null),
    React.useRef(null),
    React.useRef(null)
  ];

  // Add email validation function
  const validateCompanyEmail = (email) => {
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

  // Sync state with URL whenever location changes
  useEffect(() => {
    const currentStep = getStepFromUrl();
    const params = new URLSearchParams(location.search);
    const type = params.get('type');

    setStep(currentStep);
    
    if (currentStep === 1) {
      setFormData(prev => ({ ...prev, joinExisting: null }));
    } else if (currentStep === 2 && type) {
      setFormData(prev => ({ ...prev, joinExisting: type === 'join' }));
    }
  // eslint-disable-next-line
  }, [location.search]);

  const handleSelection = (joinExisting) => {
    const params = new URLSearchParams(location.search);
    params.set('step', '2');
    params.set('type', joinExisting ? 'join' : 'create');
    navigate(`${location.pathname}?${params.toString()}`);
    
    setFormData(prev => ({ ...prev, joinExisting }));
    setStep(2);
  };

  const handleBack = () => {
    navigate(location.pathname);
    setStep(1);
    setFormData(prev => ({ ...prev, joinExisting: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear email error when user types
    if (name === 'joinEmail') {
      setEmailError('');
    }
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    const error = validateCompanyEmail(formData.joinEmail);
    
    if (error) {
      setEmailError(error);
      return;
    }
    
    if (!showVerification) {
      setIsLoading(true);
      try {
        await registrationApi.sendVerificationCode(formData.joinEmail);
        setEmailError('');
        setVerificationError('');
        setShowVerification(true);
        // Reset verification digits when showing new input
        setVerificationDigits(['', '', '', '', '', '']);
        // Focus the first input after a short delay to allow for render
        setTimeout(() => digitRefs[0].current?.focus(), 50);
      } catch (error) {
        setEmailError(error.message || 'Failed to send verification code');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Handle verification code submission
      if (verificationDigits.some(digit => !digit)) {
        setVerificationError('Please enter all 6 digits');
        return;
      }
      
      setIsLoading(true);
      try {
        const code = verificationDigits.join('');
        const isValid = await registrationApi.validateVerificationCode(formData.joinEmail, code);
        if (isValid) {
          console.log('Verification successful');
          window.location.href = '/logout';
        } else {
          setVerificationError('Invalid verification code');
        }
      } catch (error) {
        setVerificationError(error.message || 'Invalid verification code');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDigitChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newDigits = [...verificationDigits];
    newDigits[index] = value;
    setVerificationDigits(newDigits);
    setVerificationError('');

    // Auto-focus next input
    if (value && index < 5) {
      digitRefs[index + 1].current?.focus();
    }
  };

  const handleDigitKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !verificationDigits[index] && index > 0) {
      digitRefs[index - 1].current?.focus();
    }
  };

  const handleDigitPaste = (index, e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newDigits = [...verificationDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pastedData[i];
      }
      setVerificationDigits(newDigits);
      setVerificationError('');
      // Focus the last input after pasting
      digitRefs[5].current?.focus();
    }
  };

  return (
    <div className="register-container">
      <div className="register-form-wrapper">
        <Link to="/" className="register-logo-container">
          <div className="register-logo">
            <span className="register-logo-flow">Xians</span> {' '}
            <span className="register-logo-ai">.ai</span>
          </div>
          <div className="register-logo-sub">
            <span className="register-logo-by">powered by</span>
            <img 
              src="/images/99xlogo.svg" 
              alt="99x Logo" 
              className="register-logo-99x"
            />
          </div>
        </Link>
        
        <h2 className="register-title">Let's Create Your New Account</h2>
        <div className="register-step">Step {step} of 2</div>
        
        {step === 1 && (
          <div className="register-selection-container">
            <div
              className={`register-selection-card ${formData.joinExisting === true ? 'active' : ''}`}
              onClick={() => handleSelection(true)}
            >
              <div className="register-selection-icon">
                <HiUserGroup />
              </div>
              <div className="register-selection-title">Join Existing Account</div>
              <div className="register-selection-description">
                Join an existing account with your team. Ideal for collaboration.
              </div>
            </div>
            <div
              className={`register-selection-card disabled ${formData.joinExisting === false ? 'active' : ''}`}
            >
              <div className="register-selection-icon">
                <FiPlusCircle />
              </div>
              <div className="register-selection-title">Create New Account</div>
              <div className="register-selection-description">
                Start fresh with a new account. Perfect for new users or new projects.
              </div>
            </div>
          </div>
        )}

        {step === 2 && formData.joinExisting === false && (
          <form onSubmit={handleSubmit}>
            <div className="register-form-grid">
              <div>
                <div className="register-form-group">
                  <label className="register-label">Tenant Name</label>
                  <input
                    type="text"
                    name="tenantName"
                    value={formData.tenantName}
                    onChange={handleChange}
                    required
                    className="register-input"
                    placeholder="Enter tenant name"
                  />
                </div>
                <div className="register-form-group">
                  <label className="register-label">Company URL</label>
                  <input
                    type="url"
                    name="companyUrl"
                    value={formData.companyUrl}
                    onChange={handleChange}
                    required
                    className="register-input"
                    placeholder="https://"
                  />
                </div>
              </div>
              <div>
                <div className="register-form-group">
                  <label className="register-label">Company Email</label>
                  <input
                    type="email"
                    name="companyEmail"
                    value={formData.companyEmail}
                    onChange={handleChange}
                    required
                    className="register-input"
                    placeholder="your@company.com"
                  />
                </div>
                <div className="register-form-group">
                  <label className="register-label">Subscription</label>
                  <select
                    name="subscription"
                    value={formData.subscription}
                    onChange={handleChange}
                    className="register-select"
                  >
                    <option value="Free">Free</option>
                    <option value="Standard">Standard</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="register-button-container">
              <button
                type="button"
                onClick={handleBack}
                className="register-button register-button-secondary"
              >
                Back
              </button>
              <button
                type="submit"
                className="register-button register-button-primary"
              >
                Register
              </button>
            </div>
          </form>
        )}

        {step === 2 && formData.joinExisting === true && (
          <form onSubmit={handleJoinSubmit}>
            <div className="register-form-group">
              <label className="register-label">Company Email</label>
              <input
                type="email"
                name="joinEmail"
                value={formData.joinEmail}
                onChange={handleChange}
                className={`register-input ${emailError ? 'register-input-error' : ''}`}
                placeholder="your@company.com"
                required
                disabled={showVerification}
              />
              {emailError && (
                <div className="register-error-message">{emailError}</div>
              )}
            </div>
            
            {showVerification && (
              <div className="register-form-group">
                <div className="register-verification-message">
                  We've sent a verification code to {formData.joinEmail}
                </div>
                <label className="register-label">Verification Code</label>
                <div className="register-verification-inputs">
                  {verificationDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={digitRefs[index]}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(index, e)}
                      onPaste={(e) => handleDigitPaste(index, e)}
                      className={`register-verification-digit ${verificationError ? 'register-input-error' : ''}`}
                      required
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
                {verificationError && (
                  <div className="register-error-message">{verificationError}</div>
                )}
              </div>
            )}
            
            <div className="register-button-container">
              {!isLoading && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="register-button register-button-secondary"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                className="register-button register-button-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : (showVerification ? 'Verify & Submit' : 'Send Verification Code')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}