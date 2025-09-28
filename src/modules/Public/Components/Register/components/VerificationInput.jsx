import { useRef, useState, useEffect } from 'react';

export default function VerificationInput({ 
  onSubmit, 
  error, 
  clearError
}) {
  const [verificationDigits, setVerificationDigits] = useState(['', '', '', '', '', '']);
  const digitRef0 = useRef(null);
  const digitRef1 = useRef(null);
  const digitRef2 = useRef(null);
  const digitRef3 = useRef(null);
  const digitRef4 = useRef(null);
  const digitRef5 = useRef(null);
  const digitRefs = [digitRef0, digitRef1, digitRef2, digitRef3, digitRef4, digitRef5];

  const handleDigitChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newDigits = [...verificationDigits];
    newDigits[index] = value;
    setVerificationDigits(newDigits);
    
    // Clear error when user types
    if (clearError) {
      clearError();
    }

    // Auto-focus next input
    if (value && index < 5) {
      digitRefs[index + 1].current?.focus();
    }

    // Auto-submit when all digits are filled
    if (index === 5 && value) {
      const code = [...newDigits.slice(0, 5), value].join('');
      onSubmit(code);
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
      if (clearError) {
        clearError();
      }
      // Focus the last input after pasting
      digitRefs[5].current?.focus();
      // Auto-submit
      onSubmit(pastedData);
    }
  };

  // Focus first input when component mounts
  useEffect(() => {
    setTimeout(() => digitRefs[0].current?.focus(), 50);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
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
          className={`register-verification-digit ${error ? 'register-input-error' : ''}`}
          required
          autoFocus={index === 0}
        />
      ))}
    </div>
  );
}
