import React, { useState, useEffect, useRef } from 'react';
import { BackButton } from '../../../components/common';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { appraisalAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/Spinner';
import AnnualAppraiserCard from '../AnnualAppraiserCard/AnnualAppraiserCard';
import EmployeeModel from '../../../models/EmployeeModel';
import {
  CheckInDescriptionSection,
  MeasurableKra,
  NonMeasurableKra,
  
} from '../../../components/Appraisal';
import DevelopmentInput from './DevelopmentInput/DevelopementInput';
import RemarkTable from './Remark/Remark';


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

const STATUS_MAPPING = {
  complete_reva: 'Pending at Acceptor',
  complete_self: 'Pending at Appraiser',
  complete_repa: 'Pending at Reviewer',
  pending: 'Pending at Appraisee',
  submitted_appraisal: 'Completed',
  completed: 'Completed',
  complete_ac: 'Completed',
};

const getDisplayStatus = (backendStatus) => {
  if (!backendStatus) {
    return 'Pending';
  }
  const status = backendStatus.toLowerCase();
  return STATUS_MAPPING[status] || backendStatus;
};

const extractFinancialYearNumber = (fy = '') => {
  if (!fy) {
    return '';
  }
  const matches = fy.toString().match(/\d{4}/g);
  if (!matches || matches.length === 0) {
    return fy;
  }
  return matches[0];
};

const buildCardPayload = (reportee, quarterFallback) => {
  const additionalRoles = [
    reportee?.ADDITIONAL_ROLE_1,
    reportee?.ADDITIONAL_ROLE_2,
    reportee?.ADDITIONAL_ROLE_3,
  ].filter(Boolean);

  const employeeModel = new EmployeeModel({
    empNo: reportee?.EMP_ID || reportee?.EMP_NO || reportee?.empNo || '',
    employeeName: reportee?.EMP_NAME || reportee?.EMPLOYEE_NAME || reportee?.employeeName || '',
    employeeScale: reportee?.SCALE || reportee?.employeeScale || '',
    additionalRoles,
    appraiser: reportee?.REPORTING_AUTHORITY_NAME || reportee?.appraiser || '',
    primaryRole: reportee?.MAIN_ROLE || reportee?.primaryRole || '',
  });

  return {
    employeeModel,
    dateRange:
      reportee?.START_DATE && reportee?.END_DATE
        ? `${reportee.START_DATE} to ${reportee.END_DATE}`
        : '',
    primaryRole: reportee?.MAIN_ROLE || reportee?.primaryRole || '',
    organization: reportee?.ORGANIZATION || reportee?.BRANCH || '',
    appraisalStatus: getDisplayStatus(reportee?.APPRAISAL_STATUS || reportee?.appraisalStatus),
    exceptionStatus: reportee?.EXCEPTION_STATUS || 'NOT CREATED',
    quarter: reportee?.QUARTER || quarterFallback || '',
    raw: reportee,
  };
};

const mapCardToSelection = (cardPayload) => ({
  employee: {
    empNo: cardPayload.employeeModel?.empNo || '',
    employeeName: cardPayload.employeeModel?.employeeName || '',
    employeeScale: cardPayload.employeeModel?.employeeScale || '',
    appraiser: cardPayload.employeeModel?.appraiser || '',
    primaryRole: cardPayload.primaryRole || cardPayload.employeeModel?.primaryRole || '',
    roles: cardPayload.employeeModel?.additionalRoles || [],
    branch: cardPayload.organization || '',
  },
  dateRange: cardPayload.dateRange,
  quarter: cardPayload.quarter,
  raw: cardPayload.raw,
});
function AppraiserAddAppraisal() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const locationState = location.state || {};
  const [selectedAssignment, setSelectedAssignment] = useState(() =>
    locationState?.employee
      ? {
          employee: {
            ...locationState.employee,
            roles: locationState.employee.roles || [],
          },
          dateRange: locationState.dateRange || '',
          quarter: locationState.quarter || '',
          raw: locationState.raw || null,
        }
      : null
  );

  const financialYearParam =
    searchParams.get('financialYear') || locationState.financialYear || '2025';
  const appraisalPeriodParam =
    searchParams.get('appraisalPeriod') || locationState.appraisalPeriod || 'Annual';
  const quarterParam = searchParams.get('quarter') || locationState.quarter || '';

  const normalizedFinancialYear = extractFinancialYearNumber(financialYearParam);
  const isQuarterly = appraisalPeriodParam?.toLowerCase() === 'quarterly';
  const effectiveQuarter = isQuarterly ? quarterParam : '';

  const { getEmployeeDetails, getUserProperty } = useAuth();
  const employeeDetails = getEmployeeDetails();
  const empNo = getUserProperty('empNo', employeeDetails?.currentUser?.[0]?.EMP_ID || '36663');

  const shouldLoadDashboard = Boolean(
    empNo && normalizedFinancialYear && (!isQuarterly || effectiveQuarter)
  );

  const {
    data: reporteeDashboard,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    error: dashboardError,
  } = useQuery({
    queryKey: ['reporteeAppraisalDashboard', empNo, normalizedFinancialYear, effectiveQuarter],
    queryFn: () =>
      appraisalAPI.getReporteeAppraisalDashboard({
        empNo,
        financialYear: normalizedFinancialYear,
        quarter: effectiveQuarter,
      }),
    enabled: shouldLoadDashboard,
    staleTime: 5 * 60 * 1000,
  });

  const reporteeRows = Array.isArray(reporteeDashboard?.result)
    ? reporteeDashboard.result
    : Array.isArray(reporteeDashboard?.data)
      ? reporteeDashboard.data
      : Array.isArray(reporteeDashboard)
        ? reporteeDashboard
        : [];
  const reporteeCards = reporteeRows.map((row) => buildCardPayload(row, effectiveQuarter));

  // Role State (Appraisee / Appraiser / Reviewer)
  const [currentRole, setCurrentRole] = useState(locationState.role || 'APPRAISEE');
  const [selectedIntegrity, setSelectedIntegrity] = useState(
    'Integrity of the officer is doubtful'
  );
  const formRef = useRef(null);

  const [kraData, setKraData] = useState([]);
  const [comments, setComments] = useState({
    appraisee: '',
    appraiser: '',
    reviewer: '',
  });
  const [measurableKraListData, setMeasurableKraListData] = useState([]);
  const [nonMeasurableKraListData, setNonMeasurableKraListData] = useState({});
  const [developmentInputsData, setDevelopmentInputsData] = useState([]);

  useEffect(() => {
    setKraData([
      { KraName: 'KRA 1', KraWeight: 10 },
      { KraName: 'KRA 2', KraWeight: 20 },
      { KraName: 'KRA 3', KraWeight: 30 },
    ]);

    setMeasurableKraListData([
      {
        KraName: 'KRA 1',
        KraActualScore: 10,
        KraTarget: 100,
        KraWeight: 10,
        KraFinalScore: 10,
        comments: { appraisee: '', appraiser: '', reviewer: '' },
      },
      {
        KraName: 'KRA 2',
        KraActualScore: 20,
        KraTarget: 200,
        KraWeight: 20,
        KraFinalScore: 20,
        comments: { appraisee: '', appraiser: '', reviewer: '' },
      },
    ]);

    setNonMeasurableKraListData({
      'Section 1': [
        {
          KraName: 'KRA 1',
          KraDescription: 'lorem ipsum dolor sit amet consectetur adipisicing elit.',
          comments: { appraisee: '', appraiser: '', reviewer: '' },
        },
      ],
      'Section 2': [
        {
          KraName: 'KRA 2',
          KraDescription: 'lorem ipsum dolor sit amet consectetur adipisicing elit.',
          comments: { appraisee: '', appraiser: '', reviewer: '' },
        },
      ],
      'Section 3': [
        {
          KraName: 'KRA 3',
          KraDescription: 'lorem ipsum dolor sit amet consectetur adipisicing elit.',
          comments: { appraisee: '', appraiser: '', reviewer: '' },
        },
      ],
    });
  }, []);

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

  if (!financialYearParam || !appraisalPeriodParam || (isQuarterly && !quarterParam)) {
    return <div>No financial year, appraisal period, or quarter found</div>;
  }

  const handleSelectReportee = (cardPayload) => {
    const mappedSelection = mapCardToSelection(cardPayload);
    setSelectedAssignment(mappedSelection);
    setCurrentRole('APPRAISER');
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const renderReporteeList = () => {
    if (!shouldLoadDashboard) {
      return (
        <div className="alert alert-warning mt-3">
          Unable to load reportees without employee or financial year context.
        </div>
      );
    }

    if (isDashboardLoading) {
      return <LoadingSpinner />;
    }

    if (isDashboardError) {
      return (
        <div className="alert alert-danger mt-3">
          Failed to load reportees. {dashboardError?.message || 'Please try again later.'}
        </div>
      );
    }

    if (reporteeCards.length === 0) {
      return (
        <div className="alert alert-info mt-3">
          No reportees found for the selected criteria.
        </div>
      );
    }

    return reporteeCards.map((card) => (
      <div key={`${card.employeeModel.empNo}-${card.quarter || 'annual'}`} className="mb-4">
        <AnnualAppraiserCard
          employee={card.employeeModel}
          dateRange={card.dateRange}
          primaryRole={card.primaryRole}
          organization={card.organization}
          appraisalStatus={card.appraisalStatus}
          exceptionStatus={card.exceptionStatus}
          quarter={card.quarter}
          appraisalPeriod={appraisalPeriodParam}
        />
        <div className="d-flex justify-content-end mt-3">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleSelectReportee(card)}
          >
            {selectedAssignment?.employee?.empNo === card.employeeModel.empNo
              ? 'Selected'
              : 'Add Appraisal'}
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="pageWrapper">
      {/* Header Section */}
      <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
        <div className="headline d-flex flex-row justify-content-between align-items-center">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Appraiser :Add Appraisal</h1>
        </div>
        <h5 className="text-muted fw-bold mb-0 ms-3">
          {`${isQuarterly ? `${quarterParam}, ` : ''}${financialYearParam} ${appraisalPeriodParam}`}
        </h5>
      </div>

      <div className="employee-appraisal-cards mt-4">{renderReporteeList()}</div>

      {selectedAssignment ? (
        <>
          <div ref={formRef} className="pageWrapper-content d-flex flex-column m-1 p-3">
            <CheckInDescriptionSection
              employee={selectedAssignment.employee}
              dateRange={selectedAssignment.dateRange}
            />

            <div className="note mt-5 mb-5">
              <span className="text-muted">Note: </span>
              <span className="text-muted">
                Please raise an exception if actual or target values are incorrect.
              </span>
            </div>

            <div className="check-in-summary-table-section d-flex flex-column shadow-sm m-1 p-3">
              <h5 className="text-primary fw-bold mb-3">Development Inputs</h5>
              <DevelopmentInput />
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

          <section>
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
                  checked={selectedIntegrity === 'Beyond Doubt'}
                  onChange={() => setSelectedIntegrity('Beyond Doubt')}
                />
                Beyond Doubt
              </label>

              <label className="d-flex align-items-center gap-2">
                <input
                  type="radio"
                  name="integrity"
                  className="form-check-input"
                  checked={selectedIntegrity === 'Not Sufficient Information'}
                  onChange={() => setSelectedIntegrity('Not Sufficient Information')}
                />
                Not Sufficient Information to form a definite
              </label>

              <label className="d-flex align-items-center gap-2">
                <input
                  type="radio"
                  name="integrity"
                  className="form-check-input"
                  checked={selectedIntegrity === 'Integrity of the officer is doubtful'}
                  onChange={() => setSelectedIntegrity('Integrity of the officer is doubtful')}
                />
                Integrity of the officer is doubtful
              </label>
            </div>

            <p className="mt-3 fw-semibold">
              Appraiser Option Value: <span className="fw-normal">{selectedIntegrity}</span>
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
        </>
      ) : (
        <div className="alert alert-info mt-5">
          Select a reportee from the list above to start adding appraisal details.
        </div>
      )}
    </div>
  );
}

export default AppraiserAddAppraisal;
