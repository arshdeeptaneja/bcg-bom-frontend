import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { CheckInDescriptionSection } from '../../../../components/Appraisal';
import LoadingSpinner from '../../../../components/Spinner';
import { appraisalAPI } from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { BackButton } from '../../../../components/common';
import './AppealCommitteeReview.css';

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
    originalScore: item.originalScore ?? item.appraiserScore ?? '',
    appealedScore: item.appealedScore ?? item.requestedScore ?? '',
    appraiseeComment: item.appraiseeComment ?? item.selfComment ?? '',
    appraiserComment: item.appraiserComment ?? '',
    appealReason: item.appealReason ?? item.appealComment ?? '',
    committeeScore: item.committeeScore ?? '',
    committeeComment: item.committeeComment ?? '',
  }));
};

function AppealCommitteeReview() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { getEmployeeDetails, getUserProperty } = useAuth();
  const employeeDetails = getEmployeeDetails();
  const loggedInEmpNo = getUserProperty('empNo', employeeDetails?.currentUser?.EMP_ID || '');

  const {
    custTicketId = '',
    financialYear = 'FY 2024-25',
    appraisalPeriod = 'Quarterly',
    quarter = 'Q1',
    dateRange = '',
    startDate = '',
    endDate = '',
    employee = {
      empNo: '',
      employeeName: 'Employee Name',
      branch: 'Branch',
      primaryRole: 'Primary Role',
      appraiser: 'Appraiser',
    },
    reportingAuthorityNo = '',
    roleId = '',
    roleType = 'EMP',
    preAppealScore = '',
    postAppealScore = '',
  } = location.state || {};

  const reviewEmpNo = employee?.empNo || '';
  const parsedFinancialYear = parseFinancialYear(financialYear);

  const [kraRows, setKraRows] = useState([]);
  const [committeeStatus, setCommitteeStatus] = useState('');
  const [member3Comment, setMember3Comment] = useState('');
  const [declarationOption, setDeclarationOption] = useState('');

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

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['appealCommitteeReview', roleId, roleType, reviewEmpNo, parsedFinancialYear],
    enabled: Boolean(reviewEmpNo && parsedFinancialYear && roleId),
    queryFn: () =>
      appraisalAPI.getAppealCommitteeReviewData({
        roleId,
        roleType,
        empNo: reviewEmpNo,
        financialYear: parsedFinancialYear,
      }),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (isError && error) {
      toast.error(error?.response?.data?.message || 'Failed to load appeal data');
    }
  }, [isError, error]);

  useEffect(() => {
    if (!data) return;
    const sourceRows = data?.kraData || data?.result?.kraData || data?.result || [];
    setKraRows(normalizeKraRows(sourceRows));
    setCommitteeStatus(data?.committeeStatus || '');
    setMember3Comment(data?.member3Comment || '');
    setDeclarationOption(data?.declarationOption || '');
  }, [data]);

  const handleRowChange = (rowId, patch) => {
    setKraRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, ...patch } : row)));
  };

  const submitMutation = useMutation({
    mutationFn: (payload) => appraisalAPI.submitAppealCommitteeReview(payload),
    onSuccess: () => {
      toast.success('Appeal committee review submitted successfully');
      queryClient.invalidateQueries({
        queryKey: ['appealCommitteeReview', roleId, roleType, reviewEmpNo, parsedFinancialYear],
      });
      navigate(-1);
    },
    onError: (submitError) => {
      toast.error(submitError?.response?.data?.message || 'Failed to submit committee review');
    },
  });

  const handleSubmit = () => {
    if (!committeeStatus) {
      toast.warning('Please select a committee decision');
      return;
    }

    if (!member3Comment.trim()) {
      toast.warning('Please provide committee remarks');
      return;
    }

    if (!declarationOption) {
      toast.warning('Please confirm the declaration');
      return;
    }

    const payload = {
      custTicketId: custTicketId || data?.custTicketId || '',
      financialYear: parseInt(parsedFinancialYear, 10) || parsedFinancialYear,
      empNo: reviewEmpNo,
      quarter,
      startDate: startDate || data?.startDate || '',
      endDate: endDate || data?.endDate || '',
      reportingAuthorityNo: reportingAuthorityNo || data?.reportingAuthorityNo || '',
      kraData: kraRows.map((row) => ({
        kraId: row.kraId || row.id,
        originalScore: row.originalScore,
        appealedScore: row.appealedScore,
        committeeScore: row.committeeScore,
        committeeComment: row.committeeComment,
      })),
      declarationOption,
      committeeStatus,
      member3Comment,
    };

    submitMutation.mutate(payload);
  };

  if (!financialYear || !quarter) {
    return <div className="pageWrapper">Missing appeal context. Please navigate from the appeal list.</div>;
  }

  if (isLoading) {
    return (
      <div className="pageWrapper">
        <div className="pageWrapper-header d-flex flex-row align-items-center">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Appeal Committee Review</h1>
        </div>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '40vh' }}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="pageWrapper appeal-committee-review">
      <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
        <div className="headline d-flex flex-row align-items-center">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Appeal Committee Review</h1>
        </div>
        <h5 className="text-muted fw-bold mb-0">
          {appraisalPeriod} · {quarter} · {financialYear}
        </h5>
      </div>

      <div className="pageWrapper-content d-flex flex-column gap-4">
        <CheckInDescriptionSection employee={descriptionEmployee} dateRange={dateRange} />

        {/* Appeal Summary Card */}
        <div className="card shadow-sm p-3">
          <h5 className="text-primary fw-bold mb-3">Appeal Summary</h5>
          <div className="row">
            <div className="col-md-4">
              <div className="mb-2">
                <span className="fw-semibold">Ticket ID:</span>{' '}
                <span className="text-muted">{custTicketId || data?.custTicketId || 'N/A'}</span>
              </div>
            </div>
            <div className="col-md-4">
              <div className="mb-2">
                <span className="fw-semibold">Pre-Appeal Score:</span>{' '}
                <span className="text-danger">{preAppealScore || data?.preAppealScore || 'N/A'}</span>
              </div>
            </div>
            <div className="col-md-4">
              <div className="mb-2">
                <span className="fw-semibold">Requested Score:</span>{' '}
                <span className="text-success">{postAppealScore || data?.postAppealScore || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* KRA Review Table */}
        <div className="card shadow-sm p-3">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h5 className="text-primary fw-bold mb-1">KRA Appeal Review</h5>
              <p className="text-muted mb-0">Review the original scores, appealed scores, and provide committee assessment.</p>
            </div>
            <span className="badge bg-light text-primary fw-semibold">
              {kraRows.length} KRA item{kraRows.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="table-responsive appeal-kra-table mt-3">
            <table className="table align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{ minWidth: '180px' }}>KRA</th>
                  <th style={{ width: '100px' }}>Original Score</th>
                  <th style={{ width: '100px' }}>Appealed Score</th>
                  <th>Appeal Reason</th>
                  <th style={{ width: '120px' }}>Committee Score</th>
                  <th style={{ minWidth: '220px' }}>Committee Comment</th>
                </tr>
              </thead>
              <tbody>
                {kraRows.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      No KRA data available for this appeal.
                    </td>
                  </tr>
                ) : (
                  kraRows.map((row) => (
                    <tr key={row.id}>
                      <td className="fw-semibold text-primary">{row.title}</td>
                      <td className="text-center">
                        <span className="badge bg-secondary">{row.originalScore || '-'}</span>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-info">{row.appealedScore || '-'}</span>
                      </td>
                      <td>
                        <div className="mini-comment-box">{row.appealReason || '-'}</div>
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={row.committeeScore}
                          onChange={(event) =>
                            handleRowChange(row.id, { committeeScore: event.target.value })
                          }
                          min="0"
                          max="5"
                          step="0.1"
                          placeholder="Score"
                        />
                      </td>
                      <td>
                        <textarea
                          className="form-control form-control-sm"
                          rows="2"
                          value={row.committeeComment}
                          onChange={(event) =>
                            handleRowChange(row.id, { committeeComment: event.target.value })
                          }
                          placeholder="Committee remarks"
                          maxLength={300}
                        />
                        <div className="text-end text-muted small">
                          {(row.committeeComment || '').length}/300
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Committee Decision */}
        <div className="card shadow-sm p-3">
          <h5 className="text-primary fw-bold mb-3">Committee Decision</h5>
          <div className="d-flex flex-wrap gap-4 mb-3">
            <label className="form-check d-flex align-items-center gap-2">
              <input
                type="radio"
                className="form-check-input"
                name="committeeStatus"
                checked={committeeStatus === 'APPROVED'}
                onChange={() => setCommitteeStatus('APPROVED')}
              />
              <span className="text-success fw-semibold">Approve Appeal</span>
            </label>
            <label className="form-check d-flex align-items-center gap-2">
              <input
                type="radio"
                className="form-check-input"
                name="committeeStatus"
                checked={committeeStatus === 'REJECTED'}
                onChange={() => setCommitteeStatus('REJECTED')}
              />
              <span className="text-danger fw-semibold">Reject Appeal</span>
            </label>
            <label className="form-check d-flex align-items-center gap-2">
              <input
                type="radio"
                className="form-check-input"
                name="committeeStatus"
                checked={committeeStatus === 'PARTIALLY_APPROVED'}
                onChange={() => setCommitteeStatus('PARTIALLY_APPROVED')}
              />
              <span className="text-warning fw-semibold">Partially Approve</span>
            </label>
            <label className="form-check d-flex align-items-center gap-2">
              <input
                type="radio"
                className="form-check-input"
                name="committeeStatus"
                checked={committeeStatus === 'SEND_BACK'}
                onChange={() => setCommitteeStatus('SEND_BACK')}
              />
              <span className="text-info fw-semibold">Send Back for Review</span>
            </label>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Committee Remarks (Member 3)</label>
            <textarea
              className="form-control"
              rows="4"
              value={member3Comment}
              onChange={(event) => setMember3Comment(event.target.value)}
              placeholder="Provide detailed justification for the committee's decision"
              maxLength={1000}
            />
            <div className="text-end text-muted small">{member3Comment.length}/1000</div>
          </div>

          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="declarationCheck"
              checked={declarationOption === 'CONFIRMED'}
              onChange={(event) =>
                setDeclarationOption(event.target.checked ? 'CONFIRMED' : '')
              }
            />
            <label className="form-check-label" htmlFor="declarationCheck">
              I confirm that this decision has been reviewed and approved by the appeal committee members.
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex justify-content-end gap-3 mb-4">
          <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? 'Submitting...' : 'Submit Committee Decision'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AppealCommitteeReview;
