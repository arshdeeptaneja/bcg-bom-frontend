import React from "react";
import { useNavigate } from "react-router-dom";
import "./Utilities.css";

const utilities = [
  {
    name: "Appraisal Status Change Utility",
    path: "/appraisal/hr-dashboard/appraisal-status-change-utility",
  },
  {
    name: "Appraisal & Reviewing Update by Emp Number",
    path: "/appraisal/hr-dashboard/appraisal-update",
  },
  {
    name: "Appeal Committee",
    path: "/appraisal/hr-dashboard/appeal-comittee",
  },
  {
    name: "Reporting Authority update in bulk",
    path: "/appraisal/hr-dashboard/reporting-authority-reviewing-auth-bulk",
  },
  {
    name: "Validator Update Utility",
    path: "/appraisal/hr-dashboard/validator-update-utility",
  },
  {
    name: "Exception Delection Utility",
    path: "/appraisal/hr-dashboard/exception-delection-utility",
  },
  {
    name: "Appraiser & Reviewer update by Emp Number",
     path: "/appraisal/hr-dashboard/reporting-authority-reviewing-auth-bulk",
  },
  {
    name: "Update module active & inactive date",
    path: "/appraisal/hr-dashboard/module-active-inactive-date",
  },

    { name: "Update Quarterly Appraiser details in bulk", 
      path: "/utility/quarterly-appraiser-bulk" },
  { name: "Exception Score Update Utility", path: "/appraisal/exception-score" },
  { name: "Admin Setting to Discretionary KRA", path: "/appraisal/hr-dashboard/admin-setting" },

  // { name: "Change Quarterly/Annual Appraisal Status", path: "" },
  // { name: "Update discretionary KRA scores in bulk", path: "" },
  // { name: "Quarterly Exception Deletion", path: "" },

  { name: "Annual Appeal Deletion", path: "/appraisal/hr-dashboard/appeal-delection" },
  

  // { name: "Update Appellate Authority details in bulk", path: "" },
  // { name: "Update module active & inactive date", path: "" },
  // { name: "Update module active & inactive date by emp number", path: "" },

  // { name: "Insert Annual Roles", path: "" },
  // { name: "Exception Score Updation Utility", path: "" },
];

const UtilitiesSection = () => {
  const navigate = useNavigate();

  return (
    <section className="container my-4">
      <h2 className="mb-4 fw-semibold">Utilities</h2>
      <div className="row g-3">
        {utilities.map((utility, index) => (
          <div className="col-md-4" key={index}>
            <div
              className={`utility-box text-center ${
                index === 0 ? "highlight" : ""
              }`}
              onClick={() => navigate(utility.path)}
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
