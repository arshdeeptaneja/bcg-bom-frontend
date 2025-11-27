import { ROW_ACTIONS } from './exceptionConstants';

/**
 * Field mapping configurations for different review modes
 */

/**
 * Verify/Appraiser mode field mappings
 * Used when appraiser is reviewing and editing KRAs
 */
export const VERIFY_FIELDS = {
    // Field names for editable values in verify mode
    actual: 'appraiserActual',
    target: 'appraiserTarget',
    score: 'appraiserScore',
    comment: 'appraiserComment',
    
    // Normalization mapping from API response to component state
    normalize: {
        id: ['kraId', 'id', 'urlId'],
        kraId: ['kraId', 'id', 'urlId', 'KRA_CODE'],
        kra: ['kra', 'kraName', 'metric', 'kra_desc'],
        unit: ['unit', 'unitOfMeasure'],
        actual: ['actual', 'appraiseeActual'],
        appraisee: ['appraisee', 'appraiseeActual'],
        appraiserActual: ['appraiserActual', 'appraiser_value', 'new_actual'],
        target: ['target', 'appraiseeTarget'],
        appraiserTarget: ['appraiserTarget', 'target', 'new_target'],
        maxScore: ['maxScore', 'max_score'],
        score: ['score'],
        appraiserScore: ['appraiserScore', 'score', 'repa_score'],
        month: ['month', 'period', 'MONTH'],
        category: ['category', 'kraCategory', 'kra_type'],
        selfComment: ['selfComment', 'appraiseeComment'],
        appraiserComment: ['appraiserComment', 'comment'],
        // Original/previous values for POST payload
        originalTarget: ['old_target', 'original_target'],
        originalActual: ['old_actual', 'original_actual'],
        originalScore: ['old_score', 'original_score'],
        prevTarget: ['prev_target', 'previous_target'],
        prevActual: ['prev_actual', 'previous_actual'],
        kraType: ['kra_type', 'category'],
        parentKra: ['PARENT_KRA', 'parent_kra'],
        descriptorScore: ['descriptor_score'],
        oldMpb: ['old_mpb'],
        newMpb: ['new_mpb'],
        repaScore: ['repa_score'],
    },
};

/**
 * Validator mode field mappings
 * Used when validator is reviewing appraiser's corrections
 */
export const VALIDATOR_FIELDS = {
    // Field names for editable values in validator mode
    actual: 'validatorActual',
    target: 'validatorTarget',
    score: 'validatorScore',
    comment: 'validatorComment',
    
    // Normalization mapping from API response to component state
    normalize: {
        id: ['KRA_CODE', 'kraId', 'id', 'urlId'],
        kraId: ['KRA_CODE', 'kraId', 'id', 'urlId'],
        kra: ['kra_desc', 'kra', 'kraName', 'metric'],
        unit: ['unit', 'unitOfMeasure'],
        actual: ['final_actual', 'actual', 'appraiseeActual'],
        appraisee: ['appraisee', 'final_actual', 'appraiseeActual'],
        appraiserActual: ['APPRAISER_ACTUAL', 'appraiserActual', 'appraiser_value', 'old_actual'],
        validatorActual: ['VALIDATOR_ACTUAL', 'validatorActual', 'new_actual'],
        target: ['final_target', 'target', 'appraiseeTarget'],
        appraiserTarget: ['APPRAISER_TARGET', 'appraiserTarget', 'target', 'old_target'],
        validatorTarget: ['VALIDATOR_TARGET', 'validatorTarget', 'new_target'],
        maxScore: ['maxscore', 'maxScore', 'max_score'],
        score: ['self_score', 'score'],
        appraiserScore: ['APPRAISER_SCORE', 'appraiserScore', 'score', 'old_score'],
        validatorScore: ['VALIDATOR_SCORE', 'validatorScore', 'repa_score'],
        month: ['MONTH', 'month', 'period'],
        category: ['category', 'kraCategory', 'kra_type'],
        selfComment: ['COMMENT_SELF', 'selfComment', 'appraiseeComment'],
        appraiserComment: ['APPRAISER_COMMENT', 'appraiserComment'],
        validatorComment: ['VALIDATOR_COMMENT', 'validatorComment', 'comment'],
        // Original/previous values for POST payload
        originalTarget: ['old_target', 'APPRAISER_TARGET', 'original_target'],
        originalActual: ['old_actual', 'APPRAISER_ACTUAL', 'original_actual'],
        originalScore: ['old_score', 'APPRAISER_SCORE', 'original_score'],
        prevTarget: ['prev_target', 'previous_target'],
        prevActual: ['prev_actual', 'previous_actual'],
        kraType: ['kra_type', 'category'],
        parentKra: ['PARENT_KRA', 'parent_kra'],
        descriptorScore: ['descriptor_score'],
        oldMpb: ['old_mpb'],
        newMpb: ['new_mpb'],
        repaScore: ['repa_score'],
    },
};

/**
 * Normalize KRA rows from API response to component state
 * @param {Array} payload - Raw API response data
 * @param {Object} fieldConfig - Field mapping configuration (VERIFY_FIELDS or VALIDATOR_FIELDS)
 * @returns {Array} - Normalized KRA rows with UI state properties
 */
export const normalizeKraRows = (payload = [], fieldConfig = VERIFY_FIELDS) => {
    console.log("payload", payload)
    if (!Array.isArray(payload)) return [];
    
    const { normalize } = fieldConfig;
    console.log("payload: ",payload)
    return payload.map((item, index) => {
        const normalized = {
            // UI state properties
            commentOpen: true,
            checked: false,
            action: ROW_ACTIONS.ACCEPT,
        };
        
        // Apply field mappings with fallbacks
        Object.keys(normalize).forEach((key) => {
            const fieldNames = normalize[key];
            let value = '';
            
            // Try each field name in order until we find a value
            for (const fieldName of fieldNames) {
                if (item[fieldName] !== undefined && item[fieldName] !== null) {
                    value = item[fieldName];
                    break;
                }
            }
            
            // Handle special cases
            if (key === 'id' || key === 'kraId') {
                normalized[key] = value || index + 1;
            } else if (key === 'kra') {
                normalized[key] = value || 'KRA';
            } else if (key === 'unit') {
                normalized[key] = value || '-';
            } else {
                normalized[key] = value ?? '';
            }
        });

        console.log("normalized data: ", normalized)
        
        return normalized;
    });
};
