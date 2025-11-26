/**
 * The `ReviewQuarterlyException` function in JavaScript is used to handle the review process for
 * quarterly exceptions in an appraisal system, including fetching data, displaying a table for review,
 * and submitting the review with validations.
 * @param fy - The `fy` parameter in the code refers to the financial year. It is used to specify the
 * financial year for which the data is being retrieved or processed. The `parseFinancialYear` function
 * is used to extract and format the financial year from the provided input.
 * @returns The `ReviewQuarterlyException` component is being returned. It contains JSX elements for
 * rendering the header section, content, and a loading spinner if data is still loading. The component
 * displays information related to reviewing quarterly exceptions, including employee details, date
 * range, a download button for attachments, a note section, and a table for handling KRAs with options
 * for submitting the review.
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BackButton } from '../../../components/common';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckInDescriptionSection } from '../../../components/Appraisal';
import KraTable from './KraTable';
import { useAuth } from '../../../contexts/AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { appraisalAPI } from '../../../services/api';
import LoadingSpinner from '../../../components/Spinner';
import { toast } from 'react-toastify';

const parseFinancialYear = (fy) => {
    if (!fy) return '';
    const match = `${fy}`.match(/(\d{4})/);
    return match ? match[1] : `${fy}`;
};

const normalizeKraRows = (payload = []) => {
    if (!Array.isArray(payload)) return [];
    return payload.map((item, index) => ({
        id: item.kraId || item.id || item.urlId || index + 1,
        kraId: item.kraId || item.id || item.urlId || index + 1,
        kra: item.kra || item.kraName || item.metric || 'KRA',
        unit: item.unit || item.unitOfMeasure || '-',
        actual: item.actual ?? item.appraiseeActual ?? '',
        appraisee: item.appraisee ?? item.appraiseeActual ?? '',
        appraiserActual: item.appraiserActual ?? item.appraiser_value ?? '',
        target: item.target ?? item.appraiseeTarget ?? '',
        appraiserTarget: item.appraiserTarget ?? item.target ?? '',
        maxScore: item.maxScore ?? item.max_score ?? '',
        score: item.score ?? '',
        appraiserScore: item.appraiserScore ?? item.score ?? '',
        month: item.month || item.period || '',
        category: item.category || item.kraCategory || '',
        selfComment: item.selfComment ?? item.appraiseeComment ?? '',
        appraiserComment: item.appraiserComment ?? '',
        commentOpen: true,
        checked: false,
        action: 'accept',
    }));
};

const deriveDeclarationOption = (rows = []) => {
    if (rows.some((row) => row.action === 'reject')) {
        return 'REJECT';
    }
    if (rows.some((row) => row.action === 'edit')) {
        return 'ACCEPT_AND_EDIT';
    }
    return 'ACCEPT_AS_IS';
};

function ReviewQuarterlyException() {
    const location = useLocation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
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
    const ticketId = custTicketId || exceptionId || reviewEmployee?.custTicketId || '';
    const reviewEmpNo = reviewEmployee?.empNo || loggedInEmpNo;
    const reviewerRoleName = roleName || role || 'APPRAISER';
    const reviewerRoleId = roleId || role || 'APPRAISER';
    const reviewerZone = zone || reviewEmployee?.zone || employeeDetails?.currentUser?.ZONE_NAME || '';
    const parsedFinancialYear = parseFinancialYear(financialYear);

    const [kraRows, setKraRows] = useState([]);

    const {
        data: reviewData,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: [
            'exceptionQuarterlyReview',
            reviewEmpNo,
            quarter,
            parsedFinancialYear,
            reviewerRoleName,
            ticketId,
        ],
        enabled: Boolean(reviewEmpNo && quarter && parsedFinancialYear),
        queryFn: () =>
            appraisalAPI.getExceptionQuarterlyReview({
                fy: parsedFinancialYear,
                quarter,
                empNo: reviewEmpNo,
                roleName: reviewerRoleName,
                roleId: reviewerRoleId,
                zone: reviewerZone,
                custTicketId: ticketId,
            }),
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        if (isError && error) {
            toast.error(error?.response?.data?.message || 'Failed to load exception review');
        }
    }, [isError, error]);

    useEffect(() => {
        if (!reviewData) return;
        const sourceRows =
            reviewData?.kraData || reviewData?.result?.kraData || reviewData?.result || [];
        setKraRows(normalizeKraRows(sourceRows));
    }, [reviewData]);

    const handleDownload = () => {
        const attachmentUrl = reviewData?.attachmentUrl || reviewData?.result?.attachmentUrl;
        if (!attachmentUrl) {
            toast.info('No attachment available for download');
            return;
        }
        window.open(attachmentUrl, '_blank');
    };

    const handleRowChange = useCallback((id, patch) => {
        setKraRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
    }, []);

    const selectedRows = useMemo(() => kraRows.filter((row) => row.checked), [kraRows]);

    const submitMutation = useMutation({
        mutationFn: (payload) => appraisalAPI.submitExceptionQuarterlyReview(payload),
        onSuccess: () => {
            toast.success('Exception review submitted successfully');
            queryClient.invalidateQueries({ queryKey: ['exceptionQuarterlyVerify'] });
            navigate(-1);
        },
        onError: (submitError) => {
            toast.error(
                submitError?.response?.data?.message || 'Failed to submit exception review'
            );
        },
    });

    const handleSubmit = () => {
        if (!selectedRows.length) {
            toast.error('Select at least one KRA before submitting');
            return;
        }

        const rowsMissingComment = selectedRows.filter(
            (row) => row.action !== 'accept' && !row.appraiserComment?.trim()
        );

        if (rowsMissingComment.length) {
            toast.error('Please add comments for every edited or rejected KRA');
            return;
        }

        const payload = {
            urlId: reviewData?.urlId || urlId || reviewEmployee?.urlId || reviewEmpNo,
            quarter,
            financialYear: Number(parsedFinancialYear) || new Date().getFullYear(),
            empNo: reviewEmpNo,
            custTicketId: ticketId,
            kraData: selectedRows.map((row) => ({
                id: row.kraId,
                action: row.action?.toUpperCase(),
                month: row.month,
                unit: row.unit,
                category: row.category,
                appraiserActual: row.appraiserActual,
                appraiserTarget: row.appraiserTarget,
                appraiserScore: row.appraiserScore,
                appraiserComment: row.appraiserComment,
            })),
            declarationOption: deriveDeclarationOption(selectedRows),
        };

        submitMutation.mutate(payload);
    };

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
                    isSubmitting={submitMutation.isLoading}
                />
            </div>
        </div>
    );
}

export default ReviewQuarterlyException;
