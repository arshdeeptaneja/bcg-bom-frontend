import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { appraisalAPI } from "../../../../services/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import LoadingSpinner from "../../../../components/Spinner";
import "./Utilities.css";



const UtilitiesSection = ({ financialYear, quarter }) => {



  const utilities = [
    {
      name: "Appraisal Status Change Utility",
      path: `/appraisal/hr-dashboard/appraisal-status-change-utility?financialYear=${financialYear}&quarter=${quarter}`,
    },
    {
      name: "Appraiser, Reviewer and Acceptor update",
      path: `/appraisal/hr-dashboard/appraisal-update?financialYear=${financialYear}&quarter=${quarter}`,
    },
    {
      name: "Update Appellate Authority details in bulk",
      path: `/appraisal/hr-dashboard/appeal-comittee?financialYear=${financialYear}&quarter=${quarter}`,
    },
    {
      name: "Appeal Deletion",
      path: `/appraisal/hr-dashboard/appeal-delection?financialYear=${financialYear}&quarter=${quarter}`,
    },
    {
      name: "Reporting Authority update in bulk",
      path: `/appraisal/hr-dashboard/reporting-bulk-layout?financialYear=${financialYear}&quarter=${quarter}`,
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
       { name: "Insert Annual Roles", path: "" },

   // {
     // name: "Update Quarterly Appraiser details in bulk",
    //  path: `/utility/quarterly-appraiser-bulk?financialYear=${financialYear}&quarter=${quarter}`
    //},
   // { name: "Exception Score Update Utility", path: `/appraisal/exception-score?financialYear=${financialYear}&quarter=${quarter}` },
   // { name: "Admin Setting to Discretionary KRA", path: `/appraisal/hr-dashboard/admin-setting?financialYear=${financialYear}&quarter=${quarter}` },
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
 
     //{
      //name: "Reporting Authority and Reviewing Authority",
     // path: `/appraisal/hr-dashboard/reporting-authority-reviewing-auth-bulks?financialYear=${financialYear}&quarter=${quarter}`,
   // },

    // { name: "Exception Score Updation Utility", path: "" },
  ];
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // React Query mutation: Insert Annual Roles
  const insertAnnualRolesMutation = useMutation({
    mutationFn: async () => {
      return await appraisalAPI.insertAnnualRoles();
    },
    onSuccess: (data) => {
      console.log("Insert Response:", data);
      setShowConfirmModal(false); // Close confirmation modal
      if (data?.type === "success") {
        toast.success(data?.message || "Annual roles inserted successfully!");
    } else {
        toast.error(data?.message || "Failed to insert Annual Roles!");
    }
    },
    onError: (error) => {
      console.error("Insert Annual Roles Error:", error);
      setShowConfirmModal(false); // Close confirmation modal
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to insert Annual Roles!";
      toast.error(errorMessage);
    },
  });

  const handleInsertAnnualRoles = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmInsert = () => {
    insertAnnualRolesMutation.mutate();
  };

  const handleCancelInsert = () => {
    setShowConfirmModal(false);
};

  const handleClick = (utility) => {
    if (utility.name === "Insert Annual Roles") {
      handleInsertAnnualRoles();
    } else {
      navigate(utility.path);
    }
  };

  return (
    <section className="container my-4" style={{ position: "relative" }}>
      <h2 className="mb-4 fw-semibold">Utilities</h2>

      {/* Loading Overlay with Blur */}
      {insertAnnualRolesMutation.isPending && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <LoadingSpinner />
          <p className="text-white fw-semibold mt-3">Processing, please wait...</p>
        </div>
      )}

      <div className="row g-3" style={{ filter: insertAnnualRolesMutation.isPending ? "blur(2px)" : "none" }}>
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

      {/* Custom Confirmation Modal */}
      {showConfirmModal && (
        <div
          className="modal fade show d-block"
          style={{
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(2px)",
            zIndex: 1050,
          }}
          onClick={handleCancelInsert}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content" style={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)" }}>
              <div className="modal-header" style={{ borderBottom: "1px solid #e9ecef", padding: "20px 24px" }}>
                <h5 className="modal-title fw-semibold" style={{ color: "#475670", fontSize: "1.25rem" }}>
                  Confirm Action
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCancelInsert}
                  disabled={insertAnnualRolesMutation.isPending}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body" style={{ padding: "24px" }}>
                <div className="d-flex align-items-center mb-3">
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      backgroundColor: "#fff3cd",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "16px",
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                        stroke="#ffc107"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="mb-0 fw-medium" style={{ color: "#475670", fontSize: "1rem" }}>
                    Are you sure you want to insert annual roles?
                  </p>
                </div>
                <p className="text-muted mb-0" style={{ fontSize: "0.9rem", marginLeft: "64px" }}>
                  This action will insert annual roles into the system. Please confirm to proceed.
                </p>
              </div>
              <div className="modal-footer" style={{ borderTop: "1px solid #e9ecef", padding: "16px 24px", gap: "12px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancelInsert}
                  disabled={insertAnnualRolesMutation.isPending}
                  style={{
                    borderRadius: "6px",
                    padding: "8px 20px",
                    fontWeight: "500",
                    border: "1px solid #dee2e6",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleConfirmInsert}
                  disabled={insertAnnualRolesMutation.isPending}
                  style={{
                    borderRadius: "6px",
                    padding: "8px 20px",
                    fontWeight: "500",
                    backgroundColor: "#0389d0",
                    border: "none",
                  }}
                >
                  {insertAnnualRolesMutation.isPending ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Processing...
                    </>
                  ) : (
                    "Confirm"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default UtilitiesSection;