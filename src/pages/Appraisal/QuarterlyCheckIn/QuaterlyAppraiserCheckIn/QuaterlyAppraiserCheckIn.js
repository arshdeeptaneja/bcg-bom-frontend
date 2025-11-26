// /**
//  * The QuaterlyAppraiserCheckIn function in React handles the display and submission of appraiser
//  * check-in data for a specific quarter, including measurable and non-measurable KRAs, development
//  * inputs, and saving/submission functionality.
//  * @returns The `QuaterlyAppraiserCheckIn` component is being returned. It contains conditional
//  * rendering based on the loading state, error state, and data availability. If the required parameters
//  * are missing, it displays a message indicating the missing parameters. If it is still loading, it
//  * shows a loading spinner. If there is an error while fetching data, it displays an error message.
//  */
// import React, { useState, useEffect } from 'react';
// import { BackButton } from '../../../../components/common';
// import { useLocation } from 'react-router-dom';
// import {
//   CheckInDescriptionSection,
//   NonMeasurableKra,
//   DevelopmentInputs,
// } from '../../../../components/Appraisal';
// import QuaterlyMeasurableKraTable from '../../../../components/QuaterTables/QuaterMeasurableKra';
// import QuaterNonMeasurable from '../../../../components/QuaterTables/QuaterNonMeasurable';
// import { useQuery } from '@tanstack/react-query';
// import { appraisalAPI } from '../../../../services/api';
// import { useAuth } from '../../../../contexts/AuthContext';
// import LoadingSpinner from '../../../../components/Spinner';
// import { toast } from 'react-toastify';
// import QuaterAppraiserMeasurableKra from '../../../../components/QuaterTables/QuaterAppraiserMeasurableKra';
// import QuaterAppraiserNonMeasureableKra from '../../../../components/QuaterTables/QuaterAppraiserNonMeasureableKra';

// function QuaterlyAppraiserCheckIn() {
//   const location = useLocation();

//   // Month conversion utility
//   const getMonthName = (monthNumber) => {
//     const monthNames = [
//       "January", "February", "March", "April", "May", "June",
//       "July", "August", "September", "October", "November", "December"
//     ];
//     return monthNames[monthNumber - 1] || "January";
//   };

//   const [activeMonth, setActiveMonth] = useState("April");
//   const [months, setMonths] = useState(["April", "May", "June"]);

//   // Get data from location state
//   const { financialYear, appraisalPeriod, quarter, dateRange, employee, role } = location.state || {
//     financialYear: "2025",
//     appraisalPeriod: "Mid-Year",
//     quarter: "Q2",
//     dateRange: "2025",
//     employee: { name: "John Doe", empNo: "36665", appraisalStatus: "pending", url: 'U-34545' },
//     role: "Administrative Officers",
//   };

//   console.log("ROLE TYPE IS: ", employee.roleType)

//   // Get employee number from auth context as fallback
//   const { getEmployeeDetails, getUserProperty } = useAuth();
//   const employeeDetails = getEmployeeDetails();
//   const empNoFromAuth = getUserProperty('empNo', employeeDetails?.currentUser?.[0]?.EMP_ID || '');
//   const empNo = empNoFromAuth || employee?.id || employee?.EMP_ID;
//   const [fullResponseData, setFullResponseData] = useState(null);

//   // Extract year from financial year format
//   const extractYear = (fy) => {
//     if (!fy) return new Date().getFullYear().toString();
//     const fyMatch = fy.match(/FY (\d{4})/);
//     if (fyMatch) return fyMatch[1];
//     const rangeMatch = fy.match(/(\d{4})-\d{4}/);
//     if (rangeMatch) return rangeMatch[1];
//     const yearMatch = fy.match(/\d{4}/);
//     return yearMatch ? yearMatch[0] : new Date().getFullYear().toString();
//   };

//   // Role State
//   const [currentRole, setCurrentRole] = useState(role || 'APPRAISEE');

//   const handleRoleChange = (e) => {
//     setCurrentRole(e.target.value);
//   };

//   const [kraData, setKraData] = useState([]);
//   const [comments, setComments] = useState({
//     appraisee: '',
//     appraiser: '',
//     reviewer: '',
//   });
//   const [measurableKraListData, setMeasurableKraListData] = useState([]);
//   const [nonMeasurableKraListData, setNonMeasurableKraListData] = useState({});
//   const [developmentInputsData, setDevelopmentInputsData] = useState([]);
//   const [monthlyScores, setMonthlyScores] = useState({});
//   const [monthlyMeasurableData, setMonthlyMeasurableData] = useState({});

//   let page_type = "repa"

