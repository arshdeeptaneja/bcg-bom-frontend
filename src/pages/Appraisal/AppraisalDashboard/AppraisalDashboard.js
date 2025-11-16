import './AppraisalDashboard.css';
import { BackButton, ImageTab } from '../../../components/common';
import LoadingSpinner from '../../../components/Spinner';
import { HiOutlineDocumentCheck } from 'react-icons/hi2';
import AppraisalAccordion from '../../../components/Appraisal/AppraisalAccordion/AppraisalAccordion';
import { useAuth } from '../../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { appraisalAPI } from '../../../services/api';
import { useNavigate } from 'react-router-dom';

/**
 * This component is used to display the appraisal dashboard.
 * @returns
 */
const AppraisalDashboard = () => {
  const { getEmployeeDetails, getUserProperty } = useAuth();
  const navigate = useNavigate();
  const employeeDetails = getEmployeeDetails();
  const empNo = getUserProperty('empNo', employeeDetails?.currentUser?.[0]?.EMP_ID || '');
  const sol = getUserProperty('sol', employeeDetails?.currentUser?.[0]?.LOCATION || '');
  const roleType = getUserProperty('roleType', employeeDetails?.currentUser?.[0]?.ROLE_TYPE || '');

  const getFinancialYears = () => {
    const years = [];
    const now = new Date();
    const currentYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1; // FY starts in April
    for (let i = 0; i < 6; i++) {
      const start = currentYear - i;
      const end = (start + 1).toString().slice(2);
      years.push(`FY ${start}-${end}`);
    }
    return years;
  };

  const financialYears = getFinancialYears();

  // Extract year from financial year format (e.g., "FY 2025-26" -> "2025")
  const extractYear = (fy) => {
    const match = fy.match(/FY (\d{4})/);
    return match ? match[1] : new Date().getFullYear().toString();
  };

  const [financialYear, setFinancialYear] = useState(financialYears[0]);

  // React Query to fetch exception validator dashboard data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['appraisalDashboard', financialYear, empNo],
    queryFn: () =>
      appraisalAPI.getAppraisalDashboard({
        fy: extractYear(financialYear),
        empNo: empNo,
        sol: sol,
        roleType: roleType,
      }),
    enabled: !!empNo, // Only run query if empNo is available
  });

  // Show error toast when API fails
  useEffect(() => {
    if (isError) {
      toast.error(`Failed to fetch exception data: ${error?.message || 'Unknown error'}`);
    }
  }, [isError, error]);

  console.log(data);

  const showTileMap = {
    appealcommitteezone: data?.tiles?.appealcommitteezone === 'yes',
    show_appeal_resolution_tile: data?.tiles?.show_appeal_resolution_tile === 'yes',
    show_exception_repoty_tile: data?.tiles?.show_exception_repoty_tile === 'yes',
    show_excepption_resolution_tile: true, // TODO: Remove this after testing data?.tiles?.show_excepption_resolution_tile === 'yes',
    showappraisal: data?.tiles?.showappraisal === 'yes',
    appeal_committee_head: data?.tiles?.appeal_committee_head === 'yes',
    appeal_committee_position: data?.tiles?.appeal_committee_position === 'yes',
    show_exception_validator_tile: true, // TODO: Remove this after testing data?.tiles?.show_exception_validator_tile === 'yes',
  };

  console.log(showTileMap);

  const tabConfig = [
    {
      key: 'showappraisal',
      heading: 'Appraisal',
      body: 'Click here for Appraisal',
      url: '/appraisal/home',
    },
    {
      key: 'show_exception_repoty_tile',
      heading: 'Exception Reporting',
      body: 'Click here for Exception Reporting',
    },
    {
      key: 'show_excepption_resolution_tile',
      heading: 'Exception Resolution',
      body: 'Click here for Exception Resolution',
      url: '/appraisal/exception-resolution',
    },
    {
      key: 'show_exception_validator_tile',
      heading: 'Exception Validation',
      body: 'Click here for Exception Validation',
      url: '/appraisal/exception-verify',
    },
    {
      key: 'show_appeal_resolution_tile',
      heading: 'Appeal Resolution',
      body: 'Click here for Appeal Resolution',
    },
    {
      key: 'appealcommitteezone',
      heading: 'Appeal Committee Zone',
      body: 'Click here for Appeal Committee Zone',
    },
    {
      key: 'appeal_committee_head',
      heading: 'Appeal Committee Head',
      body: 'Click here for Appeal Committee Head',
    },
    {
      key: 'appeal_committee_position',
      heading: 'Appeal Committee Position',
      body: 'Click here for Appeal Committee Position',
    },
  ];

  const selfAppraisalAccordionData = {
    heading: 'Self-Appraisal',
    pendingCount:
      (data?.resultTable?.QUARTERLY_APPRAISAL_Q1_SELF[0]?.['PENDING APPRAISALS'] || 0) +
      (data?.resultTable?.QUARTERLY_APPRAISAL_Q2_SELF[0]?.['PENDING APPRAISALS'] || 0) +
      (data?.resultTable?.QUARTERLY_APPRAISAL_Q3_SELF[0]?.['PENDING APPRAISALS'] || 0) +
      (data?.resultTable?.QUARTERLY_APPRAISAL_Q4_SELF[0]?.['PENDING APPRAISALS'] || 0),
    columns: ['#', 'Total Count', 'Pending Count'],
    tableData: [
      {
        '#': 'Q1',
        'Total Count': data?.resultTable?.QUARTERLY_APPRAISAL_Q1_SELF[0]?.['ROLECOUNT'] || 0,
        'Pending Count':
          data?.resultTable?.QUARTERLY_APPRAISAL_Q1_SELF[0]?.['PENDING APPRAISALS'] || 0,
      },
      {
        '#': 'Q2',
        'Total Count': data?.resultTable?.QUARTERLY_APPRAISAL_Q2_SELF[0]?.['ROLECOUNT'] || 0,
        'Pending Count':
          data?.resultTable?.QUARTERLY_APPRAISAL_Q2_SELF[0]?.['PENDING APPRAISALS'] || 0,
      },
      {
        '#': 'Q3',
        'Total Count': data?.resultTable?.QUARTERLY_APPRAISAL_Q3_SELF[0]?.['ROLECOUNT'] || 0,
        'Pending Count':
          data?.resultTable?.QUARTERLY_APPRAISAL_Q3_SELF[0]?.['PENDING APPRAISALS'] || 0,
      },
      {
        '#': 'Q4',
        'Total Count': data?.resultTable?.QUARTERLY_APPRAISAL_Q4_SELF[0]?.['ROLECOUNT'] || 0,
        'Pending Count':
          data?.resultTable?.QUARTERLY_APPRAISAL_Q4_SELF[0]?.['PENDING APPRAISALS'] || 0,
      },
    ],
  };

  const reportingAuthorityAccordionData = {
    heading: 'Reporting Authority',
    pendingCount:
      (data?.resultTable?.QUARTERLY_APPRAISAL_Q1[0]?.['PENDING APPRAISALS'] || 0) +
      (data?.resultTable?.QUARTERLY_APPRAISAL_Q2[0]?.['PENDING APPRAISALS'] || 0) +
      (data?.resultTable?.Quarterly_Appraisal_Q3[0]?.['PENDING APPRAISALS'] || 0) +
      (data?.resultTable?.Quarterly_Appraisal_Q4[0]?.['PENDING APPRAISALS'] || 0),
    tableData: [
      {
        '#': 'Q1',
        'Total Count': data?.resultTable?.QUARTERLY_APPRAISAL_Q1[0]?.['ROLECOUNT'] || 0,
        'Pending Count': data?.resultTable?.QUARTERLY_APPRAISAL_Q1[0]?.['PENDING APPRAISALS'] || 0,
      },
      {
        '#': 'Q2',
        'Total Count': data?.resultTable?.QUARTERLY_APPRAISAL_Q2[0]?.['ROLECOUNT'] || 0,
        'Pending Count': data?.resultTable?.QUARTERLY_APPRAISAL_Q2[0]?.['PENDING APPRAISALS'] || 0,
      },
      {
        '#': 'Q3',
        'Total Count': data?.resultTable?.Quarterly_Appraisal_Q3[0]?.['ROLECOUNT'] || 0,
        'Pending Count': data?.resultTable?.Quarterly_Appraisal_Q3[0]?.['PENDING APPRAISALS'] || 0,
      },
      {
        '#': 'Q4',
        'Total Count': data?.resultTable?.Quarterly_Appraisal_Q4[0]?.['ROLECOUNT'] || 0,
        'Pending Count': data?.resultTable?.Quarterly_Appraisal_Q4[0]?.['PENDING APPRAISALS'] || 0,
      },
    ],
  };

  const exceptionResolutionAccordionData = {
    heading: 'Exception Resolution',
    pendingCount:
      (data?.resultTable?.Exception_Resolution_Q1[0]?.['PENDING APPRAISALS'] || 0) +
      (data?.resultTable?.Exception_Resolution_Q2[0]?.['PENDING APPRAISALS'] || 0) +
      (data?.resultTable?.Exception_Resolution_Q3[0]?.['PENDING APPRAISALS'] || 0) +
      (data?.resultTable?.Exception_Resolution_Q4[0]?.['PENDING APPRAISALS'] || 0),
    tableData: [
      {
        '#': 'Q1',
        'Total Count': data?.resultTable?.Exception_Resolution_Q1[0]?.['TOTAL_COUNT'] || 0,
        'Pending Count': data?.resultTable?.Exception_Resolution_Q1[0]?.['PENDING_COUNT'] || 0,
      },
      {
        '#': 'Q2',
        'Total Count': data?.resultTable?.Exception_Resolution_Q2[0]?.['TOTAL_COUNT'] || 0,
        'Pending Count': data?.resultTable?.Exception_Resolution_Q2[0]?.['PENDING_COUNT'] || 0,
      },
      {
        '#': 'Q3',
        'Total Count': data?.resultTable?.Exception_Resolution_Q3[0]?.['TOTAL_COUNT'] || 0,
        'Pending Count': data?.resultTable?.Exception_Resolution_Q3[0]?.['PENDING_COUNT'] || 0,
      },
      {
        '#': 'Q4',
        'Total Count': data?.resultTable?.Exception_Resolution_Q4[0]?.['TOTAL_COUNT'] || 0,
        'Pending Count': data?.resultTable?.Exception_Resolution_Q4[0]?.['PENDING_COUNT'] || 0,
      },
    ],
  };

  const exceptionValidationAccordionData = {
    heading: 'Exception Validation',
    pendingCount:
      (data?.resultTable?.Exception_Validation_Q1[0]?.['PENDING APPRAISALS'] || 0) +
      (data?.resultTable?.Exception_Validation_Q2[0]?.['PENDING APPRAISALS'] || 0) +
      (data?.resultTable?.Exception_Validation_Q3[0]?.['PENDING APPRAISALS'] || 0) +
      (data?.resultTable?.Exception_Validation_Q4[0]?.['PENDING APPRAISALS'] || 0),
    tableData: [
      {
        '#': 'Q1',
        'Total Count': data?.resultTable?.Exception_Validation_Q1[0]?.['TOTAL_COUNT'] || 0,
        'Pending Count': data?.resultTable?.Exception_Validation_Q1[0]?.['PENDING_COUNT'] || 0,
      },
      {
        '#': 'Q2',
        'Total Count': data?.resultTable?.Exception_Validation_Q2[0]?.['TOTAL_COUNT'] || 0,
        'Pending Count': data?.resultTable?.Exception_Validation_Q2[0]?.['PENDING_COUNT'] || 0,
      },
      {
        '#': 'Q3',
        'Total Count': data?.resultTable?.Exception_Validation_Q3[0]?.['TOTAL_COUNT'] || 0,
        'Pending Count': data?.resultTable?.Exception_Validation_Q3[0]?.['PENDING_COUNT'] || 0,
      },
      {
        '#': 'Q4',
        'Total Count': data?.resultTable?.Exception_Validation_Q4[0]?.['TOTAL_COUNT'] || 0,
        'Pending Count': data?.resultTable?.Exception_Validation_Q4[0]?.['PENDING_COUNT'] || 0,
      },
    ],
  };

  const appealResolutionAccordionData = {
    heading: 'Appeal Resolution',
    pendingCount: data?.resultTable?.Appeal_Resolution[0]?.['PENDING_COUNT'] || 0,
    tableData: [
      {
        '#': 'Annual',
        'Total Count': data?.resultTable?.Appeal_Resolution[0]?.['TOTAL_COUNT'] || 0,
        'Pending Count': data?.resultTable?.Appeal_Resolution[0]?.['PENDING_COUNT'] || 0,
      },
    ],
  };

  console.log(appealResolutionAccordionData);

  if (isLoading) {
    return (
      <div className="pageWrapper">
        <div className="pageWrapper-header">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Exception Verification</h1>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="pageWrapper">
      <h1 className="dashboard-title text-primary fw-bold mb-0">Appraisal Dashboard</h1>

      {/* FY Selection Row */}
      <div className="fy-row border rounded-2 px-3 py-2 mt-3 align-items-center d-flex gap-3">
        <span className="text-muted fw-semibold">FY Selection</span>
        <select
          className="form-select w-auto text-primary"
          value={financialYear}
          onChange={(e) => setFinancialYear(e.target.value)}
        >
          {financialYears.map((fy) => (
            <option key={fy} value={fy}>
              {fy}
            </option>
          ))}
        </select>
      </div>

      {/* Appraisal Tabs */}
      <div
        className="appraisal-tabs mt-3 d-flex flex-row gap-3"
        style={{
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {tabConfig
          .filter((tab) => showTileMap[tab.key])
          .map((tab) => (
            <ImageTab
              key={tab.key}
              heading={tab.heading}
              body={tab.body}
              image={<HiOutlineDocumentCheck />}
              onClick={() => {
                navigate(tab.url);
              }}
            />
          ))}
      </div>

      {/*Accordions*/}
      <div className="appraisal-accordion-menu mt-3">
        <AppraisalAccordion
          accordionItems={[
            selfAppraisalAccordionData,
            reportingAuthorityAccordionData,
            exceptionResolutionAccordionData,
            exceptionValidationAccordionData,
            appealResolutionAccordionData,
          ]}
          columns={['#', 'Total Count', 'Pending Count']}
        />
      </div>
    </div>
  );
};

export default AppraisalDashboard;
