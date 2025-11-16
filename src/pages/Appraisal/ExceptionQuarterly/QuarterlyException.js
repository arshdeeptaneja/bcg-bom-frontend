import React, { useState, useEffect, useCallback } from 'react';
import { BackButton } from '../../../components/common';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import './QuarterlyException.css';
import { CheckInDescriptionSection } from '../../../components/Appraisal';
import MeasurableKRA from './NonDiscretionaryKRA/MeasurableKRA/MeasurableKRA';
import NonMeasurableKRA from './NonDiscretionaryKRA/NonMeasurableKRA/NonMeasurableKRA';
import DeclarationSection from './Declaration';
import { appraisalAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { loadAppraisalData, saveAppraisalData } from './localStorageHelpers';
import LoadingSpinner from '../../../components/Spinner';

function QuarterlyException() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { financialYear, appraisalPeriod, quarter, dateRange, employee, role } = location.state || {
    financialYear: '2025',
    appraisalPeriod: 'Quarterly',
    quarter: 'Q1',
    dateRange: '01 Apr 2025 - 30 Jun 2025',
    employee: {
      empNo: user?.empNo || 'arogya',
      employeeName: user?.EMP_NAME || 'Employee Name',
      branch: user?.BRANCH_UNIT_TYPE || 'Branch',
      primaryRole: 'Primary Role',
      appraiser: 'Appraiser Name',
      roles: user?.roles || [],
    },
    role: 'APPRAISEE',
  };

  const [currentRole, setCurrentRole] = useState(role || 'APPRAISEE');
  const [declarationFile, setDeclarationFile] = useState(null);
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiData, setApiData] = useState(null);

  // Fetch exception report data
  const {
    data: exceptionData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['quarterlyExceptionReport', employee.empNo, financialYear, quarter],
    queryFn: () =>
      appraisalAPI.getQuarterlyExceptionReport({
        urlId: employee.empNo,
        financialYear: financialYear.replace('FY ', '').split('-')[0] || financialYear,
        quarter: quarter,
      }),
    enabled: !!employee.empNo && !!financialYear && !!quarter,
    onSuccess: (data) => {
      setApiData(data);
      // Initialize localStorage with API data if needed
      if (data && data.kraData) {
        saveAppraisalData({
          measurableKRA: data.measurableKRA || {},
          nonMeasurableKRA: data.nonMeasurableKRA || {},
        });
      }
    },
    onError: (err) => {
      console.error('Failed to fetch exception report:', err);
      toast.error('Failed to load exception report data');
    },
  });

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: ({ payload, attachment }) =>
      appraisalAPI.submitQuarterlyExceptionReport(payload, attachment),
    onSuccess: (data) => {
      toast.success('Exception submitted successfully!');
      // Clear localStorage after successful submission
      localStorage.removeItem('appraisalFormData');
      localStorage.removeItem('appraisalDeclaration');
      setIsSubmitting(false);
      // Navigate back or show success
      navigate(-1);
    },
    onError: (error) => {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit exception');
      setIsSubmitting(false);
    },
  });

  const handleRoleChange = (e) => {
    setCurrentRole(e.target.value);
  };

  const isEditableBy = (fieldOwner) => {
    switch (currentRole) {
      case 'APPRAISEE':
        return fieldOwner === 'appraisee';
      case 'APPRAISER':
        return fieldOwner === 'appraiser';
      case 'REVIEWER':
        return fieldOwner === 'reviewer';
      default:
        return false;
    }
  };

  const handleDeclarationChange = useCallback((file, checked) => {
    setDeclarationFile(file);
    setDeclarationChecked(checked);
  }, []);

  const handleSave = () => {
    const currentData = loadAppraisalData();
    saveAppraisalData(currentData);
    toast.success('Draft saved successfully!');
  };

  const handleSubmit = () => {
    // Validation
    if (!declarationChecked) {
      toast.error('Please agree to the declaration before submitting.');
      return;
    }

    if (!declarationFile) {
      toast.error('Please upload a file before submitting.');
      return;
    }

    setIsSubmitting(true);

    // Collect all KRA data from localStorage
    const formData = loadAppraisalData();

    // Build the payload according to the API spec
    const payload = {
      kraData: formData.measurableKRA
        ? Object.entries(formData.measurableKRA).flatMap(([month, items]) =>
            items.map((item) => ({
              month: month,
              kra: item.kra,
              unit: item.unit,
              actual: item.actual,
              target: item.target,
              maxScore: item.maxScore,
              score: item.score,
              category: item.category,
              comment: item.comment || '',
            }))
          )
        : [],
      financialYear: parseInt(financialYear.replace('FY ', '').split('-')[0]) || 2025,
      empNo: employee.empNo,
      endDate: dateRange ? dateRange.split(' - ')[1] : '',
      quarter: quarter,
      declarationOption: declarationChecked ? 'AGREED' : 'NOT_AGREED',
      startDate: dateRange ? dateRange.split(' - ')[0] : '',
      reportingAuthorityNo: employee.appraiser?.empNo || employee.appraiser || '',
      id: exceptionData?.id || '',
    };

    // Submit with file
    submitMutation.mutate({
      payload: payload,
      attachment: declarationFile,
    });
  };

  if (isLoading) {
    return (
      <div className="pageWrapper">
        <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
          <div className="headline d-flex flex-row justify-content-between align-items-center">
            <BackButton />
            <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Quarterly Exception</h1>
          </div>
        </div>
        <div className="pageWrapper-content d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!financialYear || !appraisalPeriod || !quarter) {
    return <div>No financial year, appraisal period, or quarter found</div>;
  }

  return (
    <div className="pageWrapper">
      {/* Header Section */}
      <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
        <div className="headline d-flex flex-row justify-content-between align-items-center">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Quarterly Exception</h1>
        </div>
      </div>

      {/* Rest of your UI unchanged below */}
      <div className="pageWrapper-content d-flex flex-column m-1 p-3">
        <CheckInDescriptionSection employee={employee} dateRange={dateRange} />

        <div className="note mt-5 mb-5">
          <span className="text-muted">Note: </span>
          <span className="text-muted">
            Please raise an exception if actual or target values are incorrect.
          </span>
        </div>

        <div className="table-container">
          <table className="table-accent">
            <thead>
              <tr>
                <th style={{ width: '55%' }}>Month</th>
                <th style={{ width: '25%' }}>Actual</th>
                <th style={{ width: '25%' }}>Max</th>
              </tr>
            </thead>
            <tbody>
              {exceptionData?.monthlyScores ? (
                exceptionData.monthlyScores.map((monthData, index) => (
                  <tr key={index}>
                    <td>{monthData.month}</td>
                    <td>{monthData.actual}</td>
                    <td>{monthData.max}</td>
                  </tr>
                ))
              ) : (
                <>
                  <tr>
                    <td>April</td>
                    <td>13.9</td>
                    <td>65.0</td>
                  </tr>
                  <tr>
                    <td>May</td>
                    <td>9.1</td>
                    <td>65.0</td>
                  </tr>
                  <tr>
                    <td>June</td>
                    <td>17.7</td>
                    <td>65.0</td>
                  </tr>
                </>
              )}
              <tr>
                <td>
                  <b>Average</b>
                </td>
                <td>{exceptionData?.averageActual || '13.6'}</td>
                <td>{exceptionData?.averageMax || '65.0'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="discretionary-kra-section d-flex flex-column gap-3 shadow-sm m-1 p-3">
          <MeasurableKRA initialData={exceptionData?.measurableKRA} />
          <NonMeasurableKRA initialData={exceptionData?.nonMeasurableKRA} />
        </div>

        <div className="development-inputs-section d-flex flex-column gap-3 shadow-sm m-1 p-3">
          <h5 className="text-primary fw-bold mb-3">Declaration</h5>
          <DeclarationSection
            onDeclarationChange={handleDeclarationChange}
            employeeName={employee.employeeName || employee.name || 'Employee'}
            isSubmitDisabled={isSubmitting}
          />
        </div>
      </div>

      <div className="save-and-submit-button-section d-flex flex-row justify-content-end gap-3 m-3">
        <button className="btn btn-outline-primary" onClick={handleSave} disabled={isSubmitting}>
          Save Draft
        </button>
        <button
          className="btn"
          style={{
            backgroundColor: 'var(--accent-color)',
            color: '#fff',
            fontWeight: 500,
          }}
          onClick={handleSubmit}
          disabled={isSubmitting || !declarationChecked || !declarationFile}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Exception'}
        </button>
      </div>
    </div>
  );
}

export default QuarterlyException;
