import { DECLARATION_OPTIONS, DECLARATION_NUMERIC_MAP, ROW_ACTIONS } from './exceptionConstants';

/**
 * Parse financial year from string format
 * @param {string} fy - Financial year in format "FY 2024-25" or "2024"
 * @returns {string} - Extracted year as string (e.g., "2024")
 */
export const parseFinancialYear = (fy) => {
    if (!fy) return '';
    const match = `${fy}`.match(/(\d{4})/);
    return match ? match[1] : `${fy}`;
};

/**
 * Build date range string for a given quarter and financial year
 * @param {string} fyLabel - Financial year label (e.g., "FY 2024-25")
 * @param {string} quarterLabel - Quarter label (Q1, Q2, Q3, Q4)
 * @returns {string} - Formatted date range (e.g., "01 Apr 2024 - 30 Jun 2024")
 */
export const buildQuarterDateRange = (fyLabel, quarterLabel) => {
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

/**
 * Derive declaration option based on row actions
 * @param {Array} rows - Array of KRA rows with action property
 * @returns {number} - Numeric declaration option (1=ACCEPT_AS_IS, 2=ACCEPT_AND_EDIT, 3=REJECT)
 */
export const deriveDeclarationOption = (rows = []) => {
    let option;
    if (rows.some((row) => row.action === ROW_ACTIONS.REJECT)) {
        option = DECLARATION_OPTIONS.REJECT;
    } else if (rows.some((row) => row.action === ROW_ACTIONS.EDIT)) {
        option = DECLARATION_OPTIONS.ACCEPT_AND_EDIT;
    } else {
        option = DECLARATION_OPTIONS.ACCEPT_AS_IS;
    }
    return DECLARATION_NUMERIC_MAP[option] || 1;
};

/**
 * Validate selected rows have required comments
 * @param {Array} selectedRows - Selected KRA rows
 * @param {string} commentField - Name of comment field to check (e.g., 'appraiserComment')
 * @returns {Object} - { isValid: boolean, message: string }
 */
export const validateRowComments = (selectedRows, commentField = 'appraiserComment') => {
    if (!selectedRows.length) {
        return {
            isValid: false,
            message: 'Select at least one KRA before submitting',
        };
    }

    const rowsMissingComment = selectedRows.filter(
        (row) => row.action !== ROW_ACTIONS.ACCEPT && !row[commentField]?.trim()
    );

    if (rowsMissingComment.length) {
        return {
            isValid: false,
            message: 'Please add comments for every edited or rejected KRA',
        };
    }

    return { isValid: true, message: '' };
};
