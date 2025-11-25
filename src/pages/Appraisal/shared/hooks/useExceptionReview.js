import { useState, useEffect, useMemo, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { appraisalAPI } from '../../../../services/api';
import { normalizeKraRows, VERIFY_FIELDS } from '../utils/fieldMappings';
import { 
    parseFinancialYear, 
    deriveDeclarationOption, 
    validateRowComments 
} from '../utils/exceptionHelpers';
import { buildVerifyPayload } from '../utils/payloadTransformers';

/**
 * Custom hook for Exception Review (Verify/Appraiser Mode)
 * Handles data fetching, normalization, state management, and submission
 * 
 * @param {Object} params - Hook parameters
 * @param {string} params.empNo - Employee number
 * @param {string} params.quarter - Quarter (Q1, Q2, Q3, Q4)
 * @param {string} params.financialYear - Financial year (e.g., "FY 2024-25")
 * @param {string} params.roleName - Role name
 * @param {string} params.roleId - Role ID
 * @param {string} params.zone - Zone name
 * @param {string} params.custTicketId - Customer ticket ID
 * @param {string} params.urlId - URL ID
 * @param {Function} params.onSuccess - Callback on successful submission
 * 
 * @returns {Object} Hook state and actions
 */
export const useExceptionReview = ({
    empNo,
    quarter,
    financialYear,
    roleName,
    roleId,
    zone,
    custTicketId,
    urlId,
    onSuccess,
}) => {
    const queryClient = useQueryClient();
    const [kraRows, setKraRows] = useState([]);
    
    const parsedFinancialYear = parseFinancialYear(financialYear);
    const ticketId = custTicketId || '';

    // Fetch exception review data
    const {
        data: reviewData,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: [
            'exceptionQuarterlyReview',
            empNo,
            quarter,
            parsedFinancialYear,
            roleName,
            ticketId,
        ],
        enabled: Boolean(empNo && quarter && parsedFinancialYear),
        queryFn: () =>
            appraisalAPI.getExceptionQuarterlyReview({
                fy: parsedFinancialYear,
                quarter,
                empNo,
                roleName,
                roleId,
                zone,
                custTicketId: ticketId,
            }),
        staleTime: 5 * 60 * 1000,
    });

    // Show error toast when query fails
    useEffect(() => {
        if (isError && error) {
            toast.error(error?.response?.data?.message || 'Failed to load exception review');
        }
    }, [isError, error]);

    // Normalize and set KRA rows when data is loaded
    useEffect(() => {
        if (!reviewData) return;
        const sourceRows =
            reviewData?.kraData || reviewData?.result?.kraData || reviewData?.result || [];
        setKraRows(normalizeKraRows(sourceRows, VERIFY_FIELDS));
    }, [reviewData]);

    // Handle row changes (checkbox, action, editable fields, comments)
    const handleRowChange = useCallback((id, patch) => {
        setKraRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
    }, []);

    // Get selected rows
    const selectedRows = useMemo(() => kraRows.filter((row) => row.checked), [kraRows]);

    // Handle file download
    const handleDownload = useCallback(() => {
        const attachmentUrl = reviewData?.attachmentUrl || reviewData?.result?.attachmentUrl;
        if (!attachmentUrl) {
            toast.info('No attachment available for download');
            return;
        }
        window.open(attachmentUrl, '_blank');
    }, [reviewData]);

    // Submit mutation
    const submitMutation = useMutation({
        mutationFn: (payload) => appraisalAPI.submitExceptionQuarterlyReview(payload),
        onSuccess: (response) => {
            const successMessage = response?.RESPONSE === 'authority_exception_approved'
                ? 'Exception approved successfully'
                : 'Exception review submitted successfully';
            toast.success(successMessage);
            queryClient.invalidateQueries({ queryKey: ['exceptionQuarterlyVerify'] });
            queryClient.invalidateQueries({ queryKey: ['exceptionDashboard'] });
            if (onSuccess) {
                onSuccess(response);
            }
        },
        onError: (submitError) => {
            toast.error(
                submitError?.response?.data?.message || 'Failed to submit exception review'
            );
        },
    });

    // Handle form submission
    const handleSubmit = useCallback(() => {
        // Validate selected rows and comments
        const validation = validateRowComments(selectedRows, 'appraiserComment');
        if (!validation.isValid) {
            toast.error(validation.message);
            return;
        }

        // Build submission payload with nested structure
        const payload = buildVerifyPayload(selectedRows, {
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
