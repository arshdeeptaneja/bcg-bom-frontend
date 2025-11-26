/**
 * The `QuarterlyException` function in JavaScript is a React component that handles the submission of
 * quarterly exception reports for employee appraisals, including fetching data from an API, displaying
 * KRA details, and allowing users to save drafts or submit exceptions.
 * @returns The `QuarterlyException` component is returning a JSX structure that includes the following
 * sections:
 */
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
import { appraisalAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/Spinner';
import { saveAppraisalData, loadAppraisalData } from './localStorageHelpers';

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

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: ({ payload, attachment }) =>
      appraisalAPI.submitQuarterlyExceptionReport(payload, attachment),
    onSuccess: (data) => {

      console.log("data is: ", data)
      toast.success(`Exception submitted successfully. Ticket ID: ${data.ticketId}`);
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

  const [measurableKraListData, setMeasurableKraListData] = useState({});
  const [nonMeasurableKraListData, setNonMeasurableKraListData] = useState({});
  const [monthlyScores, setMonthlyScores] = useState({});
  
  // State to track edited KRA data (user changes)
  const [editedMeasurableKra, setEditedMeasurableKra] = useState({});
  const [editedNonMeasurableKra, setEditedNonMeasurableKra] = useState({});

  // React Query to fetch quarterly exception report data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['quarterlyExceptionReport', financialYear, appraisalPeriod, quarter, empNo, currentRole],
    queryFn: () =>
      appraisalAPI.getQuarterlyExceptionReport({
        empNo: empNo,
        url: employee?.url || employee?.URL_ID || 'U-34545',
        roleType: currentRole || role || 'APPRAISEE',
        financialYear: parseInt(extractYear(financialYear)),
        quarter: quarter || '',
        pageType: 'quarterly-exception',
        appraisalStatus: employee?.appraisalStatus || employee?.APPRAISAL_STATUS || 'PENDING',
        intent: 'Fill',
      }),
    enabled: !!empNo && !!financialYear && !!quarter,
  });

  console.log("API Response:", data);

  // Show error toast when API fails
  useEffect(() => {
    if (isError) {
      toast.error(`Failed to fetch quarterly exception data: ${error?.message || 'Unknown error'}`);
    }
  }, [isError, error]);

  // Helper function to convert month number to month name
  const getMonthName = (monthNumber) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[monthNumber - 1] || 'Unknown';
  };

  // Extract and set data from API response when it loads
  useEffect(() => {
    if (!data) return;

    const response = data?.data || data;

    /** -----------------------
     *  MAP MEASURABLE KRA LIST
     * -----------------------*/
    const measurableList = response?.["results-KRA_LIST-measurable"] || [];

    const mKRA = {};
    const scores = {};

    measurableList.forEach(item => {
      const monthNumber = item.MONTH; // 7, 8, 9, etc.
      const monthName = getMonthName(monthNumber); // "July", "August", "September"

      if (!mKRA[monthName]) {
        mKRA[monthName] = [];
        scores[monthName] = { actual: 0, max: 0 };
      }

      mKRA[monthName].push({
        kra: item.kra_desc || '',
        target: item.target || item.target_og || '',
        actual: item.actual || item.actual_og || '',
        unit: item.unit || '',
        maxScore: item.maxscore || 0,
        score: item.score || 0,
        comment: item.COMMENT_SELF_1 || '',
        category: 'measurable',
        kraCode: item.KRA_CODE || '',
        showActual: item.show_actual || item.actual || '',
        showTarget: item.show_target || item.target || '',
      });

      // Accumulate scores for the monthly scores table
      scores[monthName].actual += parseFloat(item.score || 0);
      scores[monthName].max += parseFloat(item.maxscore || 0);
    });

    console.log("Mapped Measurable KRA:", mKRA);
    console.log("Monthly Scores:", scores);

    setMeasurableKraListData(mKRA);
    setMonthlyScores(scores);

    /** ---------------------------
     *  MAP NON-MEASURABLE KRA LIST
     * ---------------------------*/
    const nonMeasurableList = response["results-KRA_LIST-non measurable"] || [];

    const nmKRA = {};

    nonMeasurableList.forEach(item => {
      const month = "General"; // non measurable doesn't have month
      if (!nmKRA[month]) nmKRA[month] = [];

      nmKRA[month].push({
        kra: item.kra_desc || '',
        comment: item.COMMENT_SELF_1 || '',
        category: 'non-measurable',
        kraCode: item.KRA_CODE || '',
      });
    });

    console.log("Mapped Non-Measurable KRA:", nmKRA);
    setNonMeasurableKraListData(nmKRA);

  }, [data]);

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

    // Parse date range and convert to backend format (YYYY-MM-DD HH:MM:SS.0)
    let startDate = '';
    let endDate = '';
    
    if (dateRange) {
      // Try splitting by " → " first
      let parts = dateRange.split(' → ');
      
      // If that doesn't work, try " - "
      if (parts.length !== 2) {
        parts = dateRange.split(' - ');
      }
      
      const startStr = parts[0]?.trim() || '';
      const endStr = parts[1]?.trim() || '';
      
      // Convert from "01 Apr 2025" format to "2024-07-01 00:00:00.0" format
      const convertToBackendDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr; // Return as-is if parsing fails
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day} 00:00:00.0`;
      };
      
      startDate = convertToBackendDate(startStr);
      endDate = convertToBackendDate(endStr);
    }

    // Extract financial year
    const financialYearValue = parseInt(extractYear(financialYear)) || new Date().getFullYear();

    // Build the KRA data array with target object structure
    const kraDataArray = [
      // Flatten measurable KRA data with any edits
      ...(measurableKraListData && Object.entries(measurableKraListData).length > 0
        ? Object.entries(measurableKraListData).flatMap(([month, items]) =>
            items.map((item, index) => {
              const editedData = editedMeasurableKra[`${month}_${index}`] || {};
              const monthIndex = Object.keys(measurableKraListData).indexOf(month) + 1;
              return {
                target: {
                  kra_type: 'measurable',
                  KRA_CODE: parseInt(item.kraCode) || 0,
                  PARENT_KRA: null,
                  firstcomment: editedData.comment || item.comment || '',
                  old_target: String(item.target || ''),
                  new_target: String(editedData.target || item.target || ''),
                  old_actual: String(item.actual || ''),
                  new_actual: String(editedData.actual || item.actual || ''),
                  old_mpb: String(item.maxScore || ''),
                  new_mpb: String(editedData.maxScore || item.maxScore || ''),
                  chk_status: 'on',
                  old_score: String(item.score || ''),
                  max_score: String(item.maxScore || ''),
                  MONTH: String(monthIndex),
                  repa_score: String(editedData.score || item.score || ''),
                }
              };
            })
          )
        : []),
      
      // Flatten non-measurable KRA data with any edits
      ...(nonMeasurableKraListData && Object.entries(nonMeasurableKraListData).length > 0
        ? Object.entries(nonMeasurableKraListData).flatMap(([month, items]) =>
            items.map((item, index) => {
              const editedData = editedNonMeasurableKra[`${month}_${index}`] || {};
              return {
                target: {
                  kra_type: 'discretionary_non_measurable',
                  KRA_CODE: parseInt(item.kraCode) || 0,
                  PARENT_KRA: null,
                  firstcomment: editedData.comment || item.comment || '',
                  old_target: String(item.kra || ''),
                  new_target: String(editedData.kra || item.kra || ''),
                  old_actual: '',
                  new_actual: '',
                  old_mpb: '',
                  new_mpb: '',
                  chk_status: 'on',
                  old_score: '',
                  max_score: '',
                  MONTH: '',
                  repa_score: '',
                }
              };
            })
          )
        : []),
    ];

    // Build the complete payload matching backend expectations
    const payload = {
      kraData: kraDataArray,
      financialYear: financialYearValue,
      empNo: empNo || employee?.empNo || '',
      endDate: endDate,
      quarter: quarter || '',
      declarationOption: declarationChecked ? 'AGREED' : 'NOT_AGREED',
      startDate: startDate,
      reportingAuthorityNo: employee?.appraiser_emp_id || employee?.REPORTING_AUTHORITY_ID || '',
      id: data?.urlId || employee?.URL_ID || employee?.url || '',
    };

    console.log('Submitting payload:', JSON.stringify(payload, null, 2));
    console.log('File:', declarationFile);

    // Submit with file
    submitMutation.mutate({
      payload: payload,
      attachment: declarationFile,
    });
  };

  // Handler to update measurable KRA edits
  const handleMeasurableKraChange = useCallback((monthIndex, kraIndex, field, value) => {
    const key = `${monthIndex}_${kraIndex}`;
    setEditedMeasurableKra(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [field]: value,
      }
    }));
  }, []);

  // Handler to update non-measurable KRA edits
  const handleNonMeasurableKraChange = useCallback((monthIndex, kraIndex, field, value) => {
    const key = `${monthIndex}_${kraIndex}`;
    setEditedNonMeasurableKra(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [field]: value,
      }
    }));
  }, []);

  // Calculate monthly scores data for the table - now dynamic based on API data
  const monthsData = Object.keys(monthlyScores).map(month => ({
    month,
    actual: monthlyScores[month]?.actual || 0,
    max: monthlyScores[month]?.max || 0,
  }));

  const averageActual = monthsData.length > 0 
    ? monthsData.reduce((sum, m) => sum + m.actual, 0) / monthsData.length 
    : 0;
  const averageMax = monthsData.length > 0 
    ? monthsData.reduce((sum, m) => sum + m.max, 0) / monthsData.length 
    : 0;

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

      {/* Rest of your UI */}
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
              {monthsData.length > 0 && (
                <tr>
                  <td><b>Average</b></td>
                  <td>{averageActual.toFixed(1)}</td>
                  <td>{averageMax.toFixed(1)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="discretionary-kra-section d-flex flex-column gap-3 shadow-sm m-1 p-3">
          <MeasurableKRA 
            initialData={measurableKraListData} 
            onKraChange={handleMeasurableKraChange}
          />
          <NonMeasurableKRA 
            initialData={nonMeasurableKraListData}
            onKraChange={handleNonMeasurableKraChange}
          />
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
        {/* <button className="btn btn-outline-primary" onClick={handleSave} disabled={isSubmitting}>
          Save Draft
        </button> */}
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