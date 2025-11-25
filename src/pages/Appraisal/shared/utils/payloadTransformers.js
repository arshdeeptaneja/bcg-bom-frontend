/**
 * Payload Transformers for Exception Review POST APIs
 * Converts internal UI state to backend-expected nested payload structure
 */

import { DECLARATION_OPTIONS } from './exceptionConstants';

/**
 * Map string declaration options to numeric values expected by backend
 */
const DECLARATION_NUMERIC_MAP = {
    [DECLARATION_OPTIONS.ACCEPT_AS_IS]: 1,
    [DECLARATION_OPTIONS.ACCEPT_AND_EDIT]: 2,
    [DECLARATION_OPTIONS.REJECT]: 3,
};

/**
 * Convert declaration option to numeric value
 * @param {string} declarationOption - String constant (ACCEPT_AS_IS, ACCEPT_AND_EDIT, REJECT)
 * @returns {number} - Numeric value (1, 2, 3)
 */
export const mapDeclarationToNumeric = (declarationOption) => {
    return DECLARATION_NUMERIC_MAP[declarationOption] || 1;
};

/**
 * Build verify (appraiser) mode POST payload with nested target structure
 * @param {Array} selectedRows - Selected KRA rows with UI state
 * @param {Object} metadata - Top-level metadata (urlId, quarter, financialYear, empNo, custTicketId)
 * @returns {Object} - Backend-compatible POST payload
 */
export const buildVerifyPayload = (selectedRows, metadata) => {
    const { urlId, quarter, financialYear, empNo, custTicketId, declarationOption } = metadata;

    return {
        urlId,
        quarter,
        financialYear: Number(financialYear),
        empNo,
        custTicketId,
        declarationOption: mapDeclarationToNumeric(declarationOption),
        kraData: selectedRows.map((row) => ({
            target: {
                kra_type: row.kraType || row.category?.toLowerCase() || 'measurable',
                action: row.action?.toLowerCase() || 'accept',
                KRA_CODE: row.kraId || row.id,
                PARENT_KRA: row.parentKra || null,
                comment: row.appraiserComment || '',
                descriptor_score: row.descriptorScore || '',
                old_target: String(row.originalTarget ?? row.target ?? ''),
                new_target: String(row.appraiserTarget ?? row.target ?? ''),
                old_actual: String(row.originalActual ?? row.actual ?? ''),
                new_actual: String(row.appraiserActual ?? row.actual ?? ''),
                old_mpb: String(row.oldMpb || row.mpb || ''),
                new_mpb: String(row.newMpb || row.mpb || ''),
                chk_status: row.checked ? 'on' : 'off',
                old_score: String(row.originalScore ?? row.score ?? ''),
                max_score: String(row.maxScore ?? ''),
                MONTH: String(row.month ?? ''),
                repa_score: String(row.repaScore || row.appraiserScore || ''),
                prev_target: String(row.prevTarget || row.previousTarget || ''),
                prev_actual: String(row.prevActual || row.previousActual || ''),
            },
        })),
    };
};

/**
 * Build validator mode POST payload with nested target structure
 * @param {Array} selectedRows - Selected KRA rows with UI state
 * @param {Object} metadata - Top-level metadata (urlId, quarter, financialYear, empNo, custTicketId)
 * @returns {Object} - Backend-compatible POST payload
 */
export const buildValidatorPayload = (selectedRows, metadata) => {
    const { urlId, quarter, financialYear, empNo, custTicketId, declarationOption } = metadata;

    return {
        urlId,
        quarter,
        financialYear: Number(financialYear),
        empNo,
        custTicketId,
        declarationOption: mapDeclarationToNumeric(declarationOption),
        kraData: selectedRows.map((row) => ({
            target: {
                kra_type: row.kraType || row.category?.toLowerCase() || 'measurable',
                action: row.action?.toLowerCase() || 'accept',
                KRA_CODE: row.kraId || row.id,
                PARENT_KRA: row.parentKra || null,
                comment: row.validatorComment || '',
                descriptor_score: row.descriptorScore || '',
                old_target: String(row.appraiserTarget ?? row.target ?? ''),
                new_target: String(row.validatorTarget ?? row.target ?? ''),
                old_actual: String(row.appraiserActual ?? row.actual ?? ''),
                new_actual: String(row.validatorActual ?? row.actual ?? ''),
                old_mpb: String(row.oldMpb || row.mpb || ''),
                new_mpb: String(row.newMpb || row.mpb || ''),
                chk_status: row.checked ? 'on' : 'off',
                old_score: String(row.appraiserScore ?? row.score ?? ''),
                max_score: String(row.maxScore ?? ''),
                MONTH: String(row.month ?? ''),
                repa_score: String(row.repaScore || row.validatorScore || ''),
                prev_target: String(row.prevTarget || row.previousTarget || ''),
                prev_actual: String(row.prevActual || row.previousActual || ''),
            },
        })),
    };
};