//   // React Query to fetch quarterly check-in report data
//   const { data, isLoading, isError, error } = useQuery({
//     queryKey: ['quarterlyCheckInReport', financialYear, appraisalPeriod, quarter, empNo, currentRole],
//     queryFn: () =>
//       appraisalAPI.getQuarterlyAppraiserCheckInReport({
//         empNo: empNo,
//         //url:employee.url,
//         url:"U-34545", //TODO: remove this hard-coded url
//         //roleType: currentRole || role || 'APPRAISEE',
//         roleType:employee.primaryRole,
//         financialYear: parseInt(extractYear(financialYear)),
//         quarter: quarter || '',
//         pageType: page_type,
//         appraisalStatus: employee?.appraisalStatus || employee?.APPRAISAL_STATUS || 'PENDING',
//         intent: 'Fill',
//       }),
//     enabled: !!empNo && !!financialYear && !!quarter,
//   });

//   useEffect(() => {
//     if (isError) {
//       toast.error(`Failed to fetch quarterly check-in data: ${error?.message || 'Unknown error'}`);
//     }
//   }, [isError, error]);

//   // Extract and set data from API response
//   useEffect(() => {
//     if (data) {
//       const responseData = data?.data || data;

//        // Store full response globally so handleSave can use it
//     setFullResponseData(responseData);

//       // Process measurable KRA data from results_KRA_LIST
//   const measurableList = responseData?.results_KRA_LIST?.measurable || [];

  
      
//       if (measurableList.length > 0) {
//         // Get unique months from the data
//         const monthNumbers = [...new Set(measurableList.map(item => item.MONTH))].sort((a, b) => a - b);
        
//         if (monthNumbers.length > 0) {
//           // Convert month numbers to month names
//           const monthNames = monthNumbers.map(num => getMonthName(num));
//           setMonths(monthNames);
//           setActiveMonth(monthNames[0]);
          
//           // Group KRA data by month
//           const kraByMonth = {};
//           monthNumbers.forEach((monthNum, idx) => {
//             const monthName = monthNames[idx];
//             kraByMonth[monthName] = measurableList.filter(item => item.MONTH === monthNum);
//           });
//           setMonthlyMeasurableData(kraByMonth);

          
          
//           // Calculate monthly scores for the summary table
//           const scores = {};
//           monthNumbers.forEach((monthNum, idx) => {
//             const monthName = monthNames[idx];
//             const monthData = measurableList.filter(item => item.MONTH === monthNum);
            
//             const totalActual = monthData.reduce((sum, item) => sum + (parseFloat(item.actual_score) || 0), 0);
//             const totalMax = monthData.reduce((sum, item) => sum + (parseFloat(item.maxscore) || 0), 0);
            
//             scores[monthName] = {
//               actual: totalActual,
//               max: totalMax
//             };
//           });
//           setMonthlyScores(scores);
//         }
        
//         setMeasurableKraListData(measurableList);
//       }

        
//   // 3. MEASURABLE MONTH COMMENTS
//   // API FIELD => ALL_MEASURABLE_COMMENT
//   const commentsObj = responseData?.ALL_MEASURABLE_COMMENT || {};

  

//   const mappedComments = {};
//   Object.keys(commentsObj).forEach(monthNum => {
//     const mNum = parseInt(monthNum);
//     const mName = getMonthName(mNum);

//     mappedComments[mName] = commentsObj[monthNum]?.MEASURABLE_COMMENT || "";
//   });

//   setComments(prev => ({
//     ...prev,
//     measurableMonthComments: mappedComments
//   }));

//       // Set non-measurable KRA data
//       if (responseData?.results_KRA_LIST?.non_measurable) {
//         setNonMeasurableKraListData(responseData.results_KRA_LIST.non_measurable);
//       } else if (responseData?.nonMeasurableKraList) {
//         setNonMeasurableKraListData(responseData.nonMeasurableKraList);
//       }

//       // Set development inputs
//       if (responseData?.developmentInputs) {
//         setDevelopmentInputsData(responseData.developmentInputs);
//       } else if (responseData?.developmentInputsData) {
//         setDevelopmentInputsData(responseData.developmentInputsData);
//       }

//       // Set KRA data
//       if (responseData?.kraData) {
//         setKraData(responseData.kraData);
//       }
//     }
//   }, [data]);

//   const isEditableBy = (fieldOwner) => {
//     switch (currentRole) {
//       case 'APPRAISEE':
//         return fieldOwner === 'appraisee';
//       case 'APPRAISER':
//         return fieldOwner === 'appraiser';
//       case 'REVIEWER':
//         return fieldOwner === 'reviewer';
//       default:
//         return false;
//     }
//   };


//   // Convert month names back to month numbers
// const getMonthNumber = (name) => {
//   const months = {
//     January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
//     July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
//   };
//   return months[name] || 0;
// };

