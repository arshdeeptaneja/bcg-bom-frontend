import { useState, useEffect, useMemo, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { appraisalAPI } from '../../../../services/api';
import { normalizeKraRows, VALIDATOR_FIELDS } from '../utils/fieldMappings';
import { 
    parseFinancialYear, 
    deriveDeclarationOption, 
    validateRowComments,
    buildQuarterDateRange 
} from '../utils/exceptionHelpers';
import { buildValidatorPayload } from '../utils/payloadTransformers';

/**
 * Custom hook for Exception Validator Review
 * Handles validator-specific data fetching, normalization, state management, and submission
 * 
 * @param {Object} params - Hook parameters
 * @param {string} params.empNo - Employee number
 * @param {string} params.quarter - Quarter (Q1, Q2, Q3, Q4)
 * @param {string} params.financialYear - Financial year (e.g., "FY 2024-25")
 * @param {string} params.roleName - Role name
 * @param {string} params.roleId - Role ID (or URL ID)
 * @param {string} params.zone - Zone name
 * @param {string} params.custTicketId - Customer ticket ID
 * @param {string} params.urlId - URL ID
 * @param {string} params.dateRange - Pre-calculated date range (optional)
 * @param {Function} params.onSuccess - Callback on successful submission
 * 
 * @returns {Object} Hook state and actions
 */
export const useExceptionValidator = ({
    empNo,
    quarter,
    financialYear,
    roleName,
    roleId,
    zone,
    custTicketId,
    urlId,
    dateRange,
    onSuccess,
}) => {
    const queryClient = useQueryClient();
    const [kraRows, setKraRows] = useState([]);
    
    const parsedFinancialYear = parseFinancialYear(financialYear);
    const ticketId = custTicketId || '';
    // Note: In the API, roleId parameter expects the URL ID (e.g., U-34545)
    const validatorRoleId = urlId || ticketId || roleId;
    const derivedDateRange = dateRange || buildQuarterDateRange(financialYear, quarter);

    // Fetch exception validator review data
    const {
        data: reviewData,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: [
            'exceptionQuarterlyValidatorReview',
            empNo,
            quarter,
            parsedFinancialYear,
            roleName,
            ticketId,
        ],
        enabled: Boolean(empNo && quarter && parsedFinancialYear),
        queryFn: () =>
            appraisalAPI.getExceptionQuarterlyValidatorReview({
                fy: parsedFinancialYear,
                quarter,
                empNo,
                roleName,
                roleId: validatorRoleId,
                zone,
                custTicketId: ticketId,
            }),
        staleTime: 5 * 60 * 1000,
    });

    // Show error toast when query fails
    useEffect(() => {
        if (isError && error) {
            toast.error(error?.response?.data?.message || 'Failed to load validator view');
        }
    }, [isError, error]);

    // Normalize and set KRA rows when data is loaded
    // Handles multiple response structures specific to validator mode
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
        
        setKraRows(normalizeKraRows(sourceRows, VALIDATOR_FIELDS));
    }, [reviewData]);

    // Handle row changes (checkbox, action, editable fields, comments)
    const handleRowChange = useCallback((id, patch) => {
        setKraRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
    }, []);

    // Get selected rows
    const selectedRows = useMemo(() => kraRows.filter((row) => row.checked), [kraRows]);

    // Get score data for display
    const scoreData = useMemo(() => ({
        oldScore: reviewData?.measurable_score_total || 0,
        newScore: reviewData?.new_measurable_score_total || 0,
        hasScores: Boolean(reviewData?.measurable_score_total || reviewData?.new_measurable_score_total),
    }), [reviewData]);

    // Get employee data enriched from API response
    const enrichedEmployee = useMemo(() => ({
        empNo: reviewData?.empnumber || reviewData?.ecnumber || empNo,
        employeeName: reviewData?.emp_name || '',
        branch: reviewData?.organisation || '',
        primaryRole: reviewData?.primary || '',
        appraiser: reviewData?.REPORTING_AUTHORITY_NAME || '',
        validator: reviewData?.validator_name || '',
    }), [reviewData, empNo]);

    // Handle file download (with path/URL handling)
    const handleDownload = useCallback(() => {
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
            const fileName = attachmentUrl.split('/').pop();
            const downloadUrl = `${window.location.origin}/uploads/${fileName}`;
            window.open(downloadUrl, '_blank');
        }
    }, [reviewData]);

    // Submit mutation
    const submitMutation = useMutation({
        mutationFn: (payload) => appraisalAPI.submitExceptionQuarterlyValidatorReview(payload),
        onSuccess: (response) => {
            const successMessage = response?.RESPONSE === 'validator_exception_approved'
                ? 'Exception validated and approved successfully'
                : 'Exception validated successfully';
            toast.success(successMessage);
            queryClient.invalidateQueries({ queryKey: ['exceptionQuarterlyValidatorReview'] });
            queryClient.invalidateQueries({ queryKey: ['exceptionValidatorDashboard'] });
            if (onSuccess) {
                onSuccess(response);
            }
        },
        onError: (submitError) => {
            toast.error(
                submitError?.response?.data?.message || 'Failed to submit validator review'
            );
        },
    });

    // Handle form submission
    const handleSubmit = useCallback(() => {
        // Validate selected rows and comments
        const validation = validateRowComments(selectedRows, 'validatorComment');
        if (!validation.isValid) {
            toast.error(validation.message);
            return;
        }

        // Build submission payload with nested structure
        const payload = buildValidatorPayload(selectedRows, {
            urlId: reviewData?.urlId || urlId || empNo,
            quarter,
            financialYear: Number(parsedFinancialYear) || new Date().getFullYear(),
            empNo,
            custTicketId: ticketId,
            declarationOption: deriveDeclarationOption(selectedRows),
        });

        submitMutation.mutate(payload);
    }, [
        selectedRows,
        reviewData,
        urlId,
        empNo,
        quarter,
        parsedFinancialYear,
        ticketId,
        submitMutation,
    ]);

    return {
        // Data state
        kraRows,
        reviewData,
        selectedRows,
        scoreData,
        enrichedEmployee,
        derivedDateRange: reviewData?.date || derivedDateRange,
        
        // Loading and error states
        isLoading,
        isError,
        error,
        isSubmitting: submitMutation.isLoading,
        
        // Actions
        handleRowChange,
        handleSubmit,
        handleDownload,
        
        // Direct state setters (if needed for advanced use cases)
        setKraRows,
    };
};
