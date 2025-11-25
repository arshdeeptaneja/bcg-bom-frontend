import React, { useEffect, useMemo, useState } from 'react';
import { BackButton } from '../../../../components/common';
import LoadingSpinner from '../../../../components/Spinner';
import QuarterlyHeader from '../components/QuarterlyHeader';
import MonthlySummaryTable from '../components/MonthlySummaryTable';
import QuarterlyMeasurableTable from '../components/QuarterlyMeasurableTable';
import QuarterlyNonMeasurableTable from '../components/QuarterlyNonMeasurableTable';
import { useQuarterlyAppraisal } from './useQuarterlyAppraisal';

const MONTH_LABEL_LOOKUP = {
  1: 'January',
  2: 'February',
  3: 'March',
  4: 'April',
  5: 'May',
  6: 'June',
  7: 'July',
  8: 'August',
  9: 'September',
  10: 'October',
  11: 'November',
  12: 'December',
};

const QUARTER_MONTH_MAP = {
  Q1: [4, 5, 6],
  Q2: [7, 8, 9],
  Q3: [10, 11, 12],
  Q4: [1, 2, 3],
};

const getQuarterMonths = (quarter = 'Q1') => {
  const months = QUARTER_MONTH_MAP[quarter?.toUpperCase()] || QUARTER_MONTH_MAP.Q1;
  return months.map((value) => ({ value, label: MONTH_LABEL_LOOKUP[value] }));
};

