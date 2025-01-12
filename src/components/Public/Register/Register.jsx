import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FiPlusCircle } from 'react-icons/fi';
import { HiUserGroup } from 'react-icons/hi';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  
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
  });

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
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
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
              className={`register-selection-card ${formData.joinExisting === false ? 'active' : ''}`}
              onClick={() => handleSelection(false)}
            >
              <div className="register-selection-icon">
                <FiPlusCircle />
              </div>
              <div className="register-selection-title">Create New Account</div>
              <div className="register-selection-description">
                Start fresh with a new account. Perfect for new users or new projects.
              </div>
            </div>
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
          <div>
            <p className="register-message">
              Request to join an existing tenant
            </p>
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
                Submit Request
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}