import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { appraisalAPI } from "../../../../services/api";
import "./Utilities.css";



const UtilitiesSection = ({ financialYear, quarter }) => {



  const utilities = [
    {
      name: "Appraisal Status Change Utility",
      path: `/appraisal/hr-dashboard/appraisal-status-change-utility?financialYear=${financialYear}&quarter=${quarter}`,
    },
    {
      name: "Appraisal & Reviewing Update by Emp Number",
      path: `/appraisal/hr-dashboard/appraisal-update?financialYear=${financialYear}&quarter=${quarter}`,
    },
    {
      name: "Appeal Committee",
      path: `/appraisal/hr-dashboard/appeal-comittee?financialYear=${financialYear}&quarter=${quarter}`,
    },
    {
      name: "Reporting Authority update in bulk",
      path: `/appraisal/hr-dashboard/reporting-authority-reviewing-auth-bulk?financialYear=${financialYear}&quarter=${quarter}`,
    },
    {
      name: "Validator Update Utility",
      path: `/appraisal/hr-dashboard/validator-update-utility?financialYear=${financialYear}&quarter=${quarter}`,
    },
    {
      name: "Exception Delection Utility",
      path: `/appraisal/hr-dashboard/exception-delection-utility?financialYear=${financialYear}&quarter=${quarter}`,
    },
    {
      name: "Appraiser & Reviewer update by Emp Number",
      path: `/utility/authority-reviewing-authority-bulk?financialYear=${financialYear}&quarter=${quarter}` ,
    },
    {
      name: "Update module active & inactive date",
      path: `/appraisal/hr-dashboard/module-active-inactive-date?financialYear=${financialYear}&quarter=${quarter}`,
    },

    {
      name: "Update Quarterly Appraiser details in bulk",
      path: `/utility/quarterly-appraiser-bulk?financialYear=${financialYear}&quarter=${quarter}`
    },
    { name: "Exception Score Update Utility", path: `/appraisal/exception-score?financialYear=${financialYear}&quarter=${quarter}` },
    { name: "Admin Setting to Discretionary KRA", path: `/appraisal/hr-dashboard/admin-setting?financialYear=${financialYear}&quarter=${quarter}` },
    //{ name: "Reporting Authority and Reviewing Authority update in bulk", path: `/utility/reporting-authority-reviewing-authority-bulk?financialYear=${financialYear}&quarter=${quarter}` },

    // { name: "Change Quarterly/Annual Appraisal Status", path: "" },
    // { name: "Update discretionary KRA scores in bulk", path: "" },
    // { name: "Quarterly Exception Deletion", path: "" },

    // { name: "Annual Appeal Deletion", path: "" },
    // { name: "Appraiser and Reviewer update by Emp Number", path: "" },
    // { name: "Validator update by Emp Number", path: "" },

    // { name: "Update Appellate Authority details in bulk", path: "" },
    // { name: "Update module active & inactive date", path: "" },
    // { name: "Update module active & inactive date by emp number", path: "" },
    { name: "Insert Annual Roles", path: "" },

    // { name: "Exception Score Updation Utility", path: "" },
  ];
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleInsertAnnualRoles = async () => {
    const confirmClick = window.confirm(
      "Are you sure you want to insert annual roles?"
    );
    if (!confirmClick) return;

    try {
      setLoading(true);

      const response = await appraisalAPI.insertAnnualRoles();

      alert("Annual Roles inserted successfully!");
      console.log("Insert Response:", response);

    } catch (error) {
      alert("Failed to insert Annual Roles!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (utility) => {
    if (utility.name === "Insert Annual Roles") {
      handleInsertAnnualRoles();
    } else {
      navigate(utility.path);
    }
  };

  return (
    <section className="container my-4">
      <h2 className="mb-4 fw-semibold">Utilities</h2>

      {loading && (
        <p className="text-primary fw-semibold mb-3">Processing, please wait...</p>
      )}

      <div className="row g-3">
        {utilities.map((utility, index) => (
          <div className="col-md-4" key={index}>
            <div
              className={`utility-box text-center ${index === 0 ? "highlight" : ""
                }`}
              onClick={() => handleClick(utility)}
              style={{ cursor: "pointer" }}
            >
              {utility.name}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default UtilitiesSection;