import React, { useState, useMemo } from 'react';
import { BackButton } from '../../../../components/common';
import { BiSearch } from 'react-icons/bi';
import { FaDownload } from 'react-icons/fa';
import './GenerateIDPs.css';

// Dummy data matching the image
const dummyEmployeeData = [
  {
    sNo: 1,
    pfId: '37961',
    employeeName: 'MADAN MOHAN KHUNTIA',
    scale: '5',
    office: 'Retail',
    vertical: 'CHENNAI-ADYAR',
    region: 'REGIONAL OFFICE-CHENNAI-II',
    progress: 'IN PROGRESS',
  },
  {
    sNo: 2,
    pfId: '39046',
    employeeName: 'PRIYANKA PANDEY',
    scale: '3',
    office: 'Retail',
    vertical: 'CHENNAI-ADYAR',
    region: 'REGIONAL OFFICE-CHENNAI-II',
    progress: 'IN PROGRESS',
  },
  {
    sNo: 3,
    pfId: '57000',
    employeeName: 'NARESH KUMAR',
    scale: '1',
    office: 'Retail',
    vertical: 'AMRITSAR',
    region: 'REGIONAL OFFICE-LUDHIANA',
    progress: 'IN PROGRESS',
  },
  {
    sNo: 4,
    pfId: '51915',
    employeeName: 'PARTEEK SINGH',
    scale: '1',
    office: 'Retail',
    vertical: 'AMRITSAR',
    region: 'REGIONAL OFFICE-LUDHIANA',
    progress: 'IN PROGRESS',
  },
  {
    sNo: 5,
    pfId: '58988',
    employeeName: 'ALISHETTI RAJENDRA PRASAD',
    scale: '1',
    office: 'Retail',
    vertical: 'CHENNAI-AVADI',
    region: 'REGIONAL OFFICE-CHENNAI-II',
    progress: 'IN PROGRESS',
  },
  {
    sNo: 6,
    pfId: '64612',
    employeeName: 'ESAIYARASI M',
    scale: '1',
    office: 'Retail',
    vertical: 'CHENNAI-AYANAVARAM',
    region: 'REGIONAL OFFICE-CHENNAI-II',
    progress: 'IN PROGRESS',
  },
];

const GenerateIDPs = () => {
  const [searchPfId, setSearchPfId] = useState('');
  const [selectValue, setSelectValue] = useState('');

  // Filter employees based on search
  const filteredEmployees = useMemo(() => {
    let filtered = [...dummyEmployeeData];

    if (searchPfId) {
      filtered = filtered.filter((emp) =>
        emp.pfId.toLowerCase().includes(searchPfId.toLowerCase())
      );
    }

    if (selectValue) {
      // Add filter logic based on selectValue if needed
    }

    return filtered;
  }, [searchPfId, selectValue]);

  const handleDownload = (employee) => {
    console.log('Download for employee:', employee);
    // Handle download logic
  };

  return (
    <div className="pageWrapper">
      {/* Header Section */}
      <div className="generate-idps-header d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <BackButton />
          <h1 className="dashboard-title text-primary fw-bold mb-0">Detailed list of employees</h1>
        </div>
        <div className="row w-100 m-0">
          <div className="col-auto px-0">
            <div className="position-relative search-container">
              <BiSearch className="header-search-icon" />
              <input
                type="text"
                className="form-control header-search-input"
                placeholder="Q Search by PF ID"
                value={searchPfId}
                onChange={(e) => setSearchPfId(e.target.value)}
              />
            </div>
          </div>
          <div className="col-auto px-0">
            <select
              className="form-select header-select"
              value={selectValue}
              onChange={(e) => setSelectValue(e.target.value)}
            >
              <option value="">--Select--</option>
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="generate-idps-table-container">
        <table className="table-primary generate-idps-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>PF Id</th>
              <th>Employee name</th>
              <th>Scale</th>
              <th>Office</th>
              <th>Vertical</th>
              <th>Region</th>
              <th>Progress</th>
              <th>Download</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <tr key={employee.sNo}>
                  <td>{employee.sNo}</td>
                  <td>{employee.pfId}</td>
                  <td>{employee.employeeName}</td>
                  <td>{employee.scale}</td>
                  <td>{employee.office}</td>
                  <td>{employee.vertical}</td>
                  <td>{employee.region}</td>
                  <td className="text-center">
                    <span className="progress-badge">{employee.progress}</span>
                  </td>
                  <td className="text-center">
                    <button
                      className="btn-download"
                      onClick={() => handleDownload(employee)}
                      title="Download"
                    >
                      <FaDownload />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center generate-idps-empty-message">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GenerateIDPs;
