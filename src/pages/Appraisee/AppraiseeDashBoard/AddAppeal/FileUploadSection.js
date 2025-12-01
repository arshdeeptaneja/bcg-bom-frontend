import React, { useState, useRef } from 'react';

const FileUploadSection = ({
  files = [],
  onFileUpload,
  onFileRemove,
  maxSize = 5,
  allowedTypes = ['.zip', '.pdf', '.jpeg', '.jpg', '.png']
}) => {
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const maxSizeBytes = maxSize * 1024 * 1024;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getTotalSize = () => {
    return files.reduce((sum, file) => sum + file.size, 0);
  };

  const validateFiles = (fileList) => {
    const fileArray = Array.from(fileList);
    
    const invalidFiles = fileArray.filter(file => {
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      return !allowedTypes.includes(extension);
    });

    if (invalidFiles.length > 0) {
      return `Invalid file type. Allowed: ${allowedTypes.join(', ')}`;
    }

    const currentSize = getTotalSize();
    const newSize = fileArray.reduce((sum, file) => sum + file.size, 0);
    
    if (currentSize + newSize > maxSizeBytes) {
      return `Total file size exceeds ${maxSize}MB limit`;
    }

    return null;
  };

  const handleSelectFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const validationError = validateFiles(fileList);
    if (validationError) {
      setError(validationError);
      e.target.value = '';
      return;
    }

    try {
      setError('');
      onFileUpload(fileList);
      e.target.value = '';
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemove = (index) => {
    setError('');
    onFileRemove(index);
  };

  return (
    <div className="file-upload-simple">
      <input
        type="file"
        ref={fileInputRef}
        className="d-none"
        multiple
        accept={allowedTypes.join(',')}
        onChange={handleFileChange}
      />

      <button
        type="button"
        className="btn btn-select-file"
        onClick={handleSelectFileClick}
      >
        Select a File
      </button>

      <p className="file-upload-format-info">
        <strong>Allowable Formats for Upload:</strong> {allowedTypes.join(', ')}
      </p>
      <p className="file-upload-size-info">
        <strong>Allowable Upload Size:</strong> {maxSize} MB
      </p>

      {error && (
        <div className="file-upload-error mt-2">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button 
            type="button" 
            className="btn-close btn-close-sm ms-2" 
            onClick={() => setError('')}
            aria-label="Close"
          ></button>
        </div>
      )}

      {files.length > 0 && (
        <div className="selected-files-list mt-3">
          <p className="mb-2"><strong>Selected Files ({files.length}):</strong></p>
          <ul className="list-unstyled mb-0">
            {files.map((file, index) => (
              <li key={index} className="d-flex align-items-center justify-content-between py-1">
                <span className="text-muted small">
                  <i className="bi bi-file-earmark me-2"></i>
                  {file.name} ({formatFileSize(file.size)})
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleRemove(index)}
                  title="Remove file"
                >
                  <i className="bi bi-x"></i>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUploadSection;
