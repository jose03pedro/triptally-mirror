import React from 'react';

interface SuccessStepProps {
  onClose: () => void;
}

export function SuccessStep({ onClose }: SuccessStepProps) {
  return (
    <div className="text-center py-5">
      <h4 className="text-success mb-3">
        {/* Checkmark Icon (using inline SVG for compatibility) */}
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-check-circle-fill me-2" viewBox="0 0 16 16" style={{ verticalAlign: 'middle' }}>
          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.42 9.444 6.1 8.026a.75.75 0 0 0-1.12.974l2.5 3a.75.75 0 0 0 1.25-.01l4-5a.75.75 0 0 0-.02-1.08z"/>
        </svg>
        Profile **Saved**!
      </h4>
      <p className="text-secondary mb-4">
        Thank you for completing your Traveler Profile. We can now use this information to provide **tailored trip recommendations**.
      </p>
      <button 
        type="button" 
        className="btn btn-primary w-50" 
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
}