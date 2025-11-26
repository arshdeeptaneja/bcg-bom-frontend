import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BackButton } from '../../../../components/common';
import { useReviewAppeal } from './useReviewAppeal';
import './ReviewAppeal.css';

function ReviewAppeal() {
  const navigate = useNavigate();

  // Use custom hook for all data and logic
  const {
    data,
    context,
    formState,
    actions,
    isValid,
    isLoading,
    isError,
    error
  } = useReviewAppeal();

  // Loading state
  if (isLoading) {
    return (
      <div className="pageWrapper">
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p className="mt-3 text-muted">Loading appeal review data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="pageWrapper">
        <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
          <div className="headline d-flex flex-row justify-content-between align-items-center">
            <BackButton />
            <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Review Appeal</h1>
          </div>
        </div>
        <div className="pageWrapper-content m-3">
          <div className="alert alert-danger">
            <h5 className="alert-heading">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Error Loading Data
            </h5>
            <p className="mb-0">{error?.message || 'Failed to load appeal data. Please try again.'}</p>
            <hr />
            <button className="btn btn-outline-danger" onClick={() => window.location.reload()}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pageWrapper review-appeal-container">
      {/* Header Section */}
      <div className="pageWrapper-header review-appeal-header">
        <div className="headline d-flex flex-row justify-content-between align-items-center">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Review Appeal</h1>
        </div>
        <div className="d-flex gap-2">
          <span className="badge bg-primary">FY {context.financialYear}</span>
          <span className="badge bg-success">Annual Appraisal</span>
        </div>
      </div>

      <div className="pageWrapper-content review-appeal-content">
        {/* TODO: Add component sections */}
        <p>Component content will be added here...</p>
      </div>
    </div>
  );
}

export default ReviewAppeal;
