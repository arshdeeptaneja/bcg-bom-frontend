import React, { useState, useEffect, useCallback } from 'react';
import { BackButton } from '../../../components/common';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import './QuarterlyException.css';
import {
  CheckInDescriptionSection,
} from '../../../components/Appraisal';
import MeasurableKRA from './NonDiscretionaryKRA/MeasurableKRA/MeasurableKRA';
import NonMeasurableKRA from './NonDiscretionaryKRA/NonMeasurableKRA/NonMeasurableKRA';
import DeclarationSection from './Declaration';
import { useQuery } from '@tanstack/react-query';
import { appraisalAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/Spinner';
import { toast } from 'react-toastify';

function QuarterlyException() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get data from location state
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

  // Get employee details from auth context using getUserProperty
  const { getEmployeeDetails, getUserProperty } = useAuth();
  const employeeDetails = getEmployeeDetails();
  const empNoFromAuth = getUserProperty('empNo', employeeDetails?.currentUser?.[0]?.EMP_ID || '');
  const empNo = employee?.empNo || employee?.id || employee?.EMP_ID || empNoFromAuth;

  // Extract year from financial year format (e.g., "FY 2025-26" -> "2025" or "2024-2025" -> "2024")
  const extractYear = (fy) => {
    if (!fy) return new Date().getFullYear().toString();
    // Try FY format first
    const fyMatch = fy.match(/FY (\d{4})/);
    if (fyMatch) return fyMatch[1];
    // Try range format (e.g., "2024-2025")
    const rangeMatch = fy.match(/(\d{4})-\d{4}/);
    if (rangeMatch) return rangeMatch[1];
    // Try single year
    const yearMatch = fy.match(/\d{4}/);
    return yearMatch ? yearMatch[0] : new Date().getFullYear().toString();
  };

  // Role State (Appraisee / Appraiser / Reviewer)
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
  // ------------------------------------------------------------------------

  const [kraData, setKraData] = useState([]);
  const [comments, setComments] = useState({
    appraisee: '',
    appraiser: '',
    reviewer: '',
  });
  const [measurableKraListData, setMeasurableKraListData] = useState([]);
  const [nonMeasurableKraListData, setNonMeasurableKraListData] = useState({});
  const [developmentInputsData, setDevelopmentInputsData] = useState([]);
  const [monthlyScores, setMonthlyScores] = useState({});

  // React Query to fetch quarterly exception report data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['quarterlyExceptionReport', financialYear, appraisalPeriod, quarter, empNo, currentRole],
    queryFn: () =>
      appraisalAPI.getQuarterlyExceptionReport({
        empNo: empNo,
        url: employee?.url || employee?.URL_ID || '', // @TODO: Confirm with Arsh - URL field name
        roleType: currentRole || role || 'APPRAISEE',
        financialYear: parseInt(extractYear(financialYear)),
        quarter: quarter || '',
        pageType: 'quarterly-exception', // @TODO: Confirm with Arsh - pageType value
        appraisalStatus: employee?.appraisalStatus || employee?.APPRAISAL_STATUS || 'PENDING', // @TODO: Confirm with Arsh - appraisalStatus field name
        intent: 'Fill',
      }),
    enabled: !!empNo && !!financialYear && !!quarter, // Only run query if required params are available
  });
  console.log("data", data);

  // Show error toast when API fails
  useEffect(() => {
    if (isError) {
      toast.error(`Failed to fetch quarterly exception data: ${error?.message || 'Unknown error'}`);
    }
  }, [isError, error]);

  // Extract and set data from API response when it loads
  useEffect(() => {
    if (data) {
      const responseData = data?.data || data;

      // Set monthly scores (for the table)
      if (responseData?.monthlyScores) {
        setMonthlyScores(responseData.monthlyScores);
      }

      // Set measurable KRA data
      if (responseData?.measurableKraList) {
        setMeasurableKraListData(responseData.measurableKraList);
      } else if (responseData?.measurableKraListData) {
        setMeasurableKraListData(responseData.measurableKraListData);
      }

      // Set non-measurable KRA data
      if (responseData?.nonMeasurableKraList) {
        setNonMeasurableKraListData(responseData.nonMeasurableKraList);
      } else if (responseData?.nonMeasurableKraListData) {
        setNonMeasurableKraListData(responseData.nonMeasurableKraListData);
      }

      // Set development inputs
      if (responseData?.developmentInputs) {
        setDevelopmentInputsData(responseData.developmentInputs);
      } else if (responseData?.developmentInputsData) {
        setDevelopmentInputsData(responseData.developmentInputsData);
      }

      // Set KRA data
      if (responseData?.kraData) {
        setKraData(responseData.kraData);
      }
    }
  }, [data]);

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

  // Calculate monthly scores data for the table (Q1: April, May, June)
  const months = ["April", "May", "June"];
  const monthsData = months.map(month => {
    const monthData = monthlyScores[month] || {};
    return {
      month,
      actual: monthData.actual || monthData.ACTUAL || 0,
      max: monthData.max || monthData.MAX || 0,
    };
  });
  const averageActual = monthsData.length > 0 
    ? monthsData.reduce((sum, m) => sum + m.actual, 0) / monthsData.length 
    : 0;
  const averageMax = monthsData.length > 0 ? monthsData[0].max : 0;

  if (!financialYear || !appraisalPeriod || !quarter) {
    return (
      <div className="pageWrapper">
        <div className="pageWrapper-header">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Quarterly Exception</h1>
        </div>
        <div className="text-center mt-5">
          <p className="text-danger fw-semibold">Missing required parameters: Financial Year, Appraisal Period, or Quarter</p>
        </div>
      </div>
    );
  }

  // Show loading spinner while data is being fetched
  if (isLoading) {
    return (
      <div className="pageWrapper">
        <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
          <div className="headline d-flex flex-row justify-content-between align-items-center">
            <BackButton />
            <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Quarterly Exception</h1>
          </div>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  // Show error state if API call fails
  if (isError) {
    return (
      <div className="pageWrapper">
        <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
          <div className="headline d-flex flex-row justify-content-between align-items-center">
            <BackButton />
            <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Quarterly Exception</h1>
          </div>
        </div>
        <div className="text-center mt-5">
          <p className="text-danger fw-semibold">Failed to load exception data</p>
          <p className="text-muted">{error?.message || 'Please try again later'}</p>
        </div>
      </div>
    );
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
              {monthsData.map(({ month, actual, max }) => (
                <tr key={month}>
                  <td>{month}</td>
                  <td>{actual.toFixed(1)}</td>
                  <td>{max.toFixed(1)}</td>
                </tr>
              ))}
              <tr>
                <td><b>Average</b></td>
                <td>{averageActual.toFixed(1)}</td>
                <td>{averageMax.toFixed(1)}</td>
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
