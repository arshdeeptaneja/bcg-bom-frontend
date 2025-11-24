/**
 * Exception Review Constants
 * Shared constants used across exception review components
 */

export const DECLARATION_OPTIONS = {
  ACCEPT_AS_IS: 'ACCEPT_AS_IS',
  ACCEPT_AND_EDIT: 'ACCEPT_AND_EDIT',
  REJECT: 'REJECT',
};

/**
 * Numeric declaration option mapping for backend API
 * Backend expects numeric values (1, 2, 3) instead of strings
 */
export const DECLARATION_NUMERIC_MAP = {
  [DECLARATION_OPTIONS.ACCEPT_AS_IS]: 1,
  [DECLARATION_OPTIONS.ACCEPT_AND_EDIT]: 2,
  [DECLARATION_OPTIONS.REJECT]: 3,
};

export const ROW_ACTIONS = {
  ACCEPT: 'accept',
  EDIT: 'edit',
  REJECT: 'reject',
};

export const ROLES = {
  APPRAISER: 'APPRAISER',
  VALIDATOR: 'VALIDATOR',
  VERIFIER: 'VERIFIER',
};

export const QUARTERS = {
  Q1: 'Q1',
  Q2: 'Q2',
  Q3: 'Q3',
  Q4: 'Q4',
};

export const APPRAISAL_PERIODS = {
  QUARTERLY: 'Quarterly',
  ANNUAL: 'Annual',
};
