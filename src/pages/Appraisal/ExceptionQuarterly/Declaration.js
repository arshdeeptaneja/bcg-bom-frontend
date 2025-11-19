import React, { useState, useEffect } from 'react';
import { saveAppraisalData } from './localStorageHelpers';
import './QuarterlyException.css';

function DeclarationSection({ onDeclarationChange, employeeName = 'Employee', isSubmitDisabled = false }) {
  const [file, setFile] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState('');

  // Load previously saved data
  useEffect(() => {
    const stored = localStorage.getItem('appraisalDeclaration');
    if (stored) {
      const parsed = JSON.parse(stored);
      setIsChecked(parsed.isChecked || false);
      // Note: We can't restore the actual file object, only the name
      if (parsed.fileName) {
        setFile({ name: parsed.fileName });
      }
    }
  }, []);

  // Notify parent when file or checkbox changes
  useEffect(() => {
    if (onDeclarationChange) {
      onDeclarationChange(file, isChecked);
    }
  }, [file, isChecked, onDeclarationChange]);

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setIsChecked(checked);

    // Save to localStorage
    const declarationData = {
      isChecked: checked,
      fileName: file?.name || null,
    };
    localStorage.setItem('appraisalDeclaration', JSON.stringify(declarationData));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'application/pdf', 'image/png'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Only JPG, JPEG, PNG, or PDF files are allowed.');
      setFile(null);
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError('');

    // Save to localStorage
    const declarationData = {
      isChecked,
      fileName: selectedFile.name,
    };
    localStorage.setItem('appraisalDeclaration', JSON.stringify(declarationData));
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError('');
    // Update localStorage
    const declarationData = {
      isChecked,
      fileName: null,
    };
    localStorage.setItem('appraisalDeclaration', JSON.stringify(declarationData));
  };

  return (
    <div className="declaration-section p-3">
      {/* Checkbox */}
      <div className="form-check d-flex align-items-start gap-2 mb-3">
        <input
          type="checkbox"
          className="form-check-input"
          id="declarationCheck"
          checked={isChecked}
          onChange={handleCheckboxChange}
        />
        <label htmlFor="declarationCheck" className="form-check-label">
          I <b>{employeeName}</b> hereby declare that all the information/documents submitted by me in
          the exception are correct, true, and valid. I shall be held accountable in case any
          irrelevant or invalid information/documents are found.
        </label>
      </div>

      {/* File Upload */}
      <div className="file-upload-bar d-flex align-items-center justify-content-between gap-3 p-2 rounded">
        <div className="d-flex align-items-center flex-grow-1">
          {/* Green custom button */}
          <label
            htmlFor="fileInput"
            className={`btn px-4 ${!isChecked ? 'disabled' : ''}`}
            style={{
              backgroundColor: isChecked ? 'var(--accent-color)' : '#ccc',
              color: '#fff',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              cursor: isChecked ? 'pointer' : 'not-allowed',
            }}
          >
            Select a File
          </label>

          {/* HIDDEN REAL FILE INPUT */}
          <input
            id="fileInput"
            type="file"
            accept=".jpg,.jpeg,.pdf,.png"
            onChange={handleFileChange}
            disabled={!isChecked}
            style={{ display: 'none' }}
          />

          {/* File name display box */}
          <div
            className="px-3 py-2"
            style={{
              border: '1px solid #ccc',
              borderLeft: 'none',
              width: '16rem',
              background: '#fff',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              color: '#333',
              fontSize: '14px',
              borderTopRightRadius: '4px',
              borderBottomRightRadius: '4px',
            }}
          >
            {file ? file.name : 'No file selected'}
          </div>

          {/* Remove file button */}
          {file && (
            <button
              type="button"
              className="btn btn-outline-danger ms-2"
              onClick={handleRemoveFile}
              style={{ padding: '6px 12px' }}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>
      </div>

      {/* Error / File Info */}
      <div className="mt-2">
        {error && <small className="text-danger d-block">{error}</small>}
        {file && (
          <small className="text-success d-block">
            File selected: <b>{file.name}</b>
          </small>
        )}
        <small className="text-muted">
          Allowable Formats for Upload: .jpeg, .jpg, .png, .pdf | Max Size: 5 MB
        </small>
      </div>

      {/* Success Popup */}
      {showPopup && (
        <div
          className="popup-overlay d-flex align-items-center justify-content-center"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 9999,
          }}
        >
          <div
            className="popup-content text-center p-4 rounded shadow"
            style={{
              background: '#fff',
              color: 'var(--accent-color)',
              maxWidth: '420px',
              width: '90%',
            }}
          >
            <p className="mb-2" style={{ fontSize: '16px' }}>
              Your Exception has been registered successfully!
            </p>
            <h5 className="fw-bold mb-3">Exception #101</h5>
            <p className="mb-4">For any further doubt and queries kindly contact your respective HR.</p>
            <button
              className="btn px-4"
              style={{
                backgroundColor: 'var(--accent-color)',
                color: '#fff',
                fontWeight: 500,
              }}
              onClick={() => setShowPopup(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeclarationSection;