// // Build final measurable array
// const buildMeasurablePayload = () => {
//   return months.flatMap((monthName) => {
//     const rows = monthlyMeasurableData[monthName] || [];
//     const mNum = getMonthNumber(monthName);

//     return rows.map((item) => ({
//       KRA_CODE: item.KRA_CODE,
//       MONTH: mNum,
//       actual: item.actual,
//       target: item.target,
//       actual_score: item.actual_score,
//       maxscore: item.maxscore,
//       COMMENT_REPA: item.COMMENT_REPA || null
//     }));
//   });
// };

// // Build full kraData array for ALL months
// const buildKraDataPayload = () => {
//   return months.flatMap(monthName => {
//     const rows = monthlyMeasurableData[monthName] || [];
//     return rows.map(row => ({ ...row }));  // backend wants FULL KRA object
//   });
// };

// // Convert your month-wise comment object → array like [“c1”, “c2”, “c3”]
// const buildPerformanceMeasurableComments = () => {
//   const monthList = Object.keys(comments.measurableMonthComments || {});
//   const sortedMonths = monthList.sort(
//     (a, b) => getMonthNumber(a) - getMonthNumber(b)
//   );
//   return sortedMonths.map(month => comments.measurableMonthComments[month]);
// };

// const formatDate = (dateString) => {
//   if (!dateString) return "";

//   const date = new Date(dateString);

//   // Format: 01 Jul 2024
//   return date.toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric"
//   });
// };

// const cleanDateRange = () => {
//   if (!dateRange || !dateRange.includes("→")) return "";

//   const [start, end] = dateRange.split("→").map(d => d.trim());

//   return `${formatDate(start)} → ${formatDate(end)}`;
// };




// const handleSave = async () => {
//   try {
//     const kraDataPayload = buildKraDataPayload();
//     const measurableCommentsArr = buildPerformanceMeasurableComments();

//     const payload = {
//       financialYear: parseInt(extractYear(financialYear)),
//       quarter: quarter,
//       empNumber: empNo,
//       urlId: employee?.url || "U-34545",

//       kraData: kraDataPayload,   // full measurable KRA list

//       submittype: "repa", // because you are APPRAISER

//       startDate: "2024-07-01 00:00:00.0",   // you can update dynamically
//       endDate: "2024-09-30 00:00:00.0",

//       reportingAuthority: fullResponseData?.REPORTING_AUTHORITY_NAME || "",
//       organizationName: fullResponseData?.organisation || "",

//       nonMeasurableComment: fullResponseData?.NON_MEASURABLE_COMMENT || "",
//       performanceNonMeasurableComment: fullResponseData?.performance_non_measurable_score_total || "",
//       performanceSemiMeasurableComment: fullResponseData?.SEMI_MEASURABLE_COMMENT || "",
//       performancePeriodComment: fullResponseData?.HIGHLIGHTS_COMMENTS || "",
//       areasPerformanceComment: fullResponseData?.BELOW_EXPECTATIONS_COMMENTS || ""

//     };

//     console.log("SAVE PAYLOAD =>", payload);

//     await appraisalAPI.appraiserSaveQuarterlyCheckIn(payload);

//     toast.success("Draft saved successfully!");

//   } catch (error) {
//     toast.error("Failed to save draft");
//     console.error("Save error =>", error);
//   }
// };


// const handleSubmit = async () => {
//   try {
//     const measurablePayload = buildMeasurablePayload();
//     const monthCommentsPayload = buildPerformanceMeasurableComments();

//     const payload = {
//       financialYear: parseInt(extractYear(financialYear)),
//       quarter: quarter,
//       empNumber: empNo,
//       urlId: employee?.url || "U-34545",
//       kraData: kraDataPayload,
//       submittype: "self",

//       startDate: "2024-07-01 00:00:00.0",
//       endDate: "2024-09-30 00:00:00.0",

//       reportingAuthority: employee?.appraiser || "",
//       organizationName: employee?.branch || "",

//       performanceMeasurableComment: measurableCommentsPayload,
//       nonMeasurableComment: formInputs.nonMeasurableComment,
//       performanceNonMeasurableComment: formInputs.performanceNonMeasurableComment,
//       performanceSemiMeasurableComment: formInputs.performanceSemiMeasurableComment,
//       performancePeriodComment: formInputs.performancePeriodComment,
//       areasPerformanceComment: formInputs.areasPerformanceComment
//     };


//     console.log("Submitting payload:", payload);

//     const response = await appraisalAPI.submitQuarterlyAppraiserCheckInReport(payload);

//     toast.success("Check-In Submitted Successfully!");
//   } catch (error) {
//     toast.error("Failed to submit check-in");
//     console.error(error);
//   }
// };


