# Annual Appraisal Review/Acceptor Flow - Implementation Plan

**Version:** 1.0
**Date:** 2025-11-26
**Status:** Ready for Implementation

---

## Table of Contents

1. [Overview](#1-overview)
2. [Files to Create](#2-files-to-create)
3. [API Integration Details](#3-api-integration-details)
4. [Component Architecture](#4-component-architecture)
5. [UI Component Structure](#5-ui-component-structure)
6. [CSS Styling](#6-css-styling)
7. [Development Inputs Handling](#7-development-inputs-handling)
8. [Validation Logic](#8-validation-logic)
9. [Submit Payload Structure](#9-submit-payload-structure)
10. [Implementation Steps](#10-implementation-steps)
11. [Key Differences from AnnualAppraisalReview](#11-key-differences-from-annualappraisalreview)
12. [Critical Files Reference](#12-critical-files-reference)
13. [Testing Checklist](#13-testing-checklist)

---

## 1. Overview

Building an **Annual Reviewer/Acceptor component** that allows REVIEWER and ACCEPTOR roles to review appraisals submitted by both appraisee and appraiser, then add their own scores and comments.

### Key Requirements

- **Target Users**: REVIEWER (Reviewing Authority) and ACCEPTOR (Accepting Authority)
- **Data Source**: GET `/appraisal/acceptor_appraisal`
- **Submission**: POST endpoint (mocked for now)
- **Component Name**: `AnnualReview.js`
- **UI Pattern**: 3-column layout (Appraisee | Appraiser | Reviewer/Acceptor)
- **Edit Permissions**: Only REVA/AC fields are editable, all other data is read-only

### Business Context

This component is part of a hierarchical appraisal workflow:
1. **Appraisee** fills self-appraisal (AnnualCheckIn.js)
2. **Appraiser** reviews and scores appraisee's submission (AnnualAppraisalReview.js)
3. **Reviewer/Acceptor** reviews both and provides final assessment (**AnnualReview.js** - THIS COMPONENT)

---

## 2. Files to Create

### 2.1 Component Files

```
src/pages/Appraisal/AppraisalCheckInForm/annual/
├── AnnualReview.js          # NEW - UI component for reviewer/acceptor
├── useAnnualReview.js       # NEW - Custom hook (data fetching, state, submission)
└── AnnualReview.css         # NEW - Styling with 3-column layouts
```

### 2.2 Files to Modify

- **src/services/api.js** - Already has `getAcceptorAppraisal` and `submitAcceptorAppraisal` methods (no changes needed)
- **src/pages/Appraisal/AppraisalCheckInForm/annual/index.js** - Export new AnnualReview component

---

## 3. API Integration Details

### 3.1 GET Endpoint (Already Exists)

**Location**: `src/services/api.js` lines 659-691

```javascript
appraisalAPI.getAcceptorAppraisal({
  empNo,              // Employee number
  urlId,              // Assignment/URL ID
  roleName,           // Optional role name
  roleId,             // Optional role ID
  zoneName,           // Zone/region name
  financialYear,      // e.g., "2025"
  appraisalPeriod,    // "Annual"
  quarter,            // e.g., "Q2"
  appraisalStatus,    // Optional status filter
})
```

**Response Fields (Per KRA):**
- `ACTUAL`, `COMMENT_SELF_1`, `COMMENT_SELF_2` - Appraisee data (read-only)
- `REPA_ACTUALS`, `COMMENT_REPA` - Appraiser data (read-only)
- `REVA_ACTUALS`, `COMMENT_REVA`, `REVA_SCORE` - Reviewer data (EDITABLE if role = REVIEWER)
- `AC_ACTUALS`, `COMMENT_AC`, `AC_SCORE` - Acceptor data (EDITABLE if role = ACCEPTOR)

**Response Fields (Per Question):**
- `SELF_RESPONSE`, `SELF_RESPONSE_2` - Appraisee responses (read-only)
- `REPA_RESPONSE` - Appraiser response (read-only)
- `REVA_RESPONSE` - Reviewer response (EDITABLE if role = REVIEWER)
- `AC_RESPONSE` - Acceptor response (EDITABLE if role = ACCEPTOR)

### 3.2 POST Endpoint (Mock for now)

**Location**: Will be added to `src/services/api.js` (already exists as `submitAcceptorAppraisal`)

```javascript
// In useAnnualReview.js - mutation function
const submitMutation = useMutation({
  mutationFn: (payload) => {
    // MOCKED - replace when backend ready
    console.log('[Mock] Submitting acceptor review:', payload);
    return Promise.resolve({
      success: true,
      message: 'Review submitted successfully'
    });

    // UNCOMMENT when backend ready:
    // return appraisalAPI.submitAcceptorAppraisal(payload);
  },
  onSuccess: (response) => {
    toast.success(response.message || 'Review submitted successfully');
    navigate(-1);
  },
  onError: (error) => {
    toast.error('Failed to submit review. Please try again.');
  },
});
```

---

## 4. Component Architecture

### 4.1 useAnnualReview.js Hook Structure

**Pattern Reference**: Follow `useAnnualAppraisalReview.js` pattern

**File**: `src/pages/Appraisal/AppraisalCheckInForm/annual/useAnnualReview.js`

```javascript
import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { appraisalAPI } from '../../../../services/api';
import { toast } from 'react-toastify';
import { transformAnnualAppraisalData } from '../appraisalTransformers';

/**
 * Annual Review Hook (Reviewer/Acceptor)
 *
 * Handles reviewer/acceptor flow for annual appraisals including:
 * - Data fetching via getAcceptorAppraisal
 * - Reviewer scores and comments for each KRA
 * - Development input responses for Reviewing Authority
 * - Role switching between REVIEWER and ACCEPTOR
 * - Submit-only functionality (no save draft)
 */
export const useAnnualReview = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract params from location.state
  const {
    empNo,
    financialYear,
    quarter,
    url,
    urlId,
    zoneName,
    roleType,
    employee: employeeFromState,
    appraisalPeriod = 'Annual',
    dateRange: dateRangeFromState,
  } = location.state || {};

  // Normalize financial year (e.g., "FY 2024-25" -> "2024")
  const normalizedFinancialYear = useMemo(() => {
    if (!financialYear) return null;
    const match = financialYear.match(/(\d{4})/);
    return match ? match[1] : financialYear;
  }, [financialYear]);

  // Context validation
  const isContextValid = Boolean(empNo && normalizedFinancialYear && (url || urlId));

  // Role state (REVIEWER vs ACCEPTOR)
  const [currentRole, setCurrentRole] = useState('REVIEWER');

  // Reviewer scores per KRA: { [AP_KRA_ID]: { score, comment } }
  const [reviewerScores, setReviewerScores] = useState({});

  // Development responses: { [questionId]: string }
  const [reviewerDevResponses, setReviewerDevResponses] = useState({});

  // Option-based responses: { integrity: null }
  const [reviewerOptionResponses, setReviewerOptionResponses] = useState({
    integrity: null,
  });

  const [isDirty, setIsDirty] = useState(false);

  // Raw API data for payload building
  const [rawKraData, setRawKraData] = useState([]);
  const [rawQuestionsData, setRawQuestionsData] = useState([]);
  const [learningMetrics, setLearningMetrics] = useState({
    continuousLearningPresent: false,
    mandatoryCourses: 0,
    learningCourses: 0,
    speedCircular: 0,
    elearningScore: 0,
  });

  // Query key for acceptor appraisal data
  const queryKey = [
    'acceptorAppraisal',
    empNo,
    normalizedFinancialYear,
    quarter,
    url || urlId,
  ];

  // Debug logging
  console.log('[useAnnualReview] Context values:', {
    empNo,
    financialYear,
    normalizedFinancialYear,
    quarter,
    url,
    urlId,
    zoneName,
    roleType,
    isContextValid,
  });

  // Fetch acceptor appraisal data
  const { data: apiResponse, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => {
      const apiParams = {
        empNo,
        urlId: url || urlId,
        roleName: roleType,
        roleId: null,
        zoneName,
        financialYear: normalizedFinancialYear,
        appraisalPeriod: 'Annual',
        quarter: quarter || 'Q2',
        appraisalStatus: null,
      };
      console.log('[useAnnualReview] API call params:', apiParams);
      return appraisalAPI.getAcceptorAppraisal(apiParams);
    },
    enabled: isContextValid,
  });

  // Transform API response using existing transformer
  const transformedData = useMemo(() => {
    if (!apiResponse) return null;
    return transformAnnualAppraisalData(apiResponse);
  }, [apiResponse]);

  // Store raw API data when response changes
  useEffect(() => {
    if (!apiResponse) return;

    // Store raw KRA data
    const rawKras = apiResponse.result_kra_list_discretionary_non_measurable_child || [];
    setRawKraData(rawKras);

    // Store raw questions data
    const resultQuestions = apiResponse.result_questions?.development_inputs || {};
    const allQuestions = [
      ...(resultQuestions.overall_development || []),
      ...(resultQuestions.reporting_review_authority || []),
      ...(resultQuestions.integrity || []),
      ...(resultQuestions.health_problems || []),
      ...(resultQuestions.disciplinary_actions || []),
    ];
    setRawQuestionsData(allQuestions);

    // Store learning metrics
    setLearningMetrics({
      continuousLearningPresent: apiResponse.continuous_learning_present ?? false,
      mandatoryCourses: apiResponse.mandatory_courses ?? 0,
      learningCourses: apiResponse.learning_courses ?? 0,
      speedCircular: apiResponse.speed_circular ?? 0,
      elearningScore: apiResponse.elearning_score ?? 0,
    });
  }, [apiResponse]);

  // Extract development inputs
  const developmentInputs = useMemo(() => {
    if (!apiResponse) {
      return {
        overallDevelopment: [],
        reportingReviewAuthority: [],
        optionBased: []
      };
    }

    const resultQuestions = apiResponse.result_questions?.development_inputs || {};

    // Overall Development (Appraisee - Read-only)
    const overallDevelopment = (resultQuestions.overall_development || []).map((q) => ({
      id: q.ID,
      question: q.QUESTION,
      category: q.CATEGORY,
      subCategory: q.SUB_CATEGORY,
      selfResponse: q.SELF_RESPONSE || '',
      selfResponse2: q.SELF_RESPONSE_2 || '',
      repaResponse: q.REPA_RESPONSE || '',
      revaResponse: q.REVA_RESPONSE || '',
      acResponse: q.AC_RESPONSE || '',
      responseId: q.RESPONSE_ID,
      editableBy: 'APPRAISEE', // Read-only for reviewer
    }));

    // Reporting/Review Authority (Editable by REVIEWER/ACCEPTOR)
    const reportingReviewAuthority = (resultQuestions.reporting_review_authority || []).map((q) => ({
      id: q.ID,
      question: q.QUESTION,
      category: q.CATEGORY,
      subCategory: q.SUB_CATEGORY,
      selfResponse: q.SELF_RESPONSE || '',
      repaResponse: q.REPA_RESPONSE || '',
      revaResponse: q.REVA_RESPONSE || '',
      acResponse: q.AC_RESPONSE || '',
      responseId: q.RESPONSE_ID,
      editableBy: 'REVIEWER_ACCEPTOR',
    }));

    // Option-based inputs
    const optionBased = [];

    // Integrity (ID 19) - 3 options
    const integrityQuestions = resultQuestions.integrity || [];
    integrityQuestions.forEach((q) => {
      optionBased.push({
        id: q.ID,
        key: 'integrity',
        question: q.QUESTION,
        category: q.CATEGORY,
        subCategory: q.SUB_CATEGORY,
        options: [
          { value: 'option1', label: q.OPTION1 },
          { value: 'option2', label: q.OPTION2 },
          { value: 'option3', label: q.OPTION3 },
        ].filter((o) => o.label),
        selfResponse: q.SELF_RESPONSE || '',
        repaResponse: q.REPA_RESPONSE || '',
        revaResponse: q.REVA_RESPONSE || '',
        acResponse: q.AC_RESPONSE || '',
        editableBy: 'REVIEWER_ACCEPTOR',
      });
    });

    // Health Problems (ID 10) - Yes/No (Read-only)
    const healthQuestions = resultQuestions.health_problems || [];
    healthQuestions.forEach((q) => {
      optionBased.push({
        id: q.ID,
        key: 'healthProblems',
        question: q.QUESTION,
        category: q.CATEGORY,
        subCategory: q.SUB_CATEGORY,
        options: [
          { value: 'yes', label: q.OPTION1 || 'Yes' },
          { value: 'no', label: q.OPTION2 || 'No' },
        ],
        selfResponse: q.SELF_RESPONSE || '',
        repaResponse: q.REPA_RESPONSE || '',
        editableBy: 'APPRAISEE', // Read-only
      });
    });

    // Disciplinary Actions (ID 11) - Yes/No (Read-only)
    const disciplinaryQuestions = resultQuestions.disciplinary_actions || [];
    disciplinaryQuestions.forEach((q) => {
      optionBased.push({
        id: q.ID,
        key: 'disciplinaryActions',
        question: q.QUESTION,
        category: q.CATEGORY,
        subCategory: q.SUB_CATEGORY,
        options: [
          { value: 'yes', label: q.OPTION1 || 'Yes' },
          { value: 'no', label: q.OPTION2 || 'No' },
        ],
        selfResponse: q.SELF_RESPONSE || '',
        repaResponse: q.REPA_RESPONSE || '',
        editableBy: 'APPRAISEE', // Read-only
      });
    });

    return { overallDevelopment, reportingReviewAuthority, optionBased };
  }, [apiResponse]);

  // Initialize reviewer scores from existing data
  useEffect(() => {
    if (!transformedData) return;

    // Initialize reviewer scores from existing REVA/AC data
    const initialReviewerScores = {};
    if (transformedData.nonMeasurableKras) {
      Object.values(transformedData.nonMeasurableKras).forEach((kraList) => {
        kraList.forEach((kra) => {
          initialReviewerScores[kra.KraId] = {
            score: currentRole === 'REVIEWER' ? kra.RevaActuals : kra.AcActuals,
            comment: currentRole === 'REVIEWER' ? kra.CommentReva : kra.CommentAc,
          };
        });
      });
    }
    setReviewerScores(initialReviewerScores);

    // Initialize reviewer development responses
    const initialDevResponses = {};
    developmentInputs.reportingReviewAuthority?.forEach((q) => {
      const existingResponse = currentRole === 'REVIEWER' ? q.revaResponse : q.acResponse;
      initialDevResponses[q.id] = existingResponse || '';
    });
    setReviewerDevResponses(initialDevResponses);

    // Initialize reviewer option responses
    developmentInputs.optionBased?.forEach((q) => {
      if (q.key === 'integrity' && q.editableBy === 'REVIEWER_ACCEPTOR') {
        const existingResponse = currentRole === 'REVIEWER' ? q.revaResponse : q.acResponse;
        setReviewerOptionResponses((prev) => ({
          ...prev,
          integrity: existingResponse || null,
        }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transformedData, currentRole, developmentInputs]);

  // Error handling
  useEffect(() => {
    if (isError) {
      toast.error('Failed to load acceptor appraisal data. Please try again.');
    }
  }, [isError]);

  // Change handlers
  const handleReviewerScoreChange = (kraId, score) => {
    setReviewerScores((prev) => ({
      ...prev,
      [kraId]: {
        ...prev[kraId],
        score,
      },
    }));
    setIsDirty(true);
  };

  const handleReviewerCommentChange = (kraId, comment) => {
    setReviewerScores((prev) => ({
      ...prev,
      [kraId]: {
        ...prev[kraId],
        comment,
      },
    }));
    setIsDirty(true);
  };

  const handleReviewerDevInputChange = (questionId, value) => {
    setReviewerDevResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
    setIsDirty(true);
  };

  const handleReviewerOptionChange = (key, value) => {
    setReviewerOptionResponses((prev) => ({
      ...prev,
      [key]: value,
    }));
    setIsDirty(true);
  };

  const handleRoleChange = (e) => {
    if (isDirty) {
      const confirmed = window.confirm(
        'Changing roles will reload the form. Any unsaved changes will be lost. Continue?'
      );
      if (!confirmed) return;
    }
    setCurrentRole(e.target.value);
    setIsDirty(false);
  };

  /**
   * Build submit payload for reviewer/acceptor
   */
  const buildSubmitPayload = () => {
    // Build kraData array with reviewer/acceptor updates
    const kraData = rawKraData.map((originalKra) => {
      const kraId = originalKra.AP_KRA_ID;
      const reviewerInput = reviewerScores[kraId] || {};

      // Determine which fields to update based on current role
      const updates = {};
      if (currentRole === 'REVIEWER') {
        updates.REVA_ACTUALS = reviewerInput.score || originalKra.REVA_ACTUALS;
        updates.COMMENT_REVA = reviewerInput.comment || originalKra.COMMENT_REVA || null;
        updates.REVA_SCORE = reviewerInput.score || originalKra.REVA_SCORE;
      } else if (currentRole === 'ACCEPTOR') {
        updates.AC_ACTUALS = reviewerInput.score || originalKra.AC_ACTUALS;
        updates.COMMENT_AC = reviewerInput.comment || originalKra.COMMENT_AC || null;
        updates.AC_SCORE = reviewerInput.score || originalKra.AC_SCORE;
      }

      return {
        ...originalKra,
        ...updates,
      };
    });

    // Build questions array with reviewer/acceptor responses
    const questions = rawQuestionsData.map((originalQuestion) => {
      const questionId = originalQuestion.ID;
      const reviewerResponse = reviewerDevResponses[questionId];

      const updates = {};
      if (reviewerResponse !== undefined) {
        if (currentRole === 'REVIEWER') {
          updates.REVA_RESPONSE = reviewerResponse;
        } else if (currentRole === 'ACCEPTOR') {
          updates.AC_RESPONSE = reviewerResponse;
        }
      }

      // Handle option-based responses (integrity)
      if (originalQuestion.CATEGORY === 'Development Inputs' &&
          originalQuestion.SUB_CATEGORY === 'Integrity') {
        if (currentRole === 'REVIEWER' && reviewerOptionResponses.integrity) {
          updates.REVA_RESPONSE = reviewerOptionResponses.integrity;
          updates.OPTIONS_REVA = reviewerOptionResponses.integrity;
        } else if (currentRole === 'ACCEPTOR' && reviewerOptionResponses.integrity) {
          updates.AC_RESPONSE = reviewerOptionResponses.integrity;
        }
      }

      return {
        QUESTION_ID: originalQuestion.ID,
        CATEGORY: originalQuestion.CATEGORY,
        SUB_CATEGORY: originalQuestion.SUB_CATEGORY,
        QUESTION: originalQuestion.QUESTION,
        OPTION1: originalQuestion.OPTION1 || null,
        OPTION2: originalQuestion.OPTION2 || null,
        OPTION3: originalQuestion.OPTION3 || null,
        RESPONSE_ID: originalQuestion.RESPONSE_ID || null,
        SELF_RESPONSE: originalQuestion.SELF_RESPONSE || null,
        SELF_RESPONSE_2: originalQuestion.SELF_RESPONSE_2 || null,
        REPA_RESPONSE: originalQuestion.REPA_RESPONSE || null,
        REVA_RESPONSE: originalQuestion.REVA_RESPONSE || null,
        AC_RESPONSE: originalQuestion.AC_RESPONSE || null,
        OPTIONS_REPA: originalQuestion.OPTIONS_REPA || null,
        OPTIONS_REVA: originalQuestion.OPTIONS_REVA || null,
        ...updates,
      };
    });

    // Derive functions array from unique KRA_DESC
    const functions = [...new Set(kraData.map((kra) => kra.KRA_DESC).filter(Boolean))];

    return {
      id: url || urlId || null,
      empNo,
      ecNumber: empNo,
      financialYear: parseInt(normalizedFinancialYear, 10),
      roleType: currentRole, // 'REVIEWER' or 'ACCEPTOR'

      // Learning metrics (if available)
      continuousLearningPresent: learningMetrics.continuousLearningPresent,
      mandatoryCourses: learningMetrics.mandatoryCourses,
      learningCourses: learningMetrics.learningCourses,
      speedCircular: learningMetrics.speedCircular,
      elearningScore: learningMetrics.elearningScore,

      kraData,
      functions,
      questions,
      feedbackInput: [],

      warningFlag: false,
      warningComment: '',
      varianceFlag: false,
    };
  };

  /**
   * Validate form before submission
   */
  const validateForm = () => {
    const errors = [];

    // Check all KRAs have reviewer scores
    rawKraData.forEach((kra) => {
      const kraId = kra.AP_KRA_ID;
      if (!reviewerScores[kraId]?.score) {
        errors.push(`Please select a score for "${kra.KRA_DESC}"`);
      }
    });

    // Check all required development questions are filled
    developmentInputs.reportingReviewAuthority?.forEach((q) => {
      if (q.editableBy === 'REVIEWER_ACCEPTOR') {
        const response = reviewerDevResponses[q.id];
        if (!response?.trim()) {
          errors.push(`Please provide a response for "${q.question.substring(0, 50)}..."`);
        }
      }
    });

    // Check integrity option is selected (if applicable)
    developmentInputs.optionBased?.forEach((q) => {
      if (q.key === 'integrity' && q.editableBy === 'REVIEWER_ACCEPTOR') {
        if (!reviewerOptionResponses.integrity) {
          errors.push('Please select an integrity assessment');
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  // Submit mutation (mocked for now)
  const submitMutation = useMutation({
    mutationFn: (payload) => {
      // MOCKED - Replace with real API when ready
      console.log('[Mock] Submitting acceptor review:', payload);
      return Promise.resolve({
        success: true,
        message: 'Review submitted successfully',
      });

      // UNCOMMENT when backend is ready:
      // return appraisalAPI.submitAcceptorAppraisal(payload);
    },
    onSuccess: (response) => {
      console.log('[useAnnualReview] Submit success:', response);
      toast.success(response.message || 'Review submitted successfully');
      setIsDirty(false);
      navigate(-1);
    },
    onError: (error) => {
      console.error('[useAnnualReview] Submit error:', error);
      const errorMessage =
        error.response?.data?.MSG || error.message || 'Failed to submit review. Please try again.';
      toast.error(errorMessage);
    },
  });

  const handleSubmit = () => {
    const { isValid, errors } = validateForm();

    if (!isValid) {
      // Show first 3 errors max to avoid overwhelming the user
      const displayErrors = errors.slice(0, 3);
      displayErrors.forEach((err) => toast.error(err));
      if (errors.length > 3) {
        toast.warning(`And ${errors.length - 3} more validation errors...`);
      }
      return;
    }

    const payload = buildSubmitPayload();
    console.log('[useAnnualReview] Submit payload:', payload);
    submitMutation.mutate(payload);
  };

  return {
    // Data
    data: transformedData,
    developmentInputs,
    isLoading,
    isError,

    // Context
    context: {
      employee: employeeFromState || {
        name: apiResponse?.emp_name || '',
        empNo: empNo,
        designation: apiResponse?.designation || '',
        branch: apiResponse?.branch || '',
      },
      financialYear,
      quarter,
      appraisalPeriod,
      dateRange: dateRangeFromState || {},
      metadata: {
        reportingAuthorityName: apiResponse?.REPORTING_AUTHORITY_NAME || '',
        reviewingAuthorityName: apiResponse?.REVIEWING_AUTHORITY_NAME || '',
        acceptingAuthorityName: apiResponse?.ACCEPTING_AUTHORITY_NAME || '',
      },
    },

    // Role state
    roleState: {
      currentRole,
      handleRoleChange,
    },

    // Form state
    formState: {
      reviewerScores,
      reviewerDevResponses,
      reviewerOptionResponses,
      isDirty,
    },

    // Actions
    actions: {
      handleSubmit,
      handleReviewerScoreChange,
      handleReviewerCommentChange,
      handleReviewerDevInputChange,
      handleReviewerOptionChange,
      isSubmitting: submitMutation.isPending,
    },
  };
};
```

---

## 5. UI Component Structure

### 5.1 AnnualReview.js Layout

**File**: `src/pages/Appraisal/AppraisalCheckInForm/annual/AnnualReview.js`

This file will be created following the pattern of `AnnualAppraisalReview.js` but with modifications for the 3-column layout and role switching.

**Key sections to implement:**
1. Header with role selector dropdown
2. Employee info section (CheckInDescriptionSection)
3. Read-only Final Score Summary table
4. 3-column Non-Measurable KRAs section with score buttons
5. Collapsible 3-column comments section
6. Read-only appraisee development inputs
7. Read-only appraiser responses
8. Editable reviewer/acceptor textarea fields
9. Submit button section

**Refer to plan Section 5.1 in the approved plan document for the full JSX structure.**

---

## 6. CSS Styling

### 6.1 AnnualReview.css

**File**: `src/pages/Appraisal/AppraisalCheckInForm/annual/AnnualReview.css`

**Base Strategy**: Copy styles from `AnnualAppraisalReview.css` and add new classes for:
- 3-column grid layouts
- Yellow highlighting for editable sections
- 3-column comment containers
- Read-only vs editable visual distinction

**Key CSS Classes to Add:**

```css
/* 3-Column Header Bar */
.review-kra-header-bar-3col {
  display: grid;
  grid-template-columns: 30% 12% 12% 25% 15%;
  gap: 8px;
  padding: 12px;
  background-color: var(--primary-color);
  color: white;
  font-weight: bold;
  border-radius: 8px 8px 0 0;
}

/* 3-Column Comments Layout */
.comments-3col-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

/* Read-only comment sections */
.read-only-comment-section {
  background-color: #e9ecef;
  padding: 12px;
  border-left: 4px solid #6c757d;
  border-radius: 4px;
}

.read-only-comment-section label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
  display: block;
}

.read-only-field {
  color: #495057;
  line-height: 1.5;
}

/* Reviewer editable sections - Yellow highlight */
.reviewer-input-section {
  background-color: #fff3cd;
  padding: 12px;
  border-left: 4px solid #ffc107;
  border-radius: 4px;
}

.reviewer-input-section textarea {
  width: 100%;
  border: 2px solid #ffc107;
  border-radius: 4px;
  padding: 8px;
  min-height: 100px;
  font-family: inherit;
}

.reviewer-highlight {
  background-color: #ffc107;
  color: #000;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
}

/* Score buttons */
.review-score-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #6c757d;
  border-radius: 50%;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
}

.review-score-btn:hover:not(:disabled) {
  border-color: #ffc107;
  background-color: #fff3cd;
  transform: scale(1.05);
}

.review-score-btn-selected {
  background-color: #ffc107;
  border-color: #ffc107;
  color: #000;
  font-weight: bold;
  transform: scale(1.1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.review-score-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Reviewer input cell highlighting */
.reviewer-input-cell {
  background-color: #fff3cd;
  padding: 12px;
}

/* KRA row styling */
.kra-row {
  border-bottom: 1px solid #dee2e6;
}

.kra-row:hover {
  background-color: #f8f9fa;
}

/* Comment row */
.comment-row td {
  padding: 0 !important;
}

/* Badge styling for scores */
.badge {
  font-size: 1rem;
  padding: 0.5rem 1rem;
}
```

---

## 7. Development Inputs Handling

Development inputs are divided into three categories:

### 7.1 Overall Development (Appraisee - Read-only)
- Questions from IDs 1-9
- Display as read-only text fields
- Show appraisee's responses

### 7.2 Reporting/Review Authority (Editable by REVIEWER/ACCEPTOR)
- Questions from IDs 12-18
- Display in 2 columns:
  - Left: Appraiser response (read-only)
  - Right: Reviewer response (editable textarea)

### 7.3 Option-Based Inputs
1. **Integrity** (ID 19) - 3 radio options - EDITABLE
2. **Health Problems** (ID 10) - Yes/No - READ-ONLY
3. **Disciplinary Actions** (ID 11) - Yes/No - READ-ONLY

**Refer to plan Section 7.1 in the approved plan for the full extraction logic.**

---

## 8. Validation Logic

Before submission, validate:

1. **All KRAs have reviewer scores** (1-5 rating)
2. **All required development questions have responses**
3. **Integrity assessment is selected** (if applicable)

**Validation Flow:**
- Show max 3 errors at once via toast notifications
- If more than 3 errors, show warning about remaining errors
- Prevent submission if validation fails

**Refer to plan Section 8 for the complete validation function.**

---

## 9. Submit Payload Structure

The payload must preserve all original fields from the GET response and update only the reviewer/acceptor specific fields based on `currentRole`.

**Key Payload Fields:**
```javascript
{
  id: urlId,
  empNo: "38965",
  ecNumber: "38965",
  financialYear: 2025,
  roleType: "REVIEWER", // or "ACCEPTOR"

  kraData: [
    {
      ...originalKraFields,
      REVA_ACTUALS: 4,      // If role = REVIEWER
      COMMENT_REVA: "Good",
      REVA_SCORE: 4,
      // OR
      AC_ACTUALS: 5,        // If role = ACCEPTOR
      COMMENT_AC: "Excellent",
      AC_SCORE: 5,
    }
  ],

  questions: [
    {
      ...originalQuestionFields,
      REVA_RESPONSE: "Response text", // If role = REVIEWER
      // OR
      AC_RESPONSE: "Response text",   // If role = ACCEPTOR
    }
  ],

  functions: ["Change Management", "Collaboration", ...],
  feedbackInput: [],

  continuousLearningPresent: false,
  mandatoryCourses: 0,
  learningCourses: 0,
  speedCircular: 0,
  elearningScore: 0,

  warningFlag: false,
  warningComment: '',
  varianceFlag: false,
}
```

**Refer to plan Section 9 for the complete payload building function.**

---

## 10. Implementation Steps

### Phase 1: Hook Implementation (Est. 4-6 hours)

1. **Create useAnnualReview.js** - Basic structure
2. **Set up data fetching** - Configure useQuery with getAcceptorAppraisal
3. **Implement state management** - All useState hooks for scores, responses, etc.
4. **Add role switching logic** - handleRoleChange with dirty state check
5. **Build payload construction** - buildSubmitPayload function
6. **Add validation logic** - validateForm function
7. **Set up mocked submission** - useMutation with mock response

**Testing**: Console log API response, test state updates, verify payload structure

---

### Phase 2: UI Component Skeleton (Est. 3-4 hours)

1. **Create AnnualReview.js** - Import hook and set up basic structure
2. **Implement header** - BackButton, title, role selector dropdown
3. **Add employee info section** - CheckInDescriptionSection component
4. **Build loading/error states** - LoadingSpinner, error alerts
5. **Add read-only final score summary** - FinalScoreSummaryTable

**Testing**: Verify component renders, role selector works, loading states display

---

### Phase 3: KRA Section (Est. 5-6 hours)

1. **Implement 3-column header bar** - Grid layout with proper column widths
2. **Build KRA row structure** - Description, Appraisee score, Appraiser score, Reviewer score buttons, Comments toggle
3. **Add 1-5 score button selector** - Interactive buttons with selected state
4. **Implement collapsible comments** - 3-column layout (Appraisee | Appraiser | Reviewer)
5. **Connect to state** - Wire up handleReviewerScoreChange, handleReviewerCommentChange

**Testing**: Click score buttons, toggle comments, verify state updates, check 3-column layout

---

### Phase 4: Development Inputs (Est. 3-4 hours)

1. **Display read-only appraisee responses** - Overall Development section
2. **Display read-only appraiser responses** - Reporting Authority section
3. **Add editable reviewer textarea fields** - Reviewing Authority section with yellow highlight
4. **Handle option-based inputs** - Integrity (editable), Health/Disciplinary (read-only)

**Testing**: Verify read-only fields are non-editable, test textarea input, check option selection

---

### Phase 5: Styling & Submit (Est. 3-4 hours)

1. **Create AnnualReview.css** - Copy base from AnnualAppraisalReview.css
2. **Apply 3-column grid layouts** - Header and comments containers
3. **Add yellow highlighting** - Editable sections stand out
4. **Style score buttons** - Hover, selected, disabled states
5. **Implement submit button** - With loading state and disabled logic

**Testing**: Check visual consistency, test responsive behavior, verify submit button states

---

### Phase 6: Testing & Polish (Est. 3-4 hours)

1. **Test data fetching** - Various employee scenarios
2. **Test role switching** - REVIEWER ↔ ACCEPTOR with dirty state check
3. **Test form validation** - Empty fields, partial completion
4. **Test payload generation** - Log and verify structure
5. **Verify mocked submission** - Toast notifications, navigation
6. **Test error handling** - API failures, missing context

**Testing**: Full end-to-end flow, edge cases, error scenarios

---

**Total Estimated Time**: 21-28 hours (~3-4 days)

---

## 11. Key Differences from AnnualAppraisalReview

| Aspect | AnnualAppraisalReview (Appraiser) | AnnualReview (Reviewer/Acceptor) |
|--------|-----------------------------------|-----------------------------------|
| **API Endpoint** | `getReporteeAppraisal` | `getAcceptorAppraisal` |
| **Editable Fields** | REPA_ACTUALS, COMMENT_REPA | REVA_ACTUALS/AC_ACTUALS, COMMENT_REVA/COMMENT_AC |
| **Visible Data** | Self + Appraiser (2 columns) | Self + Appraiser + Reviewer (3 columns) |
| **Role Switching** | No (fixed as Appraiser) | Yes (REVIEWER vs ACCEPTOR dropdown) |
| **Read-only Data** | Appraisee only | Appraisee + Appraiser |
| **Development Inputs** | Editable Reporting Authority questions | Editable Reviewing Authority questions |
| **Comment Layout** | 2-column (Self \| Appraiser) | 3-column (Self \| Appraiser \| Reviewer) |
| **UI Highlight Color** | Orange/Warning | Yellow/Warning |
| **Badge for Current User** | "Reviewing as Appraiser" | "Reviewing as Reviewer/Acceptor" |

---

## 12. Critical Files Reference

### 12.1 Files to Read for Pattern Reference

1. **src/pages/Appraisal/AppraisalCheckInForm/annual/AnnualAppraisalReview.js**
   - UI structure, layout patterns
   - Score button implementation
   - Comment toggle logic
   - Form section organization

2. **src/pages/Appraisal/AppraisalCheckInForm/annual/useAnnualAppraisalReview.js**
   - Hook structure and organization
   - State management patterns
   - Payload building logic
   - Validation approach
   - Mutation setup

3. **src/pages/Appraisal/AppraisalCheckInForm/appraisalTransformers.js**
   - transformAnnualAppraisalData function
   - Data normalization patterns

4. **src/services/api.js**
   - Lines 659-691: getAcceptorAppraisal
   - Lines 720-731: submitAcceptorAppraisal
   - API parameter patterns

5. **src/pages/Appraisal/AppraisalCheckInForm/annual/AnnualAppraisalReview.css**
   - Base styling patterns
   - Component-specific styles
   - Bootstrap overrides

### 12.2 Files to Create

1. **src/pages/Appraisal/AppraisalCheckInForm/annual/AnnualReview.js** (NEW)
2. **src/pages/Appraisal/AppraisalCheckInForm/annual/useAnnualReview.js** (NEW)
3. **src/pages/Appraisal/AppraisalCheckInForm/annual/AnnualReview.css** (NEW)

### 12.3 Files to Modify

1. **src/pages/Appraisal/AppraisalCheckInForm/annual/index.js**
   - Add export for AnnualReview component

---

## 13. Testing Checklist

### 13.1 Data Fetching
- [ ] GET API call with all parameters works
- [ ] Data transforms correctly via transformAnnualAppraisalData
- [ ] Missing parameters handled gracefully
- [ ] API error displays user-friendly message

### 13.2 Role Management
- [ ] Role dropdown switches between REVIEWER and ACCEPTOR
- [ ] Form state reinitializes when role changes
- [ ] Dirty state check warns before role switch
- [ ] Role-specific data loads correctly (REVA vs AC fields)

### 13.3 KRA Section
- [ ] Score buttons (1-5) update state correctly
- [ ] Selected score visually highlighted
- [ ] Comments toggle opens/closes correctly
- [ ] 3-column comment layout displays properly
- [ ] Appraisee and Appraiser scores display as read-only badges

### 13.4 Development Inputs
- [ ] Appraisee responses display as read-only
- [ ] Appraiser responses display as read-only
- [ ] Reviewer textarea fields are editable
- [ ] Text input updates state correctly

### 13.5 Option-Based Inputs
- [ ] Integrity radio buttons work (editable)
- [ ] Health problems display as read-only
- [ ] Disciplinary actions display as read-only

### 13.6 Validation
- [ ] Empty KRA scores caught and show error toast
- [ ] Empty development responses caught
- [ ] Missing integrity selection caught
- [ ] Validation shows max 3 errors at a time
- [ ] Validation prevents submission when invalid

### 13.7 Submission
- [ ] Submit button disabled during submission
- [ ] Payload structure matches expected format
- [ ] Mocked POST returns success
- [ ] Success toast displays
- [ ] Navigation back works after submit
- [ ] Error handling shows toast on failure

### 13.8 UI/UX
- [ ] Loading spinner shows during fetch
- [ ] Error state displays on API failure
- [ ] Read-only fields are truly non-editable
- [ ] 3-column layouts render correctly
- [ ] Yellow highlighting visible for editable sections
- [ ] Score button hover states work
- [ ] Cancel button navigates back

### 13.9 Edge Cases
- [ ] Handle missing employee data
- [ ] Handle partial KRA data
- [ ] Handle missing development questions
- [ ] Handle concurrent edits (if applicable)
- [ ] Handle role switch mid-edit

---

## 14. Notes & Considerations

### 14.1 Future Enhancements

1. **Real POST Endpoint**: Replace mock with actual `submitAcceptorAppraisal` call
2. **Auto-save**: Consider adding auto-save for longer forms
3. **Offline Support**: Handle network issues gracefully
4. **Keyboard Navigation**: Add keyboard shortcuts for score selection
5. **Accessibility**: Add ARIA labels and screen reader support

### 14.2 Known Limitations

- POST endpoint is mocked - will need backend implementation
- No save draft functionality (submit-only)
- No optimistic UI updates
- No concurrent edit protection

### 14.3 Dependencies

- React Query (@tanstack/react-query) - Already installed
- React Router (react-router-dom) - Already installed
- React Toastify (react-toastify) - Already installed
- Bootstrap Icons (bi) - Already available
- Bootstrap CSS - Already imported

---

## 15. Glossary

| Term | Description |
|------|-------------|
| **Appraisee** | Employee being appraised (fills self-assessment) |
| **Appraiser** | Reporting Authority (first-level reviewer) |
| **Reviewer** | Reviewing Authority (second-level reviewer) - REVA fields |
| **Acceptor** | Accepting Authority (final approver) - AC fields |
| **KRA** | Key Result Area (performance metric) |
| **REPA** | Reporting Authority (Appraiser) fields |
| **REVA** | Reviewing Authority (Reviewer) fields |
| **AC** | Accepting Authority (Acceptor) fields |
| **AP_KRA_ID** | Unique identifier for each KRA |
| **Non-Measurable KRA** | Qualitative KRAs rated on 1-5 scale |
| **Development Inputs** | Qualitative text responses |

---

## End of Implementation Plan

**Document Version**: 1.0
**Last Updated**: 2025-11-26
**Status**: Ready for Implementation

For questions or clarifications, refer to:
- Plan discussion in conversation history
- Product specs: `plans/annaul-appraisal/annual-part-1.md`, `annual-part-2.md`, `annual-part-3.md`
- API documentation (once available)
