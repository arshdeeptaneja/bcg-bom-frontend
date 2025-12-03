import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { CheckInDescriptionSection } from '../../../components/Appraisal';
import LoadingSpinner from '../../../components/Spinner';
import { appraisalAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { BackButton } from '../../../components/common';
import './ReviewerMode.css';

const parseFinancialYear = (fy) => {
  if (!fy) return '';
  const match = `${fy}`.match(/(\d{4})/);
  return match ? match[1] : `${fy}`;
};

const normalizeKraRows = (source = []) => {
  if (!Array.isArray(source)) {
    return [];
  }

  return source.map((item, index) => ({
    id: item.kraId || item.id || `kra-${index + 1}`,
    kraId: item.kraId || item.id,
    title: item.kra || item.kraName || item.metric || `KRA ${index + 1}`,
    appraiseeComment: item.appraiseeComment ?? item.selfComment ?? '',
    appraiserComment: item.appraiserComment ?? '',
    reviewerComment: item.reviewerComment ?? '',
    appraiserScore: item.appraiserScore ?? item.score ?? '',
    reviewerScore: item.reviewerScore ?? '',
  }));
};

function ReviewerMode() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { getEmployeeDetails, getUserProperty } = useAuth();
  const employeeDetails = getEmployeeDetails();
  const loggedInEmpNo = getUserProperty('empNo', employeeDetails?.currentUser?.EMP_ID || '');
  const zoneName =
    employeeDetails?.currentUser?.ZONE_NAME || employeeDetails?.currentUser?.zone || '';

  const {
    financialYear = 'FY 2024-25',
    appraisalPeriod = 'Annual',
    quarter = '',
    dateRange = '',
    employee = {
      empNo: loggedInEmpNo,
      employeeName: employeeDetails?.currentUser?.EMP_NAME || 'Employee Name',
      branch: employeeDetails?.currentUser?.BRANCH_NAME || 'Branch',
      primaryRole: employeeDetails?.currentUser?.PRIMARY_ROLE || 'Primary Role',
      appraiser: employeeDetails?.currentUser?.APPRAISER_NAME || 'Appraiser',
    },
    role = 'REVIEWER',
    roleName = 'REVIEWER',
    roleId = 'REVIEWER',
    appraisalStatus = '',
    urlId,
  } = location.state || {};

  const reviewEmpNo = employee?.empNo || loggedInEmpNo;
  const parsedFinancialYear = parseFinancialYear(financialYear);
  const [kraRows, setKraRows] = useState([]);
  const [decision, setDecision] = useState('APPROVE');
  const [remarks, setRemarks] = useState('');

  const descriptionEmployee = useMemo(
    () => ({
      empNo: reviewEmpNo,
      employeeName: employee?.employeeName,
      branch: employee?.branch,
      primaryRole: employee?.primaryRole,
      appraiser: employee?.appraiser,
    }),
    [employee, reviewEmpNo]
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['acceptorAppraisal', reviewEmpNo, urlId, parsedFinancialYear, quarter, roleName],
    enabled: Boolean(reviewEmpNo && urlId && parsedFinancialYear),
    queryFn: () =>
      appraisalAPI.getAcceptorAppraisal({
        empNo: reviewEmpNo,
        urlId,
        roleType: roleName,
        roleId,
        zoneName,
        financialYear: parsedFinancialYear,
        appraisalPeriod: appraisalPeriod?.toLowerCase?.() || appraisalPeriod,
        quarter,
        appraisalStatus,
      }),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (isError && error) {
      toast.error(error?.response?.data?.message || 'Failed to load reviewer data');
    }
  }, [isError, error]);

  useEffect(() => {
    if (!data) return;
    const sourceRows = data?.kraData || data?.result?.kraData || data?.result || [];
    setKraRows(normalizeKraRows(sourceRows));
    setDecision(data?.decision || 'APPROVE');
    setRemarks(data?.remarks || '');
  }, [data]);

  const handleRowChange = (rowId, patch) => {
    setKraRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, ...patch } : row)));
  };

  const submitMutation = useMutation({
    mutationFn: (payload) => appraisalAPI.submitAcceptorAppraisal(payload),
    onSuccess: () => {
      toast.success('Reviewer remarks submitted successfully');
      queryClient.invalidateQueries({
        queryKey: ['acceptorAppraisal', reviewEmpNo, urlId, parsedFinancialYear, quarter, roleName],
      });
      navigate(-1);
    },
    onError: (submitError) => {
      toast.error(submitError?.response?.data?.message || 'Failed to submit reviewer remarks');
    },
  });

  const handleSubmit = () => {
    if (!kraRows.length) {
      toast.error('No KRA records available to submit');
      return;
    }

    const payload = {
      id: urlId,
      empNo: reviewEmpNo,
      financialYear: parsedFinancialYear,
      appraisalPeriod,
      quarter,
      decision,
      remarks,
      kraData: kraRows.map((row) => ({
        id: row.kraId || row.id,
        reviewerComment: row.reviewerComment,
        reviewerScore: row.reviewerScore,
      })),
    };

    submitMutation.mutate(payload);
  };

  if (!financialYear || !appraisalPeriod) {
    return <div className="pageWrapper">Missing appraisal context.</div>;
  }

  if (isLoading) {
    return (
      <div className="pageWrapper">
        <div className="pageWrapper-header d-flex flex-row align-items-center">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Reviewer Mode</h1>
        </div>
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: '40vh' }}
        >
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="pageWrapper reviewer-mode">
      <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
        <div className="headline d-flex flex-row align-items-center">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Reviewer Mode</h1>
        </div>
        <h5 className="text-muted fw-bold mb-0">
          {appraisalPeriod} · {financialYear}
        </h5>
      </div>

      <div className="pageWrapper-content d-flex flex-column gap-4">
        <CheckInDescriptionSection employee={descriptionEmployee} dateRange={dateRange} />

        <div className="card shadow-sm p-3">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h5 className="text-primary fw-bold mb-1">KRA Review</h5>
              <p className="text-muted mb-0">
                Compare appraisee & appraiser inputs before adding reviewer remarks.
              </p>
            </div>
            <span className="badge bg-light text-primary fw-semibold">
              {kraRows.length} KRA item{kraRows.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="table-responsive reviewer-kra-table mt-3">
            <table className="table align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{ minWidth: '220px' }}>KRA</th>
                  <th>Appraisee Comment</th>
                  <th>Appraiser Comment</th>
                  <th style={{ minWidth: '260px' }}>Reviewer Comment</th>
                  <th style={{ width: '140px' }}>Reviewer Score</th>
                </tr>
              </thead>
              <tbody>
                {kraRows.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                      No KRA data available for this employee.
                    </td>
                  </tr>
                ) : (
                  kraRows.map((row) => (
                    <tr key={row.id}>
                      <td className="fw-semibold text-primary">{row.title}</td>
                      <td>
                        <div className="mini-comment-box">{row.appraiseeComment || '-'}</div>
                      </td>
                      <td>
                        <div className="mini-comment-box">{row.appraiserComment || '-'}</div>
                      </td>
                      <td>
                        <textarea
                          className="form-control"
                          value={row.reviewerComment}
                          onChange={(event) =>
                            handleRowChange(row.id, { reviewerComment: event.target.value })
                          }
                          placeholder="Add reviewer remarks"
                          maxLength={500}
                        />
                        <div className="text-end text-muted small">
                          {(row.reviewerComment || '').length}/500
                        </div>
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          value={row.reviewerScore}
                          onChange={(event) =>
                            handleRowChange(row.id, { reviewerScore: event.target.value })
                          }
                          min="0"
                          step="0.01"
                          placeholder="Score"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card shadow-sm p-3">
          <h5 className="text-primary fw-bold mb-3">Reviewer Decision</h5>
          <div className="d-flex flex-wrap gap-4">
            <label className="form-check d-flex align-items-center gap-2">
              <input
                type="radio"
                className="form-check-input"
                name="decision"
                checked={decision === 'APPROVE'}
                onChange={() => setDecision('APPROVE')}
              />
              <span>Approve</span>
            </label>
            <label className="form-check d-flex align-items-center gap-2">
              <input
                type="radio"
                className="form-check-input"
                name="decision"
                checked={decision === 'SEND_BACK'}
                onChange={() => setDecision('SEND_BACK')}
              />
              <span>Send Back to Appraiser</span>
            </label>
            <label className="form-check d-flex align-items-center gap-2">
              <input
                type="radio"
                className="form-check-input"
                name="decision"
                checked={decision === 'HOLD'}
                onChange={() => setDecision('HOLD')}
              />
              <span>Keep On Hold</span>
            </label>
          </div>

          <div className="mt-3">
            <label className="form-label fw-semibold">Overall Remarks</label>
            <textarea
              className="form-control"
              rows="4"
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              placeholder="Add consolidated reviewer remarks"
              maxLength={1000}
            />
            <div className="text-end text-muted small">{remarks.length}/1000</div>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-3 mb-4">
          <button className="btn btn-outline-primary" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitMutation.isLoading}
          >
            {submitMutation.isLoading ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewerMode;
