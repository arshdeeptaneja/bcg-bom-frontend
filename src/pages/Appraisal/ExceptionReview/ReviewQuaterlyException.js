import React, { useMemo } from 'react';
import { BackButton } from '../../../components/common';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckInDescriptionSection } from '../../../components/Appraisal';
import KraTable from './KraTable';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/Spinner';
import { useExceptionReview } from '../shared/hooks/useExceptionReview';

function ReviewQuarterlyException() {
    const location = useLocation();
    const navigate = useNavigate();
    const { getEmployeeDetails, getUserProperty } = useAuth();

    const employeeDetails = getEmployeeDetails();
    const loggedInEmpNo = getUserProperty('empNo', employeeDetails?.currentUser?.EMP_ID || '');

    const fallbackEmployee = useMemo(
        () => ({
            empNo: loggedInEmpNo,
            employeeName: employeeDetails?.currentUser?.EMP_NAME || 'Employee Name',
            branch: employeeDetails?.currentUser?.BRANCH_NAME || 'Branch',
            primaryRole: employeeDetails?.currentUser?.PRIMARY_ROLE || 'Primary Role',
            appraiser: employeeDetails?.currentUser?.APPRAISER_NAME || 'Appraiser Name',
            roles: employeeDetails?.currentUser?.roles || [],
        }),
        [employeeDetails, loggedInEmpNo]
    );

    const {
        financialYear = 'FY 2024-25',
        appraisalPeriod = 'Quarterly',
        quarter = 'Q1',
        dateRange = '',
        employee = fallbackEmployee,
        role = 'APPRAISER',
        roleName,
        roleId,
        zone,
        custTicketId,
        exceptionId,
        urlId,
    } = location.state || {};

    const reviewEmployee = employee || fallbackEmployee;
    const reviewEmpNo = reviewEmployee?.empNo || loggedInEmpNo;
    const reviewerRoleName = roleName || role || 'APPRAISER';
    const reviewerRoleId = roleId || role || 'APPRAISER';
    const reviewerZone = zone || reviewEmployee?.zone || employeeDetails?.currentUser?.ZONE_NAME || '';

    // Use custom hook for all business logic
    const {
        kraRows,
        isLoading,
        isSubmitting,
        handleRowChange,
        handleSubmit,
        handleDownload,
    } = useExceptionReview({
        empNo: reviewEmpNo,
        quarter,
        financialYear,
        roleName: reviewerRoleName,
        roleId: reviewerRoleId,
        zone: reviewerZone,
        custTicketId: custTicketId || exceptionId,
        urlId,
        onSuccess: () => navigate(-1),
    });

    if (!financialYear || !appraisalPeriod || !quarter) {
        return <div>No financial year, appraisal period, or quarter found</div>;
    }

    if (isLoading) {
        return (
            <div className="pageWrapper">
                <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
                    <div className="headline d-flex flex-row justify-content-between align-items-center">
                        <BackButton />
                        <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
                            Review Quarterly Exception
                        </h1>
                    </div>
                </div>
                <div className="pageWrapper-content d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <LoadingSpinner />
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
                    <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
                        Review Quarterly Exception
                    </h1>
                </div>
            </div>

            {/* Content */}
            <div className="pageWrapper-content d-flex flex-column m-1 p-3">
                <CheckInDescriptionSection
                    employee={reviewEmployee}
                    dateRange={dateRange}
                    showDownloadButton
                    onDownload={handleDownload}
                />

                <div className="note mt-5 mb-5">
                    <span className="text-muted">Note: </span>
                    <span className="text-muted">
                        Please raise an exception if actual or target values are incorrect.
                    </span>
                </div>

                <KraTable
                    rows={kraRows}
                    onRowChange={handleRowChange}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                />
            </div>
        </div>
    );
}

export default ReviewQuarterlyException;
