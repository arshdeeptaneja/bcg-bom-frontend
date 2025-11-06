import { BackButton } from '../../../components/common';
import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import './ExceptionsList.css';
import { ExceptionListTable } from '../../../components/Appraisal';

export default function ExceptionsList() {
  const [searchParams] = useSearchParams();
  const financialYear = searchParams.get('financialYear');
  const appraisalPeriod = searchParams.get('appraisalPeriod');
  const quarter = searchParams.get('quarter');

  const exceptionListData = [
    {
      exceptionId: '1',
      employee: { empNo: '123456', name: 'John Doe' },
      exceptionDescription: 'Exception Description',
      preExceptionScore: '100',
      postExceptionScore: '100',
      exceptionStatus: 'Pending',
    },
  ];

  const [filters, setFilters] = useState({
    employee: '',
    primaryRole: '',
    branch: '',
    exceptionStatus: '',
  });

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const handleSearch = () => {
    // TODO: Implement search functionality
    console.log('Search filters:', filters);
  };

  const handleClearFilter = () => {
    setFilters({
      employee: '',
      primaryRole: '',
      branch: '',
      exceptionStatus: '',
    });
  };

  if (!financialYear || !appraisalPeriod || !quarter) {
    return <div>No financial year, appraisal period, or quarter found</div>;
  }

  return (
    <div className="pageWrapper">
      <div className="pageWrapper-header">
        <BackButton />
        <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Exceptions List</h1>
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
            {/* TODO: Populate with actual employee data */}
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
            {/* TODO: Populate with actual role data */}
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
            {/* TODO: Populate with actual branch data */}
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
            {/* TODO: Populate with actual exception status data */}
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

      <ExceptionListTable exceptionListData={exceptionListData} />
    </div>
  );
}
