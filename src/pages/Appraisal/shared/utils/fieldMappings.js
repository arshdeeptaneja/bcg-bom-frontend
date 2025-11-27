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
    appraisee: ['new_actual', 'appraisee', 'appraiseeActual'],
    appraiseeTarget: ['new_target', 'appraiseeTarget'],
    appraiserActual: ['appraiserActual', 'appraiser_value'],
    target: ['target'],
    appraiserTarget: ['appraiserTarget', 'target'],
    maxScore: ['maxScore', 'max_score', 'maxscore'],
    score: ['score'],
    appraiserScore: ['appraiserScore', 'score', 'repa_score'],
    month: ['month', 'period', 'MONTH'],
    category: ['category', 'kraCategory', 'kra_type'],
    selfComment: ['COMMENT_SELF', 'selfComment', 'appraiseeComment'],
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
    appraisee: ['new_actual', 'appraisee', 'appraiseeActual'],
    appraiseeTarget: ['new_target', 'appraiseeTarget'],
    appraiserActual: ['appraiserActual', 'appraiser_value'],
    target: ['target'],
    appraiserTarget: ['appraiserTarget', 'target'],
    maxScore: ['maxScore', 'max_score', 'maxscore'],
    score: ['score'],
    appraiserScore: ['appraiserScore', 'score', 'repa_score'],
    month: ['month', 'period', 'MONTH'],
    category: ['category', 'kraCategory', 'kra_type'],
    selfComment: ['COMMENT_SELF', 'selfComment', 'appraiseeComment'],
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
 * Normalize KRA rows from API response to component state
 * @param {Array} payload - Raw API response data
 * @param {Object} fieldConfig - Field mapping configuration (VERIFY_FIELDS or VALIDATOR_FIELDS)
 * @returns {Array} - Normalized KRA rows with UI state properties
 */
export const normalizeKraRows = (payload = [], fieldConfig = VERIFY_FIELDS) => {
  console.log('payload', payload);
  if (!Array.isArray(payload)) return [];

  const { normalize } = fieldConfig;
  console.log('payload: ', payload);
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

    console.log('normalized data: ', normalized);

    return normalized;
  });
};