//   // Calculate monthly scores data for the table
//   const monthsData = months.map(month => {
//     const monthData = monthlyScores[month] || {};
//     return {
//       month,
//       actual: monthData.actual || 0,
//       max: monthData.max || 0,
//     };
//   });
//   const averageActual = monthsData.length > 0 
//     ? monthsData.reduce((sum, m) => sum + m.actual, 0) / monthsData.length 
//     : 0;
//   const averageMax = monthsData.length > 0 
//     ? monthsData.reduce((sum, m) => sum + m.max, 0) / monthsData.length 
//     : 0;

//   // Development inputs questions
//   const developmentInputsQuestions = developmentInputsData.length > 0 
//     ? developmentInputsData 
//     : [
//         { question: 'Please mention the highlights of your performance on this KRA', required: true },
//         { question: 'Please mention the areas for improvement on this KRA', required: true},
//       ];

//   if (!financialYear || !appraisalPeriod || !quarter) {
//     return (
//       <div className="pageWrapper">
//         <div className="pageWrapper-header">
//           <BackButton />
//           <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Add Appraiser Check-In</h1>
//         </div>
//         <div className="text-center mt-5">
//           <p className="text-danger fw-semibold">Missing required parameters: Financial Year, Appraisal Period, or Quarter</p>
//         </div>
//       </div>
//     );
//   }

//   if (isLoading) {
//     return (
//       <div className="pageWrapper">
//         <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
//           <div className="headline d-flex flex-row justify-content-between align-items-center">
//             <BackButton />
//             <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Add Appraiser Check-In</h1>
//           </div>
//         </div>
//         <LoadingSpinner />
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div className="pageWrapper">
//         <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
//           <div className="headline d-flex flex-row justify-content-between align-items-center">
//             <BackButton />
//             <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Add Appraiser Check-In</h1>
//           </div>
//         </div>
//         <div className="text-center mt-5">
//           <p className="text-danger fw-semibold">Failed to load check-in data</p>
//           <p className="text-muted">{error?.message || 'Please try again later'}</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="pageWrapper">
//       <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
//         <div className="headline d-flex flex-row justify-content-between align-items-center">
//           <BackButton />
//           <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Add Appraiser Check-In</h1>
//         </div>
//       </div>

//       <div className="pageWrapper-content d-flex flex-column m-1 p-3">
//      <CheckInDescriptionSection
//   employee={employee}
//   dateRange={cleanDateRange()}
// />


//         <div className="note mt-5 mb-5">
//           <span className="text-muted">Note: </span>
//           <span className="text-muted">
//             Please raise an exception if actual or target values are incorrect.
//           </span>
//         </div>

//         <div className="table-container">
//           <table className="table-accent">
//             <thead>
//               <tr>
//                 <th style={{width:"55%"}}>Month</th>
//                 <th style={{width:"25%"}}>Actual</th>
//                 <th style={{width:"25%"}}>Max</th>
//               </tr>
//             </thead>
//             <tbody>
//               {monthsData.map(({ month, actual, max }) => (
//                 <tr key={month}>
//                   <td>{month}</td>
//                   <td>{actual.toFixed(1)}</td>
//                   <td>{max.toFixed(1)}</td>
//                 </tr>
//               ))}
//               <tr>
//                 <td><b>Average</b></td>
//                 <td>{averageActual.toFixed(1)}</td>
//                 <td>{averageMax.toFixed(1)}</td>
//               </tr>
//             </tbody>
//           </table>
//         </div>

      

//         <div className="discretionary-kra-section d-flex flex-column gap-3 shadow-sm m-1 p-3">
//     <QuaterAppraiserMeasurableKra
//   data={monthlyMeasurableData[activeMonth] || []}
//   activeMonth={activeMonth}
//   months={months}
//   setActiveMonth={setActiveMonth}
// />


         
//           <QuaterAppraiserNonMeasureableKra/>
//         </div>

//         <div className="development-inputs-section d-flex flex-column gap-3 shadow-sm m-1 p-3">
//           <h5 className="text-primary fw-bold mb-3">Development Inputs</h5>
//           <DevelopmentInputs
//             questions={developmentInputsQuestions}
//             role={currentRole}
//             isEditableBy={isEditableBy}
//           />
//         </div>
//       </div>

//       <div className="save-and-submit-button-section d-flex flex-row justify-content-end gap-3 m-3">
//         <button className="btn btn-outline-primary" onClick={handleSave}>
//           Save
//         </button>
//         <button className="btns btn-primarys" onClick={handleSubmit}>
//           Submit
//         </button>
//       </div>
//     </div>
//   );
// }

// export default QuaterlyAppraiserCheckIn;