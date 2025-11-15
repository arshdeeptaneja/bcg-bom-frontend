import { BackButton } from '../../../components/common';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './AppraiseeCheckIn.css';
import EmployeeAppraisalCard from '../../../components/Appraisal/EmployeeAppraisalCard/EmployeeAppraisalCard';
import EmployeeModel from '../../../models/EmployeeModel';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appraisalAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/Spinner';

// Status mapping for display transformation
const STATUS_MAPPING = {
  'complete_reva': 'Pending at Acceptor',
  'complete_self': 'Pending at Appraiser',
  'complete_repa': 'Pending at Reviewer',
  'pending': 'Pending at Appraisee',
  'submitted_appraisal': 'Completed',
  'completed': 'Completed',
  'complete_ac': 'Completed'
};

// Helper function to get display status from backend status
const getDisplayStatus = (backendStatus) => {
  if (!backendStatus) return 'Pending';
  const status = backendStatus.toLowerCase();
  return STATUS_MAPPING[status] || 'Pending';
};

// Helper function to get backend status from display status
const getBackendStatus = (displayStatus) => {
  const entry = Object.entries(STATUS_MAPPING).find(([key, value]) => value === displayStatus);
  return entry ? entry[0] : '';
};

/**
 *
 * @param {Object} props - The component props.
 * @param {string} props.financialYear - The financial year.
 * @param {string} props.appraisalPeriod - The appraisal period.
 * @param {string} props.quarter - The quarter.
 * @returns
 */
export default function AppraiseeCheckIn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const financialYear = searchParams.get('financialYear');
  const appraisalPeriod = searchParams.get('appraisalPeriod');
  const quarter = searchParams.get('quarter');

  // Extract empNo from AuthContext
  const { getEmployeeDetails, getUserProperty } = useAuth();
  const employeeDetails = getEmployeeDetails();
  const empNo = getUserProperty('empNo', employeeDetails?.currentUser?.[0]?.EMP_ID || '36663');

  // Helper function to extract year from "FY 2024-25" format
  const extractYear = (fy) => {
    const match = fy.match(/FY (\d{4})/);
    return match ? match[1] : new Date().getFullYear().toString();
  };

  // React Query to fetch dashboard data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['myAppraisalDashboard', financialYear, appraisalPeriod, empNo],
    queryFn: () => appraisalAPI.getAppraiseeCheckInDashboard({
      empNo: empNo,
      financialYear: extractYear(financialYear),
      appraisalPeriod: appraisalPeriod.toLowerCase()
    }),
    enabled: !!empNo && !!financialYear && !!appraisalPeriod,
  });

  if (!financialYear || !appraisalPeriod) {
    return (
      <div className="pageWrapper">
        <div className="text-center mt-5">
          <p className="text-danger fw-semibold">Missing required parameters: Financial Year or Appraisal Period</p>
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
            <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
              Appraisee Check-In Dashboard
            </h1>
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
            <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
              Appraisee Check-In Dashboard
            </h1>
          </div>
        </div>
        <div className="text-center mt-5">
          <p className="text-danger fw-semibold">Failed to load appraisal data</p>
          <p className="text-muted">{error?.message || 'Please try again later'}</p>
        </div>
      </div>
    );
  }

  // Extract results from API response
  const results = data?.result || [];
  const scoreData = data?.appraisal_score_dash || [];

  return (
    <div className="pageWrapper">
      <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
        <div className="headline d-flex flex-row justify-content-between align-items-center">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
            Appraiser Check-In Dashboard
          </h1>
        </div>
        <h2 className="text-muted fw-bold mb-0 ms-3">
          {`${financialYear} ${appraisalPeriod} Appraisal`}
        </h2>
      </div>

      {/* Employee Appraisal Cards */}
      <div className="employee-appraisal-cards">
        {results.length === 0 ? (
          <div className="text-center mt-5">
            <p className="text-muted fw-semibold">No appraisal data available for this period</p>
            <p className="text-muted">Please check back later or contact HR if you believe this is an error.</p>
          </div>
        ) : (
          results.map((employee, index) => (
            <EmployeeAppraisalCard
              key={employee.EMP_ID || index}
              employee={
                new EmployeeModel({
                  empNo: employee.EMP_ID || '',
                  employeeName: employee.EMP_NAME || '',
                  employeeScale: employee.SCALE || '',
                  roles: employee.ADDITIONAL_ROLE_1 || employee.ADDITIONAL_ROLE_2 
                    ? [employee.ADDITIONAL_ROLE_1, employee.ADDITIONAL_ROLE_2].filter(Boolean) 
                    : [],
                  appraiser: employee.REPORTING_AUTHORITY_NAME || '',
                })
              }
              dateRange={employee.START_DATE && employee.END_DATE 
                ? `${employee.START_DATE} to ${employee.END_DATE}` 
                : ''}
              primaryRole={employee.MAIN_ROLE || ''}
              appraisalStatus={getDisplayStatus(employee.APPRAISAL_STATUS)}
              exceptionStatus="NOT CREATED"
              organization={employee.ORGANIZATION || ''}
              quarter={appraisalPeriod === 'Quarterly' ? quarter : ''}
              appraisalPeriod={appraisalPeriod}
              scoreData={scoreData}
              onAddCheckIn={() => {
                navigate('/appraisal/check-in-form', {
                  state: {
                    financialYear,
                    appraisalPeriod,
                    quarter,
                    dateRange: employee.START_DATE && employee.END_DATE 
                      ? `${employee.START_DATE} to ${employee.END_DATE}` 
                      : '',
                    employee: {
                      empNo: employee.EMP_ID || '',
                      employeeName: employee.EMP_NAME || '',
                      employeeScale: employee.SCALE || '',
                      roles: employee.ADDITIONAL_ROLE_1 || employee.ADDITIONAL_ROLE_2 
                        ? [employee.ADDITIONAL_ROLE_1, employee.ADDITIONAL_ROLE_2].filter(Boolean) 
                        : [],
                      primaryRole: employee.MAIN_ROLE || '',
                      appraiser: employee.REPORTING_AUTHORITY_NAME || '',
                    },
                  },
                });
              }}
              onViewSummary={() => {}}
              onAddException={() => {}}
            />
          ))
        )}
      </div>
    </div>
  );
}
