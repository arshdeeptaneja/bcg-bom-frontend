import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BackButton } from '../../../components/common';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckInDescriptionSection } from '../../../components/Appraisal';
import ValidatorTable from './ValidatorTable';
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

const buildQuarterDateRange = (fyLabel, quarterLabel) => {
    if (!fyLabel || !quarterLabel) return '';
    const base = parseInt(parseFinancialYear(fyLabel), 10);
    if (!base) return '';

    switch (quarterLabel) {
        case 'Q1':
            return `01 Apr ${base} - 30 Jun ${base}`;
        case 'Q2':
            return `01 Jul ${base} - 30 Sep ${base}`;
        case 'Q3':
            return `01 Oct ${base} - 31 Dec ${base}`;
        case 'Q4':
            return `01 Jan ${base + 1} - 31 Mar ${base + 1}`;
        default:
            return '';
    }
};

const normalizeValidatorRows = (payload = []) => {
    if (!Array.isArray(payload)) return [];
    return payload.map((item, index) => ({
        id: item.KRA_CODE || item.kraId || item.id || item.urlId || index + 1,
        kraId: item.KRA_CODE || item.kraId || item.id || item.urlId || index + 1,
        kra: item.kra_desc || item.kra || item.kraName || item.metric || 'KRA',
        unit: item.unit || item.unitOfMeasure || '-',
        actual: item.final_actual ?? item.actual ?? item.appraiseeActual ?? '',
        appraisee: item.appraisee ?? item.final_actual ?? item.appraiseeActual ?? '',
        appraiserActual: item.APPRAISER_ACTUAL ?? item.appraiserActual ?? item.appraiser_value ?? '',
        validatorActual: item.VALIDATOR_ACTUAL ?? item.validatorActual ?? '',
        target: item.final_target ?? item.target ?? item.appraiseeTarget ?? '',
        appraiserTarget: item.APPRAISER_TARGET ?? item.appraiserTarget ?? item.target ?? '',
        validatorTarget: item.VALIDATOR_TARGET ?? item.validatorTarget ?? '',
        maxScore: item.maxscore ?? item.maxScore ?? item.max_score ?? '',
        score: item.self_score ?? item.score ?? '',
        appraiserScore: item.APPRAISER_SCORE ?? item.appraiserScore ?? item.score ?? '',
        validatorScore: item.VALIDATOR_SCORE ?? item.validatorScore ?? '',
        month: item.MONTH || item.month || item.period || '',
        category: item.category || item.kraCategory || '',
        selfComment: item.COMMENT_SELF ?? item.selfComment ?? item.appraiseeComment ?? '',
        appraiserComment: item.APPRAISER_COMMENT ?? item.appraiserComment ?? '',
        validatorComment: item.VALIDATOR_COMMENT ?? item.validatorComment ?? '',
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

function EmployeeQuarterlyException() {
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
            validator: employeeDetails?.currentUser?.VALIDATOR_NAME || '',
            roles: employeeDetails?.currentUser?.roles || [],
        }),
        [employeeDetails, loggedInEmpNo]
    );

    const {
        financialYear = 'FY 2024-25',
        appraisalPeriod = 'Quarterly',
        quarter = 'Q1',
        dateRange,
        employee = fallbackEmployee,
        role = 'VALIDATOR',
        roleName,
        roleId,
        zone,
        custTicketId,
        exceptionId,
        urlId,
    } = location.state || {};

    const validatorEmployee = employee || fallbackEmployee;
    const ticketId = custTicketId || exceptionId || validatorEmployee?.custTicketId || '';
    const reviewEmpNo = validatorEmployee?.empNo || loggedInEmpNo;
    const validatorRoleName = roleName || role || 'VALIDATOR';
    // Note: In the API, roleId parameter expects the URL ID (e.g., U-34545)
    // Use urlId or ticketId as the roleId for the API call
    const validatorRoleId = urlId || ticketId || roleId;
    const validatorZone = zone || validatorEmployee?.zone || employeeDetails?.currentUser?.ZONE_NAME || '';
    const parsedFinancialYear = parseFinancialYear(financialYear);
    const derivedDateRange = dateRange || buildQuarterDateRange(financialYear, quarter);

    const [kraRows, setKraRows] = useState([]);

    const {
        data: reviewData,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: [
            'exceptionQuarterlyValidatorReview',
            reviewEmpNo,
            quarter,
            parsedFinancialYear,
            validatorRoleName,
            ticketId,
        ],
        enabled: Boolean(reviewEmpNo && quarter && parsedFinancialYear),
        queryFn: () =>
            appraisalAPI.getExceptionQuarterlyValidatorReview({
                fy: parsedFinancialYear,
                quarter,
                empNo: reviewEmpNo,
                roleName: validatorRoleName,
                roleId: validatorRoleId,
                zone: validatorZone,
                custTicketId: ticketId,
            }),
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        if (isError && error) {
            toast.error(error?.response?.data?.message || 'Failed to load validator view');
        }
    }, [isError, error]);

    useEffect(() => {
        if (!reviewData) return;
        
        // Handle different response structures
        let sourceRows = [];
        
        // Check for kraData array
        if (reviewData?.kraData && Array.isArray(reviewData.kraData)) {
            sourceRows = reviewData.kraData;
        } else if (reviewData?.result?.kraData && Array.isArray(reviewData.result.kraData)) {
            sourceRows = reviewData.result.kraData;
        } else if (reviewData?.results_KRA_LIST_Measurable) {
            // Handle single KRA object
            sourceRows = [reviewData.results_KRA_LIST_Measurable];
        } else if (Array.isArray(reviewData?.result)) {
            sourceRows = reviewData.result;
        } else if (Array.isArray(reviewData)) {
            sourceRows = reviewData;
        }
        
        setKraRows(normalizeValidatorRows(sourceRows));
    }, [reviewData]);

    const handleDownload = () => {
        const attachmentUrl = reviewData?.file_url || reviewData?.attachmentUrl || reviewData?.result?.attachmentUrl;
        if (!attachmentUrl) {
            toast.info('No attachment available for download');
            return;
        }
        // Handle file path or URL
        if (attachmentUrl.startsWith('http')) {
            window.open(attachmentUrl, '_blank');
        } else {
            // If it's a file path, construct the download URL
            // Assuming backend serves files from /uploads endpoint
            const fileName = attachmentUrl.split('/').pop();
            const downloadUrl = `${window.location.origin}/uploads/${fileName}`;
            window.open(downloadUrl, '_blank');
        }
    };

    const handleRowChange = useCallback((id, patch) => {
        setKraRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
    }, []);

    const selectedRows = useMemo(() => kraRows.filter((row) => row.checked), [kraRows]);

    const submitMutation = useMutation({
        mutationFn: (payload) => appraisalAPI.submitExceptionQuarterlyValidatorReview(payload),
        onSuccess: () => {
            toast.success('Exception validated successfully');
            queryClient.invalidateQueries({ queryKey: ['exceptionQuarterlyValidatorReview'] });
            queryClient.invalidateQueries({ queryKey: ['exceptionValidatorDashboard'] });
            navigate(-1);
        },
        onError: (submitError) => {
            toast.error(submitError?.response?.data?.message || 'Failed to submit validator review');
        },
    });

    const handleSubmit = () => {
        if (!selectedRows.length) {
            toast.error('Select at least one KRA before submitting');
            return;
        }

        const rowsMissingComment = selectedRows.filter(
            (row) => row.action !== 'accept' && !row.validatorComment?.trim()
        );

        if (rowsMissingComment.length) {
            toast.error('Please add comments for every edited or rejected KRA');
            return;
        }

        const payload = {
            urlId: reviewData?.urlId || urlId || validatorEmployee?.urlId || reviewEmpNo,
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
                validatorActual: row.validatorActual,
                validatorTarget: row.validatorTarget,
                validatorScore: row.validatorScore,
                validatorComment: row.validatorComment,
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
            <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
                <div className="headline d-flex flex-row justify-content-between align-items-center">
                    <BackButton />
                    <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
                        Review Quarterly Exception
                    </h1>
                </div>
            </div>

            <div className="pageWrapper-content d-flex flex-column m-1 p-3">
                <CheckInDescriptionSection
                    employee={{
                        ...validatorEmployee,
                        empNo: reviewData?.empnumber || reviewData?.ecnumber || validatorEmployee?.empNo,
                        employeeName: reviewData?.emp_name || validatorEmployee?.employeeName,
                        branch: reviewData?.organisation || validatorEmployee?.branch,
                        primaryRole: reviewData?.primary || validatorEmployee?.primaryRole,
                        appraiser: reviewData?.REPORTING_AUTHORITY_NAME || validatorEmployee?.appraiser,
                        validator: reviewData?.validator_name || validatorEmployee?.validator,
                    }}
                    dateRange={reviewData?.date || derivedDateRange}
                    showDownloadButton
                    onDownload={handleDownload}
                />

                <div className="note mt-5 mb-5">
                    <span className="text-muted">Note: </span>
                    <span className="text-muted">
                        Please review the corrected actuals, targets, and comments before submitting the
                        validation.
                    </span>
                </div>

                {/* Score Summary Section */}
                {(reviewData?.measurable_score_total || reviewData?.new_measurable_score_total) && (
                    <div className="d-flex justify-content-start align-items-center gap-4 mb-4">
                        <h5 className="text-primary fw-bold mb-0">Non-discretionary Score</h5>
                        <div className="d-flex gap-3">
                            <span className="text-muted">
                                Old Score: <span className="fw-bold text-dark">{reviewData?.measurable_score_total || 0}/7.0</span>
                            </span>
                            <span className="text-success">
                                New Score: <span className="fw-bold">{reviewData?.new_measurable_score_total || 0}/7.0</span>
                            </span>
                        </div>
                    </div>
                )}

                <ValidatorTable
                    rows={kraRows}
                    onRowChange={handleRowChange}
                    onSubmit={handleSubmit}
                    isSubmitting={submitMutation.isLoading}
                />
            </div>
        </div>
    );
}

export default EmployeeQuarterlyException;
