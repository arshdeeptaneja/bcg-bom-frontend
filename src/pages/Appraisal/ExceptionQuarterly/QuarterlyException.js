import React, { useState, useEffect } from 'react';
import { BackButton } from '../../../components/common';
import { useLocation } from 'react-router-dom';
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

  // Get data from location state
  const { financialYear, appraisalPeriod, quarter, dateRange, employee, role } = location.state || {
    financialYear: "2024-2025",
    appraisalPeriod: "Mid-Year",
    quarter: "Q2",
    dateRange: "01 Jul 2024 - 30 Sep 2024",
    employee: { name: "John Doe", id: "EMP123" },
    role: "APPRAISEE",
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

  // ------------------------------------------------------------------------
  // Temporary Role Switcher (for testing)
  // ------------------------------------------------------------------------
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

  const handleSave = () => {
    console.log('Saving draft as', currentRole);
    alert(`Saved as ${currentRole}`);
  };

  const handleSubmit = () => {
    console.log('Submitting as', currentRole);
    alert(`Submitted by ${currentRole}`);
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
                <th style={{width:"55%"}}>Month</th>
                <th style={{width:"25%"}}>Actual</th>
                <th style={{width:"25%"}}>Max</th>
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
          {/* <h5 className="text-primary fw-bold mb-3">Non-Discretionary KRA</h5> */}
          {/* <MeasurableKra
            totalActualScore={5.0}
            totalMaxScore={10.0}
            kraListData={measurableKraListData}
            role={currentRole}
            isEditableBy={isEditableBy}
          /> */}
          <MeasurableKRA/>
          <NonMeasurableKRA/>
          {/* <NonMeasurableKra
            totalActualScore={5.0}
            totalMaxScore={10.0}
            kraListData={nonMeasurableKraListData}
            role={currentRole}
            isEditableBy={isEditableBy}
          /> */}
        </div>

        <div className="development-inputs-section d-flex flex-column gap-3 shadow-sm m-1 p-3">
          <h5 className="text-primary fw-bold mb-3">Declaration</h5>
          <DeclarationSection />

        </div>
      </div>

      {/* <div className="save-and-submit-button-section d-flex flex-row justify-content-end gap-3 m-3">
        <button className="btn btn-outline-primary" onClick={handleSave}>
          Save
        </button>
        <button className="btns btn-primarys" onClick={handleSubmit}>
          Submit
        </button>
      </div> */}
    </div>
  );
}

export default QuarterlyException;



