import React, { useState, useEffect } from 'react';
import { BackButton } from '../../../components/common';
import { useLocation } from 'react-router-dom';
import {
  CheckInSummaryTable,
  FinalScoreSummaryTable,
  CheckInDescriptionSection,
  MeasurableKra,
  NonMeasurableKra,
  DevelopmentInputs,
  
} from '../../../components/Appraisal';
import DevelopmentInput from './DevelopmentInput/DevelopementInput';
import RemarkSection from './Remark/Remark';
import RemarkTable from './Remark/Remark';
import { useQuery } from '@tanstack/react-query';
import { appraisalAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/Spinner';
import { toast } from 'react-toastify';


const demoRows = [
  { question: "Training required, if any", response: "Review of Performance KRAs" },
  { question: "Integrity remarks", response: "Officer integrity satisfactory" },
  { question: "General behavior remarks", response: "Good behavior & cooperation" },
  { question: "Communication skills", response: "Strong communication" },
  { question: "Team handling capability", response: "Handles team well" },
  { question: "Leadership feedback", response: "Shows leadership potential" },
  { question: "Work commitment remarks", response: "Highly committed" },
  { question: "Improvement areas", response: "Needs minor improvement in time mgmt" },
];
function AppraiserAddAppraisal() {
  const location = useLocation();

  // ✅ FIXED: role added in destructuring
  // const { financialYear, appraisalPeriod, quarter, dateRange, employee, role } = location.state || {};
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
  const empNo = getUserProperty('empNo', 
    employee?.empNo || 
    employee?.id || 
    employee?.EMP_ID || 
    employeeDetails?.currentUser?.[0]?.EMP_ID || 
    ''
  );

  // Extract year from financial year format (e.g., "FY 2025-26" -> "2025")
  const extractYear = (fy) => {
    const match = fy?.match(/FY (\d{4})/);
    return match ? match[1] : new Date().getFullYear().toString();
  };

  // React Query to fetch reportee appraisal dashboard data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['reporteeAppraisalDashboard', financialYear, quarter, empNo],
    queryFn: () =>
      appraisalAPI.getReporteeAppraisalDashboard({
        empNo: empNo,
        financialYear: parseInt(extractYear(financialYear)),
        quarter: quarter || '',
      }),
    enabled: !!empNo && !!financialYear && !!quarter, // Only run query if required params are available
  });

  // Show error toast when API fails
  useEffect(() => {
    if (isError) {
      toast.error(`Failed to fetch reportee appraisal dashboard data: ${error?.message || 'Unknown error'}`);
    }
  }, [isError, error]);

  // Role State (Appraisee / Appraiser / Reviewer)
  const [currentRole, setCurrentRole] = useState(role || 'APPRAISEE');
  const [selected, setSelected] = useState("Integrity of the officer is doubtful");

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

  // Extract and set data from API response when it loads
  useEffect(() => {
    if (data) {
      const responseData = data?.data || data;
      
      // Set KRA data
      if (responseData?.kraData) {
        setKraData(responseData.kraData);
      } else if (responseData?.result) {
        setKraData(responseData.result);
      }

      // Set measurable KRA list data
      if (responseData?.measurableKraList) {
        setMeasurableKraListData(responseData.measurableKraList);
      } else if (responseData?.measurableKraListData) {
        setMeasurableKraListData(responseData.measurableKraListData);
      }

      // Set non-measurable KRA list data
      if (responseData?.nonMeasurableKraList) {
        setNonMeasurableKraListData(responseData.nonMeasurableKraList);
      } else if (responseData?.nonMeasurableKraListData) {
        setNonMeasurableKraListData(responseData.nonMeasurableKraListData);
      }

      // Set development inputs data
      if (responseData?.developmentInputs) {
        setDevelopmentInputsData(responseData.developmentInputs);
      } else if (responseData?.developmentInputsData) {
        setDevelopmentInputsData(responseData.developmentInputsData);
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

  const actualScoreData = { January: 10, February: 20, March: 30 };
  const maxScoreData = { January: 100, February: 200, March: 300 };
  const developmentInputsQuestions = [
    { question: 'What is your name?', required: true },
    { question: 'Do you have any development inputs?', required: true, options: ['Yes', 'No'] },
  ];

  if (!financialYear || !appraisalPeriod || !quarter) {
    return <div>No financial year, appraisal period, or quarter found</div>;
  }

  // Show loading spinner while data is being fetched
  if (isLoading) {
    return (
      <div className="pageWrapper">
        <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
          <div className="headline d-flex flex-row justify-content-between align-items-center">
            <BackButton />
            <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Appraiser :Add Appraisal</h1>
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
            <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Appraiser :Add Appraisal</h1>
          </div>
        </div>
        <div className="text-center mt-5">
          <p className="text-danger fw-semibold">Failed to load appraisal data</p>
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
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Appraiser :Add Appraisal</h1>
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

   

        <div className="check-in-summary-table-section d-flex flex-column shadow-sm m-1 p-3">
          <h5 className="text-primary fw-bold mb-3">Development Inputs</h5>
          <DevelopmentInput/>
        </div>

        <div className="discretionary-kra-section d-flex flex-column gap-3 shadow-sm m-1 p-3">
          <h5 className="text-primary fw-bold mb-3">Discretionary KRA</h5>
          <MeasurableKra
            totalActualScore={5.0}
            totalMaxScore={10.0}
            kraListData={measurableKraListData}
            role={currentRole}
            isEditableBy={isEditableBy}
          />
          <NonMeasurableKra
            totalActualScore={5.0}
            totalMaxScore={10.0}
            kraListData={nonMeasurableKraListData}
            role={currentRole}
            isEditableBy={isEditableBy}
          />
        </div>

        <div className="development-inputs-section d-flex flex-column gap-3 shadow-sm m-1 p-3">
        <RemarkTable rows={demoRows} />

         </div>
      </div>

         {/* Integrity Section */}
      <section >
        <h4 className="integrity-title mb-3">Integrity</h4>

        <p className="fw-semibold mb-1">
          1. Training required, if any <span className="text-danger">*</span>
        </p>

        <div className="d-flex flex-column gap-2 ms-2">

          <label className="d-flex align-items-center gap-2">
            <input
              type="radio"
              name="integrity"
              className="form-check-input"
              checked={selected === "Beyond Doubt"}
              onChange={() => setSelected("Beyond Doubt")}
            />
            Beyond Doubt
          </label>

          <label className="d-flex align-items-center gap-2">
            <input
              type="radio"
              name="integrity"
              className="form-check-input"
              checked={selected === "Not Sufficient Information"}
              onChange={() => setSelected("Not Sufficient Information")}
            />
            Not Sufficient Information to form a definite
          </label>

          <label className="d-flex align-items-center gap-2">
            <input
              type="radio"
              name="integrity"
              className="form-check-input"
              checked={selected === "Integrity of the officer is doubtful"}
              onChange={() => setSelected("Integrity of the officer is doubtful")}
            />
            Integrity of the officer is doubtful
          </label>
        </div>

        {/* Value Display */}
        <p className="mt-3 fw-semibold">
          Appraiser Option Value: <span className="fw-normal">{selected === "Beyond Doubt" ? "Beyond Doubt" : "Beyond Doubt"}</span>
        </p>
      </section>

      <div className="save-and-submit-button-section d-flex flex-row justify-content-end gap-3 m-3">
        <button className="btn btn-outline-primary" onClick={handleSave}>
          Save
        </button>
        <button className="btns btn-primarys" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
}

export default AppraiserAddAppraisal;
