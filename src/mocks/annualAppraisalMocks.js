export const mockAnnualSelfAppraisalData = {
  success: true,
  data: {
    employeeDetails: {
      empNo: "36663",
      empName: "Demo User",
      designation: "Branch Manager",
      department: "Retail Banking",
      branch: "Mumbai Main",
      zone: "West Zone",
      reportingAuthority: "Jane Smith"
    },
    annual_score_summary: {
      annual_score_data: [
        {
          CATEGORY: "Business Performance",
          SELF_SCORE: 85,
          MAX_SCORE: 100,
          BY_REPORTING_AUTHORITY: 0,
          BY_REVIEVING_AUTHORITY: 0,
          BY_ACCEPTING_AUTHORITY: 0,
          POST_APPEAL_SCORE: 0,
          MD_SCORE: 0,
          ID: 1
        },
        {
          CATEGORY: "Behavioral Competencies",
          SELF_SCORE: 42,
          MAX_SCORE: 50,
          BY_REPORTING_AUTHORITY: 0,
          BY_REVIEVING_AUTHORITY: 0,
          BY_ACCEPTING_AUTHORITY: 0,
          POST_APPEAL_SCORE: 0,
          MD_SCORE: 0,
          ID: 2
        },
        {
          CATEGORY: "Leadership & Initiative",
          SELF_SCORE: 38,
          MAX_SCORE: 50,
          BY_REPORTING_AUTHORITY: 0,
          BY_REVIEVING_AUTHORITY: 0,
          BY_ACCEPTING_AUTHORITY: 0,
          POST_APPEAL_SCORE: 0,
          MD_SCORE: 0,
          ID: 3
        }
      ]
    },
    unit_converter: {
      percentage: "%",
      count: "No.",
      currency: "INR",
      lakhs: "INR Lakhs"
    },
    validation_text: "Please ensure all mandatory fields are completed before submission",
    quarterly_summary: {
      Q1: { score: 29.53, maxScore: 30, status: "Completed", percentage: 98.43 },
      Q2: { score: 28.5, maxScore: 30, status: "Completed", percentage: 95.0 },
      Q3: { score: 27.9, maxScore: 30, status: "Completed", percentage: 93.0 },
      Q4: { score: 29.1, maxScore: 30, status: "Completed", percentage: 97.0 }
    },
    overall_annual_score: 115.03,
    max_annual_score: 120,
    annual_percentage: 95.86,
    
    // Fields required by useAnnualAppraisal.js
    result_kra_list_discretionary_non_measurable_child: [
      {
        AP_KRA_ID: "NM-KRA-001",
        KRA_DESC: "Team Leadership",
        GROUP_NAME: "Behavioral",
        SCORE: 4,
        ACTUAL: 4,
        COMMENT_SELF_1: "Led team effectively during peak season",
        COMMENT_REPA: "",
        COMMENT_REVA: ""
      },
      {
        AP_KRA_ID: "NM-KRA-002",
        KRA_DESC: "Customer Service Excellence",
        GROUP_NAME: "Behavioral",
        SCORE: 5,
        ACTUAL: 5,
        COMMENT_SELF_1: "Zero customer complaints this quarter",
        COMMENT_REPA: "",
        COMMENT_REVA: ""
      },
      {
        AP_KRA_ID: "NM-KRA-003",
        KRA_DESC: "Process Compliance",
        GROUP_NAME: "Behavioral",
        SCORE: 4,
        ACTUAL: 4,
        COMMENT_SELF_1: "100% adherence to audit requirements",
        COMMENT_REPA: "",
        COMMENT_REVA: ""
      }
    ],
    result_questions: {
      development_inputs: {
        overall_development: [
          {
            ID: 1,
            QUESTION: "What were your key achievements this year?",
            CATEGORY: "Development Inputs",
            SUB_CATEGORY: "Overall Development",
            SELF_RESPONSE: "Successfully launched digital banking campaign, acquired 150+ new CASA accounts",
            SELF_RESPONSE_2: "",
            REPA_RESPONSE: "",
            REVA_RESPONSE: "",
            AC_RESPONSE: "",
            RESPONSE_ID: 101
          },
          {
            ID: 2,
            QUESTION: "What areas do you want to improve?",
            CATEGORY: "Development Inputs",
            SUB_CATEGORY: "Overall Development",
            SELF_RESPONSE: "Want to enhance skills in wealth management products",
            SELF_RESPONSE_2: "",
            REPA_RESPONSE: "",
            REVA_RESPONSE: "",
            AC_RESPONSE: "",
            RESPONSE_ID: 102
          }
        ],
        reporting_review_authority: [
          {
            ID: 12,
            QUESTION: "Appraiser's comments on performance",
            CATEGORY: "Development Inputs",
            SUB_CATEGORY: "Reporting Authority",
            SELF_RESPONSE: "",
            REPA_RESPONSE: "",
            REVA_RESPONSE: "",
            AC_RESPONSE: "",
            RESPONSE_ID: 103
          }
        ],
        integrity: [
          {
            ID: 19,
            QUESTION: "Integrity",
            CATEGORY: "Option Based",
            SUB_CATEGORY: "Integrity",
            OPTION1: "Beyond Doubt",
            OPTION2: "Doubtful",
            OPTION3: "Not Known",
            SELF_RESPONSE: "",
            REPA_RESPONSE: "option1",
            REVA_RESPONSE: "",
            RESPONSE_ID: 104
          }
        ],
        health_problems: [
          {
            ID: 10,
            QUESTION: "Do you have any health problems?",
            CATEGORY: "Option Based",
            SUB_CATEGORY: "Health",
            OPTION1: "Yes",
            OPTION2: "No",
            SELF_RESPONSE: "No",
            REPA_RESPONSE: "",
            REVA_RESPONSE: "",
            RESPONSE_ID: 105
          }
        ],
        disciplinary_actions: [
          {
            ID: 11,
            QUESTION: "Any disciplinary actions taken?",
            CATEGORY: "Option Based",
            SUB_CATEGORY: "Disciplinary",
            OPTION1: "Yes",
            OPTION2: "No",
            SELF_RESPONSE: "No",
            REPA_RESPONSE: "",
            REVA_RESPONSE: "",
            RESPONSE_ID: 106
          }
        ]
      }
    },
    continuous_learning_present: true,
    mandatory_courses: 5,
    learning_courses: 3,
    speed_circular: 10,
    elearning_score: 85
  }
};

export const mockSubmitAnnualResponse = {
  success: true,
  message: "Annual appraisal submitted successfully",
  MSG: "Annual appraisal submitted successfully"
};
