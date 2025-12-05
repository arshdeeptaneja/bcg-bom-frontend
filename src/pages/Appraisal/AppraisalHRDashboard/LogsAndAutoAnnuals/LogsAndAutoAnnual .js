/**
 * The LogsAndAutoAnnuals component in React renders a section for displaying logs and another section
 * for auto annual appraisals with buttons for various actions.
 * @returns The `LogsAndAutoAnnuals` component is being returned. It consists of two sections: Logs
 * Section and Auto Annual Appraisal Section. The Logs Section displays a list of log items with
 * download buttons, while the Auto Annual Appraisal Section displays a table with appraisal period and
 * action buttons for auto submitting appraisee scales.
 */
import React from "react";
import "./LogsAndAutoAnnuals.css";
import { appraisalAPI } from "../../../../services/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useAuth } from "../../../../contexts/AuthContext";

const LogsAndAutoAnnuals = ({ financialYear }) => {
  const extractYear = (fy) => {
    const match = fy?.match(/FY (\d{4})/);
    return match ? match[1] : new Date().getFullYear().toString();
  };

  // Get empNumber from auth context
  const { getUserProperty } = useAuth();
  const empNumber = getUserProperty("empNo") 
                 || getUserProperty("EMP_ID");

  // React Query mutation: download Quarterly Appraisal Status Log
  const downloadQuarterlyStatusLogMutation = useMutation({
    mutationFn: async () => {
      const year = extractYear(financialYear);
      const blob = await appraisalAPI.logs.getQuarterlyAppraisalStatusLog({
        financialYear: year,
      });
      return blob;
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `quarterly_appraisal_status_log_${Date.now()}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Quarterly Appraisal Status Log downloaded successfully!");
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Quarterly status log download error:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to download Quarterly Appraisal Status Log";
      toast.error(message);
    },
  });

  const handleDownloadQuarterlyStatusLog = () => {
    if (!financialYear) {
      toast.error("Please select a financial year first.");
      return;
    }
    downloadQuarterlyStatusLogMutation.mutate();
  };

  // React Query mutation: download Annual Appraisal Status Log
  const downloadAnnualStatusLogMutation = useMutation({
    mutationFn: async () => {
      const year = extractYear(financialYear);
      const blob = await appraisalAPI.logs.getAnnualAppraisalStatusLog({
        financialYear: year,
      });
      return blob;
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `annual_appraisal_status_log_${Date.now()}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Annual Appraisal Status Log downloaded successfully!");
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Annual status log download error:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to download Annual Appraisal Status Log";
      toast.error(message);
    },
  });

  const handleDownloadAnnualStatusLog = () => {
    if (!financialYear) {
      toast.error("Please select a financial year first.");
      return;
    }
    downloadAnnualStatusLogMutation.mutate();
  };

  // React Query mutation: download Annual Appraiser Details
  const downloadAnnualAppraiserDetailsMutation = useMutation({
    mutationFn: async () => {
      const year = extractYear(financialYear);
      const blob = await appraisalAPI.logs.getAnnualAppraiserDetails({
        financialYear: year,
      });
      return blob;
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `annual_appraiser_details_${Date.now()}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Annual appraiser details downloaded successfully!");
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Annual appraiser details download error:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to download annual appraiser details";
      toast.error(message);
    },
  });

  const handleDownloadAnnualAppraiserDetails = () => {
    if (!financialYear) {
      toast.error("Please select a financial year first.");
      return;
    }
    downloadAnnualAppraiserDetailsMutation.mutate();
  };

  // React Query mutation: download Appeal Report Log
  const downloadAppealReportLogMutation = useMutation({
    mutationFn: async () => {
      const year = extractYear(financialYear);
      const blob = await appraisalAPI.logs.getAppealReportLog({
        financialYear: year,
      });
      return blob;
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `appeal_report_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Appeal Report downloaded successfully!");
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Appeal Report download error:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to download Appeal Report";
      toast.error(message);
    },
  });

  const handleDownloadAppealReportLog = () => {
    if (!financialYear) {
      toast.error("Please select a financial year first.");
      return;
    }
    downloadAppealReportLogMutation.mutate();
  };

  // React Query mutation: download Q1 Appraisal Score Log
  const downloadQ1ScoreLogMutation = useMutation({
    mutationFn: async () => {
      const year = extractYear(financialYear);
      const blob = await appraisalAPI.logs.getQ1ScoreLog({
        financialYear: year,
      });
      return blob;
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `q1_appraisal_score_log_${Date.now()}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Q1 appraisal score log downloaded successfully!");
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Q1 score log download error:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to download Q1 appraisal score log";
      toast.error(message);
    },
  });

  const handleDownloadQ1ScoreLog = () => {
    if (!financialYear) {
      toast.error("Please select a financial year first.");
      return;
    }
    downloadQ1ScoreLogMutation.mutate();
  };

  // React Query mutation: download Q2 Appraisal Score Log
  const downloadQ2ScoreLogMutation = useMutation({
    mutationFn: async () => {
      const year = extractYear(financialYear);
      const blob = await appraisalAPI.logs.getQ2ScoreLog({
        financialYear: year,
      });
      return blob;
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `q2_appraisal_score_log_${Date.now()}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Q2 appraisal score log downloaded successfully!");
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Q2 score log download error:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to download Q2 appraisal score log";
      toast.error(message);
    },
  });

  const handleDownloadQ2ScoreLog = () => {
    if (!financialYear) {
      toast.error("Please select a financial year first.");
      return;
    }
    downloadQ2ScoreLogMutation.mutate();
  };

  // React Query mutation: download Q3 Appraisal Score Log
  const downloadQ3ScoreLogMutation = useMutation({
    mutationFn: async () => {
      const year = extractYear(financialYear);
      const blob = await appraisalAPI.logs.getQ3ScoreLog({
        financialYear: year,
      });
      return blob;
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `q3_appraisal_score_log_${Date.now()}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Q3 appraisal score log downloaded successfully!");
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Q3 score log download error:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to download Q3 appraisal score log";
      toast.error(message);
    },
  });

  const handleDownloadQ3ScoreLog = () => {
    if (!financialYear) {
      toast.error("Please select a financial year first.");
      return;
    }
    downloadQ3ScoreLogMutation.mutate();
  };

  // React Query mutation: download Q4 Appraisal Score Log
  const downloadQ4ScoreLogMutation = useMutation({
    mutationFn: async () => {
      const year = extractYear(financialYear);
      const blob = await appraisalAPI.logs.getQ4ScoreLog({
        financialYear: year,
      });
      return blob;
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `q4_appraisal_score_log_${Date.now()}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Q4 appraisal score log downloaded successfully!");
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Q4 score log download error:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to download Q4 appraisal score log";
      toast.error(message);
    },
  });

  const handleDownloadQ4ScoreLog = () => {
    if (!financialYear) {
      toast.error("Please select a financial year first.");
      return;
    }
    downloadQ4ScoreLogMutation.mutate();
  };

  // React Query mutation: download Annual Score Log
  const downloadAnnualScoreLogMutation = useMutation({
    mutationFn: async () => {
      const year = extractYear(financialYear);
      const blob = await appraisalAPI.logs.getAnnualScoreLog({
        financialYear: year,
      });
      return blob;
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `annual_score_log_${Date.now()}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Annual Score Log downloaded successfully!");
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Annual Score Log download error:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to download Annual Score Log";
      toast.error(message);
    },
  });

  const handleDownloadAnnualScoreLog = () => {
    if (!financialYear) {
      toast.error("Please select a financial year first.");
      return;
    }
    downloadAnnualScoreLogMutation.mutate();
  };

  // React Query mutation: download Final Score Log
  const downloadFinalScoreLogMutation = useMutation({
    mutationFn: async () => {
      const year = extractYear(financialYear);
      if (!empNumber) {
        throw new Error("Employee number is required");
      }
      const blob = await appraisalAPI.logs.getFinalScoreLog({
        financialYear: year,
        empNumber: empNumber,
      });
      return blob;
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `final_score_log_${Date.now()}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Final Score Log downloaded successfully!");
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Final Score Log download error:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to download Final Score Log";
      toast.error(message);
    },
  });

  const handleDownloadFinalScoreLog = () => {
    if (!financialYear) {
      toast.error("Please select a financial year first.");
      return;
    }
    if (!empNumber) {
      toast.error("Employee number is required.");
      return;
    }
    downloadFinalScoreLogMutation.mutate();
  };

  // React Query mutation: download Q1 Appraisal Status Log
  const downloadQ1StatusLogMutation = useMutation({
    mutationFn: async () => {
      const year = extractYear(financialYear);
      const blob = await appraisalAPI.logs.getQ1StatusLog({
        financialYear: year,
      });
      return blob;
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `q1_appraisal_status_log_${Date.now()}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Q1 appraisal status log downloaded successfully!");
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Q1 appraisal status log download error:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to download Q1 appraisal status log";
      toast.error(message);
    },
  });

  const handleDownloadQ1StatusLog = () => {
    if (!financialYear) {
      toast.error("Please select a financial year first.");
      return;
    }
    downloadQ1StatusLogMutation.mutate();
  };

  // React Query mutation: download Q2 Appraisal Status Log
  const downloadQ2StatusLogMutation = useMutation({
    mutationFn: async () => {
      const year = extractYear(financialYear);
      const blob = await appraisalAPI.logs.getQ2StatusLog({
        financialYear: year,
      });
      return blob;
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `q2_appraisal_status_log_${Date.now()}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Q2 appraisal status log downloaded successfully!");
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Q2 appraisal status log download error:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to download Q2 appraisal status log";
      toast.error(message);
    },
  });

  const handleDownloadQ2StatusLog = () => {
    if (!financialYear) {
      toast.error("Please select a financial year first.");
      return;
    }
    downloadQ2StatusLogMutation.mutate();
  };

  // React Query mutation: download Q3 Appraisal Status Log
  const downloadQ3StatusLogMutation = useMutation({
    mutationFn: async () => {
      const year = extractYear(financialYear);
      const blob = await appraisalAPI.logs.getQ3StatusLog({
        financialYear: year,
      });
      return blob;
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `q3_appraisal_status_log_${Date.now()}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Q3 appraisal status log downloaded successfully!");
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Q3 appraisal status log download error:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to download Q3 appraisal status log";
      toast.error(message);
    },
  });

  const handleDownloadQ3StatusLog = () => {
    if (!financialYear) {
      toast.error("Please select a financial year first.");
      return;
    }
    downloadQ3StatusLogMutation.mutate();
  };

  // React Query mutation: download Q4 Appraisal Status Log
  const downloadQ4StatusLogMutation = useMutation({
    mutationFn: async () => {
      const year = extractYear(financialYear);
      const blob = await appraisalAPI.logs.getQ4StatusLog({
        financialYear: year,
      });
      return blob;
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `q4_appraisal_status_log_${Date.now()}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Q4 appraisal status log downloaded successfully!");
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Q4 appraisal status log download error:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to download Q4 appraisal status log";
      toast.error(message);
    },
  });

  const handleDownloadQ4StatusLog = () => {
    if (!financialYear) {
      toast.error("Please select a financial year first.");
      return;
    }
    downloadQ4StatusLogMutation.mutate();
  };

  // React Query mutation: download Quarterly Exception Log
  const downloadQuarterlyExceptionLogMutation = useMutation({
    mutationFn: async () => {
      const year = extractYear(financialYear);
      const blob = await appraisalAPI.logs.getQuarterlyExceptionLog({
        financialYear: year,
      });
      return blob;
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `quarterly_exception_log_${Date.now()}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Quarterly Exception Log downloaded successfully!");
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Quarterly Exception Log download error:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to download Quarterly Exception Log";
      toast.error(message);
    },
  });

  const handleDownloadQuarterlyExceptionLog = () => {
    if (!financialYear) {
      toast.error("Please select a financial year first.");
      return;
    }
    downloadQuarterlyExceptionLogMutation.mutate();
  };

  // React Query mutation: download Development Inputs Log
  const downloadDevelopmentInputsLogMutation = useMutation({
    mutationFn: async () => {
      const year = extractYear(financialYear);
      const blob = await appraisalAPI.logs.getDevelopmentInputsLog({
        financialYear: year,
      });
      return blob;
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `development_inputs_log_${Date.now()}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Development Inputs Log downloaded successfully!");
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Development Inputs Log download error:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to download Development Inputs Log";
      toast.error(message);
    },
  });

  const handleDownloadDevelopmentInputsLog = () => {
    if (!financialYear) {
      toast.error("Please select a financial year first.");
      return;
    }
    downloadDevelopmentInputsLogMutation.mutate();
  };

  // React Query mutation: download Integrity Inputs Log
  const downloadIntegrityInputsLogMutation = useMutation({
    mutationFn: async () => {
      const year = extractYear(financialYear);
      const blob = await appraisalAPI.logs.getIntegrityInputsLog({
        financialYear: year,
      });
      return blob;
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `integrity_inputs_log_${Date.now()}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Integrity Inputs Log downloaded successfully!");
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Integrity Inputs Log download error:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to download Integrity Inputs Log";
      toast.error(message);
    },
  });

  const handleDownloadIntegrityInputsLog = () => {
    if (!financialYear) {
      toast.error("Please select a financial year first.");
      return;
    }
    downloadIntegrityInputsLogMutation.mutate();
  };

  // React Query mutation: download Repa, Reva, and AC Remarks Log
  const downloadRepaRevaAcRemarksLogMutation = useMutation({
    mutationFn: async () => {
      const year = extractYear(financialYear);
      const blob = await appraisalAPI.logs.getRepaRevaAcRemarksLog({
        financialYear: year,
      });
      return blob;
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `repa_reva_ac_remarks_log_${Date.now()}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Repa, Reva, and AC Remarks Log downloaded successfully!");
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Repa, Reva, and AC Remarks Log download error:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to download Repa, Reva, and AC Remarks Log";
      toast.error(message);
    },
  });

  const handleDownloadRepaRevaAcRemarksLog = () => {
    if (!financialYear) {
      toast.error("Please select a financial year first.");
      return;
    }
    downloadRepaRevaAcRemarksLogMutation.mutate();
  };

  // React Query mutation: download Exception Approval List Log
  const downloadExceptionApprovalListLogMutation = useMutation({
    mutationFn: async () => {
      const year = extractYear(financialYear);
      const blob = await appraisalAPI.logs.getExceptionApprovalListLog({
        financialYear: year,
      });
      return blob;
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `exception_approval_list_${Date.now()}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Exception approval List downloaded successfully!");
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Exception approval List download error:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to download Exception approval List";
      toast.error(message);
    },
  });

  const handleDownloadExceptionApprovalListLog = () => {
    if (!financialYear) {
      toast.error("Please select a financial year first.");
      return;
    }
    downloadExceptionApprovalListLogMutation.mutate();
  };

  return (
    <div className="container-fluid py-4 page">

      {/* Logs Section */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">

          <h5 className="section-title mb-4">Logs</h5>

          <div className="row g-3">

            {[
              "Quarterly Appraisal Status Log",
              "Annual Appraisal Status Log",
              "Download annual appraiser details",
              "Appeal Report",
              "Q1 appraisal score log",
              "Q2 appraisal score log",
              "Q3 appraisal score log",
              "Q4 appraisal score log",
              "Annual Score Log",
              "Final Score Log",
              "Q1 appraisal status log",
              "Q2 appraisal status log",
              "Q3 appraisal status log",
              "Q4 appraisal status log",
              "Quarterly Exception Log",
              "Development Inputs Log",
              "Integrity Inputs Log",
              "Repa, Reva, and AC Remarks Log",
              "Exception approval List",
            ].map((item, index) => {
              const isQuarterlyStatus =
                item === "Quarterly Appraisal Status Log";
              const isAnnualStatus = item === "Annual Appraisal Status Log";
              const isAnnualAppraiserDetails =
                item === "Download annual appraiser details";
              const isAppealReport = item === "Appeal Report";
              const isQ1ScoreLog = item === "Q1 appraisal score log";
              const isQ2ScoreLog = item === "Q2 appraisal score log";
              const isQ3ScoreLog = item === "Q3 appraisal score log";
              const isQ4ScoreLog = item === "Q4 appraisal score log";
              const isAnnualScoreLog = item === "Annual Score Log";
              const isFinalScoreLog = item === "Final Score Log";
              const isQ1StatusLog = item === "Q1 appraisal status log";
              const isQ2StatusLog = item === "Q2 appraisal status log";
              const isQ3StatusLog = item === "Q3 appraisal status log";
              const isQ4StatusLog = item === "Q4 appraisal status log";
              const isQuarterlyExceptionLog =
                item === "Quarterly Exception Log";
              const isDevelopmentInputsLog =
                item === "Development Inputs Log";
              const isIntegrityInputsLog =
                item === "Integrity Inputs Log";
              const isRepaRevaAcRemarksLog =
                item === "Repa, Reva, and AC Remarks Log";
              const isExceptionApprovalList =
                item === "Exception approval List";
              const isLoadingQuarterly =
                isQuarterlyStatus &&
                downloadQuarterlyStatusLogMutation.isPending;
              const isLoadingAnnual =
                isAnnualStatus && downloadAnnualStatusLogMutation.isPending;
              const isLoadingAnnualAppraiserDetails =
                isAnnualAppraiserDetails &&
                downloadAnnualAppraiserDetailsMutation.isPending;
              const isLoadingAppealReport =
                isAppealReport && downloadAppealReportLogMutation.isPending;
              const isLoadingQ1ScoreLog =
                isQ1ScoreLog && downloadQ1ScoreLogMutation.isPending;
              const isLoadingQ2ScoreLog =
                isQ2ScoreLog && downloadQ2ScoreLogMutation.isPending;
              const isLoadingQ3ScoreLog =
                isQ3ScoreLog && downloadQ3ScoreLogMutation.isPending;
              const isLoadingQ4ScoreLog =
                isQ4ScoreLog && downloadQ4ScoreLogMutation.isPending;
              const isLoadingAnnualScoreLog =
                isAnnualScoreLog && downloadAnnualScoreLogMutation.isPending;
              const isLoadingFinalScoreLog =
                isFinalScoreLog && downloadFinalScoreLogMutation.isPending;
              const isLoadingQ1StatusLog =
                isQ1StatusLog && downloadQ1StatusLogMutation.isPending;
              const isLoadingQ2StatusLog =
                isQ2StatusLog && downloadQ2StatusLogMutation.isPending;
              const isLoadingQ3StatusLog =
                isQ3StatusLog && downloadQ3StatusLogMutation.isPending;
              const isLoadingQ4StatusLog =
                isQ4StatusLog && downloadQ4StatusLogMutation.isPending;
              const isLoadingQuarterlyExceptionLog =
                isQuarterlyExceptionLog &&
                downloadQuarterlyExceptionLogMutation.isPending;
              const isLoadingDevelopmentInputsLog =
                isDevelopmentInputsLog &&
                downloadDevelopmentInputsLogMutation.isPending;
              const isLoadingIntegrityInputsLog =
                isIntegrityInputsLog &&
                downloadIntegrityInputsLogMutation.isPending;
              const isLoadingRepaRevaAcRemarksLog =
                isRepaRevaAcRemarksLog &&
                downloadRepaRevaAcRemarksLogMutation.isPending;
              const isLoadingExceptionApprovalList =
                isExceptionApprovalList &&
                downloadExceptionApprovalListLogMutation.isPending;

              const onClickHandler = isQuarterlyStatus
                ? handleDownloadQuarterlyStatusLog
                : isAnnualStatus
                ? handleDownloadAnnualStatusLog
                : isAnnualAppraiserDetails
                ? handleDownloadAnnualAppraiserDetails
                : isAppealReport
                ? handleDownloadAppealReportLog
                : isQ1ScoreLog
                ? handleDownloadQ1ScoreLog
                : isQ2ScoreLog
                ? handleDownloadQ2ScoreLog
                : isQ3ScoreLog
                ? handleDownloadQ3ScoreLog
                : isQ4ScoreLog
                ? handleDownloadQ4ScoreLog
                : isAnnualScoreLog
                ? handleDownloadAnnualScoreLog
                : isFinalScoreLog
                ? handleDownloadFinalScoreLog
                : isQ1StatusLog
                ? handleDownloadQ1StatusLog
                : isQ2StatusLog
                ? handleDownloadQ2StatusLog
                : isQ3StatusLog
                ? handleDownloadQ3StatusLog
                : isQ4StatusLog
                ? handleDownloadQ4StatusLog
                : isQuarterlyExceptionLog
                ? handleDownloadQuarterlyExceptionLog
                : isDevelopmentInputsLog
                ? handleDownloadDevelopmentInputsLog
                : isIntegrityInputsLog
                ? handleDownloadIntegrityInputsLog
                : isRepaRevaAcRemarksLog
                ? handleDownloadRepaRevaAcRemarksLog
                : isExceptionApprovalList
                ? handleDownloadExceptionApprovalListLog
                : undefined;

              const isDisabled =
                isLoadingQuarterly ||
                isLoadingAnnual ||
                isLoadingAnnualAppraiserDetails ||
                isLoadingAppealReport ||
                isLoadingQ1ScoreLog ||
                isLoadingQ2ScoreLog ||
                isLoadingQ3ScoreLog ||
                isLoadingQ4ScoreLog ||
                isLoadingAnnualScoreLog ||
                isLoadingFinalScoreLog ||
                isLoadingQ1StatusLog ||
                isLoadingQ2StatusLog ||
                isLoadingQ3StatusLog ||
                isLoadingQ4StatusLog ||
                isLoadingQuarterlyExceptionLog ||
                isLoadingDevelopmentInputsLog ||
                isLoadingIntegrityInputsLog ||
                isLoadingRepaRevaAcRemarksLog ||
                isLoadingExceptionApprovalList;

              return (
              <div className="col-md-3 col-sm-6" key={index}>
                  <button
                    className="log-btn w-100 d-flex align-items-center justify-content-between"
                    onClick={onClickHandler}
                    disabled={isDisabled}
                  >
                    <span>{item}</span>
                    <span className="download-icon d-flex align-items-center">
                      {isLoadingQuarterly ||
                      isLoadingAnnual ||
                      isLoadingAnnualAppraiserDetails ||
                      isLoadingAppealReport ||
                      isLoadingQ1ScoreLog ||
                      isLoadingQ2ScoreLog ||
                      isLoadingQ3ScoreLog ||
                      isLoadingQ4ScoreLog ||
                      isLoadingAnnualScoreLog ||
                      isLoadingFinalScoreLog ||
                      isLoadingQ1StatusLog ||
                      isLoadingQ2StatusLog ||
                      isLoadingQ3StatusLog ||
                      isLoadingQ4StatusLog ||
                      isLoadingQuarterlyExceptionLog ||
                      isLoadingDevelopmentInputsLog ||
                      isLoadingIntegrityInputsLog ||
                      isLoadingRepaRevaAcRemarksLog ||
                      isLoadingExceptionApprovalList ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-1"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          <span>Loading...</span>
                        </>
                      ) : (
                        "⭳"
                      )}
                    </span>
                </button>
              </div>
              );
            })}

          </div>

        </div>
      </div>

    

    </div>
  );
};

export default LogsAndAutoAnnuals;