const QuarterlyCheckIn = () => {
  // Use the quarterly-specific hook directly
  const {
    data,
    isLoading,
    isError,
    context,
    roleState,
    formState,
    actions,
  } = useQuarterlyAppraisal();

  const { employee, dateRange } = context;
  const { isEditableBy } = roleState;
  const { handleSave, handleSubmit, handleKraChange, handleSectionCommentChange, isSaving, isSubmitting } = actions;

  // Use API data or fallback to empty/mock data
  const allMeasurableKras = data?.measurableKras || [];
  const nonMeasurableKraListData = data?.nonMeasurableKras || {};
  const quarterMonths = useMemo(() => getQuarterMonths(context.quarter), [context.quarter]);
  const defaultActiveMonth = useMemo(() => {
    const currentMonthNumber = new Date().getMonth() + 1;
    const currentMonthOption = quarterMonths.find((month) => month.value === currentMonthNumber);
    if (currentMonthOption) return currentMonthOption.value;
    return quarterMonths[0]?.value || currentMonthNumber;
  }, [quarterMonths]);

  const [activeMonth, setActiveMonth] = useState(defaultActiveMonth);

  useEffect(() => {
    setActiveMonth(defaultActiveMonth);
  }, [defaultActiveMonth]);

  const activeMonthBucket = data?.krasByMonth?.[activeMonth] || { measurable: [], nonMeasurable: [] };
  const measurableOverrides = formState.formData.measurableKraScores || {};
  const measurableForMonth = activeMonthBucket.measurable?.map((kra) => (
    measurableOverrides[kra.KraId] ? { ...kra, ...measurableOverrides[kra.KraId] } : kra
  )) || [];
  const nonMeasurableForMonth = activeMonthBucket.nonMeasurable || [];
  const nonMeasurableSectionsForMonth = nonMeasurableForMonth.reduce((acc, kra) => {
    const sectionKey = kra.SectionName || 'Non-Measurable';
    if (!acc[sectionKey]) acc[sectionKey] = [];
    acc[sectionKey].push(kra);
    return acc;
  }, {});
  
  const hasQuarterData = allMeasurableKras.length > 0 || Object.keys(nonMeasurableKraListData).length > 0;

  const actualScoreData = data?.monthlyScoreSummary?.actualScoreData || {};
  const maxScoreData = data?.monthlyScoreSummary?.maxScoreData || {};
  const totalNonMeasurableActual = data?.totalNonMeasurableActual || 0;
  const totalNonMeasurableMax = data?.totalNonMeasurableMax || 0;
  const validationMessage = data?.validationMessage || '';

  // Handle missing context
  if (!context.financialYear || !context.appraisalPeriod) {
    return (
      <div className="pageWrapper">
        <div>No financial year or appraisal period found</div>
      </div>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <div className="pageWrapper">
        <div className="alert alert-danger">
          Failed to load quarterly appraisal data. Please try again later.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="pageWrapper">
        <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
          <div className="headline d-flex flex-row justify-content-between align-items-center">
            <BackButton />
            <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
              Quarterly Check-In
            </h1>
          </div>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="pageWrapper">
      {/* Header Section */}
      <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center mb-4">
        <div className="headline d-flex flex-row align-items-center">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
            Add Appraisee Check-in
          </h1>
        </div>
        <div className="d-flex align-items-center gap-3">
            <span className="fw-bold text-dark">{context.quarter}, {context.financialYear} Quarterly Check-In</span>
            <button className="btn btn-primary btn-sm text-white rounded">
                Info <i className="bi bi-info-circle ms-1"></i>
            </button>
        </div>
      </div>

      <div className="pageWrapper-content d-flex flex-column m-1 p-3">
        <QuarterlyHeader 
            employee={employee} 
            dateRange={dateRange} 
            primaryRole={employee?.primaryRole || roleState.currentRole}
            additionalRoles={employee?.additionalRoles || []}
        />
        {validationMessage && (
          <div className="alert alert-info mt-3" role="alert">
            <i className="bi bi-info-circle me-2"></i>
            {validationMessage}
          </div>
        )}
        <div className="note mb-3">
          <span className="fw-bold">Note: </span>
          <span className="text-muted">
            Please raise an exception if actual or target values are incorrect.
          </span>
        </div>

        {Object.keys(actualScoreData).length > 0 && (
            <MonthlySummaryTable
              actualScoreData={actualScoreData}
              maxScoreData={maxScoreData}
              quarterMonths={quarterMonths}
            />
        )}
        {hasQuarterData && (
          <div className="discretionary-kra-section d-flex flex-column gap-3 m-1 p-3">
            {quarterMonths.length > 0 && (
              <div className="d-flex justify-content-end mb-3">
                <div className="nav gap-4">
                  {quarterMonths.map((month) => (
                    <button
                      key={month.value}
                      type="button"
                      className={`btn btn-link text-decoration-none p-0 fw-bold ${activeMonth === month.value ? 'text-primary border-bottom border-primary border-2' : 'text-muted'}`}
                      onClick={() => setActiveMonth(month.value)}
                    >
                      {month.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <QuarterlyMeasurableTable
                kraListData={measurableForMonth}
                onKraChange={handleKraChange}
                isEditable={isEditableBy.APPRAISEE}
            />

            <QuarterlyNonMeasurableTable
                kraListData={nonMeasurableSectionsForMonth}
                totalActualScore={totalNonMeasurableActual}
                totalMaxScore={totalNonMeasurableMax}
            />
          </div>
        )}
        
        <div className="development-inputs-section d-flex flex-column gap-3 m-1 p-3">
          <h5 className="text-primary fw-bold mb-3">Development Inputs</h5>
          
          {data?.developmentInputs?.map((input, index) => (
            <div className="mb-3" key={input.id}>
              <label className="form-label fw-bold text-dark">
                {index + 1}. {input.question} <span className="text-danger">*</span>
              </label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Enter Your Response"
                value={formState.formData.sectionComments?.[input.key] || ''}
                onChange={(e) => handleSectionCommentChange(input.key, e.target.value)}
                disabled={!isEditableBy.APPRAISEE}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="save-and-submit-button-section d-flex flex-row justify-content-end gap-3 m-3">
        <button
          className="btn btn-outline-primary px-4"
          onClick={handleSave}
          disabled={isSaving || isSubmitting}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        <button
          className="btn btn-primary px-4 text-white"
          onClick={handleSubmit}
          disabled={isSaving || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit →'}
        </button>
      </div>
    </div>
  );
};

export default QuarterlyCheckIn;
