/**
 * The QuaterlyAppraiseeCheckIn function in React handles the process of adding and submitting
 * QuaterlyAppraiseeCheckIn function handles both appraisee and appraiser check-in forms
 * appraisee check-in data for a specific quarter, displaying measurable and non-measurable KRA tables,
 * development inputs, and allowing for saving and submitting the check-in report.
 * @returns The `QuaterlyAppraiseeCheckIn` component is being returned. It contains conditional
 * rendering based on the loading state, error state, and data availability. If loading, it displays a
 * loading spinner. If there is an error, it shows an error message. If data is available, it renders
 * the check-in form with various sections like description, table of monthly scores, measurable and
 * non-me
 */
import React, { useState, useEffect } from 'react';
import { BackButton } from '../../../../components/common';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckInDescriptionSection } from '../../../../components/Appraisal';
import QuaterlyMeasurableKraTable from '../../../../components/QuaterTables/QuaterMeasurableKra';
import QuaterNonMeasurable from '../../../../components/QuaterTables/QuaterNonMeasurable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appraisalAPI } from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';
import LoadingSpinner from '../../../../components/Spinner';
import { toast } from 'react-toastify';

function QuaterlyAppraiseeCheckIn() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Month conversion utility

  const getMonthNumber = (num) => {
    const arr = [
      '',
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return arr[num] || '';
  };

  const [activeMonth, setActiveMonth] = useState('April');
  const [months, setMonths] = useState(['April', 'May', 'June']);

  // Get data from location state
  const {
    financialYear,
    appraisalPeriod,
    quarter,
    dateRange,
    employee,
    intent,
    page_type,
    roleType,
  } = location.state;

  console.log('EMPLOYEE IS: ', employee);
  // Get employee number from auth context as fallback
  const { getEmployeeDetails, getUserProperty } = useAuth();
  const employeeDetails = getEmployeeDetails();
  const empNoFromAuth = getUserProperty('empNo', employeeDetails?.currentUser?.[0]?.EMP_ID || '');
  const empNo = empNoFromAuth || employee?.empNo || employee?.id || employee?.EMP_ID;
  const role = getUserProperty('ROLE_NAME', 'Administrative Officers');

  // Extract year from financial year format
  const extractYear = (fy) => {
    if (!fy) return new Date().getFullYear().toString();
    const fyMatch = fy.match(/FY (\d{4})/);
    if (fyMatch) return fyMatch[1];
    const rangeMatch = fy.match(/(\d{4})-\d{4}/);
    if (rangeMatch) return rangeMatch[1];
    const yearMatch = fy.match(/\d{4}/);
    return yearMatch ? yearMatch[0] : new Date().getFullYear().toString();
  };

  // Role State
  const [currentRole, setCurrentRole] = useState(role || 'APPRAISEE');

  const handleRoleChange = (e) => {
    setCurrentRole(e.target.value);
  };

  const [kraData, setKraData] = useState([]);
  const [comments, setComments] = useState({
    appraisee: '',
    appraiser: '',
    reviewer: '',
  });
  const [measurableKraListData, setMeasurableKraListData] = useState([]);
  const [nonMeasurableKraListData, setNonMeasurableKraListData] = useState({});
  const [developmentInputsData, setDevelopmentInputsData] = useState([]);
  const [monthlyScores, setMonthlyScores] = useState({});
  const [monthlyMeasurableData, setMonthlyMeasurableData] = useState({});

  // Form inputs for comments
  const [formInputs, setFormInputs] = useState({
    performanceMeasurableComment: ['', '', ''],
    nonMeasurableComment: '',
    performanceNonMeasurableComment: '',
    performanceSemiMeasurableComment: '',
    performancePeriodComment: '',
    areasPerformanceComment: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
    const [isSaveing, setIsSaveing] = useState(false);

  // Submit mutation for quarterly appraisee check-in
  const submitMutation = useMutation({
    mutationFn: (payload) => appraisalAPI.submitQuarterlyAppraiseeCheckInReport(payload),
    onSuccess: (data) => {
      toast.success('Check-in submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['myAppraisalDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['quarterlyCheckInReport'] });
      setIsSubmitting(false);
      // Navigate back or show success
      navigate(-1);
    },
    onError: (error) => {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit check-in');
      setIsSubmitting(false);
    },
  });

  const buildKraDataPayload = () => {
    return months.flatMap((monthName) => {
      const rows = monthlyMeasurableData[monthName] || [];
      return rows.map((row) => ({
        ...row, // REQUIRED full object !!
        //MONTH: getMonthNumber(monthName)     // convert month name → number
      }));
    });
  };

  const buildPerformanceMeasurableComments = () => {
    return months.map((m) => {
      const index = getMonthNumber(m) - 1;
      return formInputs.performanceMeasurableComment[index] || '';
    });
  };

  // React Query to fetch quarterly check-in report data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      'quarterlyCheckInReport',
      financialYear,
      appraisalPeriod,
      quarter,
      empNo,
      currentRole,
    ],
    queryFn: () =>
      appraisalAPI.getQuarterlyCheckInReport({
        empNo: empNo,
        // url: employee?.url || employee?.URL_ID || '',
        //url: employee.url,
        url: 'U-34545', //TODO: Change this
        //roleType: currentRole || role || 'APPRAISEE',
        roleType: role,
        financialYear: parseInt(extractYear(financialYear)),
        quarter: quarter || '',
        pageType: page_type,
        appraisalStatus: employee?.appraisalStatus || employee?.APPRAISAL_STATUS || 'PENDING',
        intent: intent,
      }),
    enabled: !!empNo && !!financialYear && !!quarter,
  });

  useEffect(() => {
    if (isError) {
      toast.error(`Failed to fetch quarterly check-in data: ${error?.message || 'Unknown error'}`);
    }
  }, [isError, error]);

  // Extract and set data from API response
  useEffect(() => {
    if (data) {
      const responseData = data?.data || data;

      // Process measurable KRA data from results_KRA_LIST
      const measurableList = responseData?.results_KRA_LIST?.measurable || [];

      if (measurableList.length > 0) {
        // Get unique months from the data
        const monthNumbers = [...new Set(measurableList.map((item) => item.MONTH))].sort(
          (a, b) => a - b
        );

        if (monthNumbers.length > 0) {
          // Convert month numbers to month names
          const monthNames = monthNumbers.map((num) => getMonthNumber(num));
          setMonths(monthNames);
          setActiveMonth(monthNames[0]);

          // Group KRA data by month
          const kraByMonth = {};
          monthNumbers.forEach((monthNum, idx) => {
            const monthName = monthNames[idx];
            kraByMonth[monthName] = measurableList.filter((item) => item.MONTH === monthNum);
          });
          setMonthlyMeasurableData(kraByMonth);

          // Calculate monthly scores for the summary table
          const scores = {};
          monthNumbers.forEach((monthNum, idx) => {
            const monthName = monthNames[idx];
            const monthData = measurableList.filter((item) => item.MONTH === monthNum);

            const totalActual = monthData.reduce(
              (sum, item) => sum + (parseFloat(item.actual_score) || 0),
              0
            );
            const totalMax = monthData.reduce(
              (sum, item) => sum + (parseFloat(item.maxscore) || 0),
              0
            );

            scores[monthName] = {
              actual: totalActual,
              max: totalMax,
            };
          });
          setMonthlyScores(scores);
        }

        setMeasurableKraListData(measurableList);
      }

      // Set non-measurable KRA data
      if (responseData?.results_KRA_LIST?.['non measurable']) {
        setNonMeasurableKraListData(responseData.results_KRA_LIST['non measurable']);
      }

      // Set development inputs from API response questions
      const questionsArray = [];
      if (responseData?.question1) {
        questionsArray.push({
          question: responseData.question1,
          required: true,
        });
      }
      if (responseData?.question2) {
        questionsArray.push({
          question: responseData.question2,
          required: true,
        });
      }

      if (questionsArray.length > 0) {
        setDevelopmentInputsData(questionsArray);
      } else if (responseData?.developmentInputs) {
        setDevelopmentInputsData(responseData.developmentInputs);
      } else if (responseData?.developmentInputsData) {
        setDevelopmentInputsData(responseData.developmentInputsData);
      }

      // Set KRA data
      if (responseData?.kraData) {
        setKraData(responseData.kraData);
      }
    }
  }, [data]);

  const isEditableBy = (fieldOwner) => {
    switch (currentRole) {
      case 'APPRAISEE':
        return fieldOwner === 'appraisee';
      case 'APPRAISER':
        return fieldOwner === 'appraiser';
      case 'REVIEWER':
        return fieldOwner === 'reviewer';
      default:
        return false;
    }
  };

  // Character limit for comment fields
  const COMMENT_CHAR_LIMIT = 30;

  // Validation for mandatory comments
  const validateComments = () => {
    if (!formInputs.performancePeriodComment.trim()) {
      toast.error('Please fill in the highlights of your performance');
      return false;
    }
    if (!formInputs.areasPerformanceComment.trim()) {
      toast.error('Please fill in the areas for improvement');
      return false;
    }
    return true;
  };

  // Handler for development input comments with character limit
  const handleCommentChange = (questionIndex, value) => {
    // Enforce 30 character limit
    const limitedValue = value.slice(0, COMMENT_CHAR_LIMIT);

    setFormInputs((prev) => {
      // Map question index to the appropriate field
      // Index 0 = highlights -> performancePeriodComment
      // Index 1 = areas for improvement -> areasPerformanceComment
      if (questionIndex === 0) {
        return { ...prev, performancePeriodComment: limitedValue };
      } else if (questionIndex === 1) {
        return { ...prev, areasPerformanceComment: limitedValue };
      }
      return prev;
    });
  };

  const handleSave = async () => {
    if (!validateComments()) return;

    try {
      setIsSaveing(true);
      const kraDataPayload = buildKraDataPayload();
      const measurableCommentsPayload = buildPerformanceMeasurableComments();

      const payload = {
        financialYear: parseInt(extractYear(financialYear)),
        quarter: quarter,
        empNumber: employee?.empNo,
        urlId: employee?.url || 'U-34545',
        kraData: kraDataPayload,
        submittype: page_type,

        startDate: location.state?.dateRange?.split(' - ')[0]?.trim() || '2024-07-01 00:00:00.0',
        endDate: location.state?.dateRange?.split(' - ')[1]?.trim() || '2024-09-30 00:00:00.0',

        reportingAuthority: employee?.appraiser || '',
        organizationName: employee?.branch || '',

        performanceMeasurableComment: measurableCommentsPayload,
        nonMeasurableComment: formInputs.nonMeasurableComment,
        performanceNonMeasurableComment: formInputs.performanceNonMeasurableComment,
        performanceSemiMeasurableComment: formInputs.performanceSemiMeasurableComment,
        performancePeriodComment: formInputs.performancePeriodComment,
        areasPerformanceComment: formInputs.areasPerformanceComment,
      };

      console.log('SAVE PAYLOAD =>', payload);

      await appraisalAPI.appraiseeSaveQuarterlyCheckIn(payload);

      toast.success('Draft Saved Successfully!');
      setIsSaved(true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save!');
    } finally {
      setIsSaveing(false);
    }
  };

  const handleSubmit = () => {
    if (!validateComments()) return;

    setIsSubmitting(true);

    // Build the payload matching backend expectations
    //
    const payload = {
      financialYear: parseInt(extractYear(financialYear)),
      quarter: quarter || '',
      empNumber: employee?.empNo,
      urlId: employee?.URL_ID || employee?.url || 'U-34545',
      kraData: measurableKraListData,
      submittype: page_type,
      startDate: location.state?.dateRange?.split(' - ')[0]?.trim() || '2024-07-01 00:00:00.0',
      endDate: location.state?.dateRange?.split(' - ')[1]?.trim() || '2024-09-30 00:00:00.0',
      reportingAuthority: employee?.appraiser || '',
      organizationName: employee?.organization || '',
      performanceMeasurableComment: formInputs.performanceMeasurableComment,
      nonMeasurableComment: formInputs.nonMeasurableComment,
      performanceNonMeasurableComment: formInputs.performanceNonMeasurableComment,
      performanceSemiMeasurableComment: formInputs.performanceSemiMeasurableComment,
      performancePeriodComment: formInputs.performancePeriodComment, //highlights
      areasPerformanceComment: formInputs.areasPerformanceComment,
    };

    console.log('Submitting payload:', JSON.stringify(payload, null, 2));

    // Submit mutation
    submitMutation.mutate(payload);
  };

  // Calculate monthly scores data for the table
  const monthsData = months.map((month) => {
    const monthData = monthlyScores[month] || {};
    return {
      month,
      actual: monthData.actual || 0,
      max: monthData.max || 0,
    };
  });
  const averageActual =
    monthsData.length > 0
      ? monthsData.reduce((sum, m) => sum + m.actual, 0) / monthsData.length
      : 0;
  const averageMax =
    monthsData.length > 0 ? monthsData.reduce((sum, m) => sum + m.max, 0) / monthsData.length : 0;

  // Development inputs questions - now mapped from API response
  const developmentInputsQuestions =
    developmentInputsData.length > 0
      ? developmentInputsData
      : [
        {
          question: 'Please mention the highlights of your performance on this KRA',
          required: true,
        },
        { question: 'Please mention the areas for improvement on this KRA', required: true },
      ];

  if (!financialYear || !appraisalPeriod || !quarter) {
    return (
      <div className="pageWrapper">
        <div className="pageWrapper-header">
          <BackButton />
          {roleType === 'appraiser' ? (
            <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
              Add Appraiser Check-In
            </h1>
          ) : (
            <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
              Add Appraisee Check-In
            </h1>
          )}
        </div>
        <div className="text-center mt-5">
          <p className="text-danger fw-semibold">
            Missing required parameters: Financial Year, Appraisal Period, or Quarter
          </p>
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
            {roleType === 'appraiser' ? (
              <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
                Add Appraiser Check-In
              </h1>
            ) : (
              <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
                Add Appraisee Check-In
              </h1>
            )}
          </div>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="pageWrapper">
        <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
          <div className="headline d-flex flex-row justify-content-between align-items-center">
            <BackButton />
            {roleType === 'appraiser' ? (
              <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
                Add Appraiser Check-In
              </h1>
            ) : (
              <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
                Add Appraisee Check-In
              </h1>
            )}
          </div>
        </div>
        <div className="text-center mt-5">
          <p className="text-danger fw-semibold">Failed to load check-in data</p>
          <p className="text-muted">{error?.message || 'Please try again later'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pageWrapper">
      <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
        <div className="headline d-flex flex-row justify-content-between align-items-center">
          <BackButton />
          {roleType === 'appraiser' ? (
            <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
              Add Appraiser Check-In
            </h1>
          ) : (
            <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
              Add Appraisee Check-In
            </h1>
          )}
        </div>
      </div>

      <div className="pageWrapper-content d-flex flex-column m-1 p-3">
        <CheckInDescriptionSection employee={employee} dateRange={dateRange} />

        <div className="note mt-5 mb-5">
          <span className="text-muted">Note: </span>
          <span className="text-muted">
            Please raise an exception if actual or target values are incorrect.
          </span>
        </div>

        <div className="table-container">
          <table className="table-accent">
            <thead>
              <tr>
                <th style={{ width: '55%' }}>Month</th>
                <th style={{ width: '25%' }}>Actual</th>
                <th style={{ width: '25%' }}>Max</th>
              </tr>
            </thead>
            <tbody>
              {monthsData.map(({ month, actual, max }) => (
                <tr key={month}>
                  <td>{month}</td>
                  <td>{actual.toFixed(1)}</td>
                  <td>{max.toFixed(1)}</td>
                </tr>
              ))}
              <tr>
                <td>
                  <b>Average</b>
                </td>
                <td>{averageActual.toFixed(1)}</td>
                <td>{averageMax.toFixed(1)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <ul className="nav nav-tabs month-tabs mb-3">
          {months.map((m) => (
            <li className="nav-items" key={m}>
              <button
                className={`nav-link ${activeMonth === m ? 'active' : ''}`}
                onClick={() => setActiveMonth(m)}
              >
                {m}
              </button>
            </li>
          ))}
        </ul>

        <div className="discretionary-kra-section d-flex flex-column gap-3 shadow-sm m-1 p-3">
          <QuaterlyMeasurableKraTable
            data={monthlyMeasurableData[activeMonth] || []}
            activeMonth={activeMonth}
          />
          <QuaterNonMeasurable
            kraListData={
              nonMeasurableKraListData && nonMeasurableKraListData.length > 0
                ? { General: nonMeasurableKraListData }
                : {}
            }
            totalActualScore={0}
            totalMaxScore={0}
            role={currentRole}
            isEditableBy={isEditableBy}
          />
        </div>

        <div className="development-inputs-section d-flex flex-column gap-3 shadow-sm m-1 p-3">
          <h5 className="text-primary fw-bold mb-3">Development Inputs</h5>

          <div className="d-flex flex-column gap-3">
            {developmentInputsQuestions.map((question, index) => {
              // Map index to the correct formInputs field
              const fieldValue =
                index === 0
                  ? formInputs.performancePeriodComment
                  : formInputs.areasPerformanceComment;

              return (
                <div key={question.question} className="d-flex flex-column gap-1">
                  {/* Question number and question text */}
                  <div className="d-flex flex-row gap-1">
                    <span className="fw-bold">{index + 1}.</span>
                    <span className="fw-bold">{question.question}</span>
                    {question.required && <span className="text-danger">*</span>}
                  </div>

                  {/* Textarea for free text response with 30 char limit */}
                  <textarea
                    className="form-control"
                    placeholder="Enter your Response"
                    rows={3}
                    maxLength={COMMENT_CHAR_LIMIT}
                    value={fieldValue}
                    onChange={(e) => handleCommentChange(index, e.target.value)}
                  />
                  <small className="text-muted text-end">
                    {fieldValue.length}/{COMMENT_CHAR_LIMIT} characters
                  </small>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="save-and-submit-button-section d-flex flex-row justify-content-end gap-3 m-3">
        <button className="btn btn-outline-primary" onClick={handleSave} disabled={isSaved}>
          {isSaveing ? 'Saving...' : isSaved ? 'Saved' : 'Save as Draft'}
        </button>

        <button
          className={`btns btn-primarys ${(!isSaved || isSubmitting) ? 'disabled-btn' : ''}`}
          onClick={handleSubmit}
          disabled={!isSaved || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
}

export default QuaterlyAppraiseeCheckIn;
