import React, { useState, useRef } from 'react';

/**
 * FileUploadSection - Component for file upload with validation
 * Matches the green UI structure with blue theme
 */
const FileUploadSection = ({
  files = [],
  onFileUpload,
  onFileRemove,
  maxSize = 5,
  allowedTypes = ['.xls', '.xlf', '.xlsx', '.jpeg', '.jpg', '.png']
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
    
    // Validate file types
    const invalidFiles = fileArray.filter(file => {
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      return !allowedTypes.includes(extension);
    });

    if (invalidFiles.length > 0) {
      return `Invalid file type. Allowed: ${allowedTypes.join(', ')}`;
    }

    // Validate total size
    const currentSize = getTotalSize();
    const newSize = fileArray.reduce((sum, file) => sum + file.size, 0);
    
    if (currentSize + newSize > maxSizeBytes) {
      return `Total file size exceeds ${maxSize}MB limit`;
    }

    return null;
  };

  const handleAddFileClick = () => {
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

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['jpeg', 'jpg', 'png'].includes(extension)) {
      return 'bi-file-earmark-image';
    } else if (['xls', 'xlf', 'xlsx'].includes(extension)) {
      return 'bi-file-earmark-spreadsheet';
    }
    return 'bi-file-earmark';
  };

  return (
    <div className="file-upload-section-wrapper">
      {/* Header Row */}
      <div className="file-upload-header">
        <div className="file-upload-title">
          <i className="bi bi-paperclip me-2"></i>
          Document Upload
        </div>
        <div className="file-upload-info">
          <span className="text-muted small">
            Formats: {allowedTypes.join(', ')} | Max: {maxSize}MB
          </span>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        className="d-none"
        multiple
        accept={allowedTypes.join(',')}
        onChange={handleFileChange}
      />

      {/* File Upload Table */}
      <div className="file-upload-table-container">
        <table className="file-upload-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>S.No</th>
              <th>File Name</th>
              <th style={{ width: '100px' }}>Size</th>
              <th style={{ width: '100px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {files.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center text-muted py-4">
                  <i className="bi bi-cloud-upload fs-3 d-block mb-2"></i>
                  No files uploaded yet. Click "Add File" to upload.
                </td>
              </tr>
            ) : (
              files.map((file, index) => (
                <tr key={index}>
                  <td className="text-center">{index + 1}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <i className={`bi ${getFileIcon(file.name)} me-2 text-primary`}></i>
                      <span className="file-name-text">{file.name}</span>
                    </div>
                  </td>
                  <td className="text-muted small">{formatFileSize(file.size)}</td>
                  <td className="text-center">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger btn-remove-file"
                      onClick={() => handleRemove(index)}
                      title="Remove file"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Error Message */}
      {error && (
        <div className="file-upload-error">
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

      {/* Footer with Add File Button and Total Size */}
      <div className="file-upload-footer">
        <button
          type="button"
          className="btn btn-add-file"
          onClick={handleAddFileClick}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Add File
        </button>
        
        {files.length > 0 && (
          <div className="file-upload-summary">
            <span className="badge bg-primary">
              {files.length} file(s)
            </span>
            <span className="text-muted small ms-2">
              Total: {formatFileSize(getTotalSize())} / {maxSize}MB
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadSection;
