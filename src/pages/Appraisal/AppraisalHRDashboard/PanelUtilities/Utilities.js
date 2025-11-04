import React from "react";
import "./Utilities.css";

const utilities = [
  "Update Quarterly Appraiser details in bulk",
  "Change Quarterly/Annual Appraisal Status",
  "Annual Appeal Deletion",
  "Update Appellate Authority details in bulk",
  "Insert Annual Roles",
  "Update annual appraiser details in bulk",
  "Update discretionary KRA scores in bulk",
  "Appraiser and Reviewer update by Emp Number",
  "Update module active & inactive date",
  "Exception Score Updation Utility",
  "Update Validator details in bulk",
 
];

const UtilitiesSection = () => {
  return (
    <section className="container my-4">
      <h2 className="mb-4 fw-semibold">Utilities</h2>
      <div className="row g-3">
        {utilities.map((item, index) => (
          <div className="col-md-4" key={index}>
            <div
              className={`utility-box text-center ${
                index === 0 ? "highlight" : ""
              }`}
            >
              {item}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default UtilitiesSection;
