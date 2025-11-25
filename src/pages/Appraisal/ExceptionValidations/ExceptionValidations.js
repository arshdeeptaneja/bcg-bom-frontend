import { BackButton } from '../../../components/common';
import '../ExceptionsList/ExceptionsList.css';
import { ExceptionListTable } from '../../../components/Appraisal';
import LoadingSpinner from '../../../components/Spinner';
import { useExceptionValidations } from '../shared/hooks/useExceptionValidations';

export default function ExceptionValidations() {
  const {
    exceptionListData,
    filterOptions,
    filters,
    isLoading,
    financialYear,
    quarter,
    appraisalPeriod,
    handleFilterChange,
    handleSearch,
    handleClearFilter,
    handleReviewException,
  } = useExceptionValidations();

  if (!financialYear || !appraisalPeriod || !quarter) {
    return <div>No financial year, appraisal period, or quarter found</div>;
  }

  if (isLoading) {
    return (
      <div className="pageWrapper">
        <div className="pageWrapper-header">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
            Employee Quarterly Exception List
          </h1>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="pageWrapper">
      <div className="pageWrapper-header">
        <BackButton />
        <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
          Employee Quarterly Exception List
        </h1>
      </div>

      {/* Filter Panel */}
      <div className="filter-panel mt-4 d-flex align-items-end gap-3">
        {/* Employee Filter */}
        <div className="filter-group">
          <label className="filter-label text-primary fw-semibold">Employee</label>
          <select
            className="form-select filter-select"
            value={filters.employee}
            onChange={(e) => handleFilterChange('employee', e.target.value)}
          >
            <option value="">-Select-</option>
            {filterOptions.employees.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* Primary Role Filter */}
        <div className="filter-group">
          <label className="filter-label text-primary fw-semibold">Primary Role</label>
          <select
            className="form-select filter-select"
            value={filters.primaryRole}
            onChange={(e) => handleFilterChange('primaryRole', e.target.value)}
          >
            <option value="">-Select-</option>
            {filterOptions.primaryRoles.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* Branch Filter */}
        <div className="filter-group">
          <label className="filter-label text-primary fw-semibold">Branch</label>
          <select
            className="form-select filter-select"
            value={filters.branch}
            onChange={(e) => handleFilterChange('branch', e.target.value)}
          >
            <option value="">-Select-</option>
            {filterOptions.branches.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* Exception Status Filter */}
        <div className="filter-group">
          <label className="filter-label text-primary fw-semibold">Exception Status</label>
          <select
            className="form-select filter-select"
            value={filters.exceptionStatus}
            onChange={(e) => handleFilterChange('exceptionStatus', e.target.value)}
          >
            <option value="">-Select-</option>
            {filterOptions.exceptionStatuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="filter-actions d-flex gap-2">
          <button type="button" className="btn btn-primary search-btn" onClick={handleSearch}>
            Search
          </button>
          <button
            type="button"
            className="btn btn-outline-primary clear-filter-btn"
            onClick={handleClearFilter}
          >
            Clear Filter
          </button>
        </div>
      </div>

      <ExceptionListTable
        exceptionListData={exceptionListData}
        onReviewException={handleReviewException}
      />
    </div>
  );
}
