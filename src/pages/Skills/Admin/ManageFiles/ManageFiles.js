import React, { useState, useMemo } from 'react';
import { BackButton } from '../../../../components/common';
import { FaEye, FaTrash } from 'react-icons/fa';
import { HiChevronUp, HiChevronDown } from 'react-icons/hi2';
import './ManageFiles.css';

// Dummy data matching the image
const dummyFilesData = [
  {
    srno: 1,
    skill: 'Audit Planning & Strategy',
    subSkill: 'Internal control procedures',
    fileName: '679a2c5db9770_PvlgescalationbynonadmininskillprofilerBURPSCREENSHOT.png',
    fileType: 'Image',
    uploadTime: '29-JAN-25 06.55.49.772486 PM',
    uploadBy: '36663',
  },
  {
    srno: 2,
    skill: 'Audit Planning & Strategy',
    subSkill: 'Audit plan creation.',
    fileName: '679a26c4e204e_ErrorHandling.png',
    fileType: 'Image',
    uploadTime: '29-JAN-25 06.55.49.772486 PM',
    uploadBy: '36663',
  },
  {
    srno: 3,
    skill: 'Audit Planning & Strategy',
    subSkill: 'Audit plan creation.',
    fileName: '679a244f99e4f_ErrorHandling.png',
    fileType: 'Image',
    uploadTime: '29-JAN-25 06.55.49.772486 PM',
    uploadBy: '36663',
  },
  {
    srno: 4,
    skill: 'Audit Planning & Strategy',
    subSkill: 'Audit plan creation.',
    fileName: '679a23ca534a2_Pvlgescalationbynonadmininskillprofiler.png',
    fileType: 'Image',
    uploadTime: '29-JAN-25 06.55.49.772486 PM',
    uploadBy: '36663',
  },
  {
    srno: 5,
    skill: 'Audit Planning & Strategy',
    subSkill: 'Audit plan creation.',
    fileName: '679a225f1e185_ErrorHandling.png',
    fileType: 'Image',
    uploadTime: '29-JAN-25 06.55.49.772486 PM',
    uploadBy: '36663',
  },
  {
    srno: 6,
    skill: 'Audit Planning & Strategy',
    subSkill: 'Audit plan creation.',
    fileName: '679a188277df3_Screenshot2025-01-08113419.png',
    fileType: 'Image',
    uploadTime: '29-JAN-25 06.55.49.772486 PM',
    uploadBy: '36663',
  },
];

const ManageFiles = () => {
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedSubSkill, setSelectedSubSkill] = useState('');
  const [selectedFileType, setSelectedFileType] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Mock data - replace with actual API calls
  const skills = ['Audit Planning & Strategy', 'Risk Assessment', 'Compliance Management'];
  const subSkills = ['Internal control procedures', 'Audit plan creation.', 'Risk identification'];
  const fileTypes = ['PDF', 'Image', 'Document'];

  // Filter and sort files based on selections
  const filteredFiles = useMemo(() => {
    let filtered = [...dummyFilesData];

    if (selectedSkill) {
      filtered = filtered.filter((file) => file.skill === selectedSkill);
    }
    if (selectedSubSkill) {
      filtered = filtered.filter((file) => file.subSkill === selectedSubSkill);
    }
    if (selectedFileType) {
      filtered = filtered.filter((file) => file.fileType === selectedFileType);
    }

    // Sorting logic
    if (sortColumn) {
      filtered.sort((a, b) => {
        let aVal = a[sortColumn];
        let bVal = b[sortColumn];

        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        if (sortDirection === 'asc') {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        } else {
          return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
      });
    }

    return filtered;
  }, [selectedSkill, selectedSubSkill, selectedFileType, sortColumn, sortDirection]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleView = (file) => {
    console.log('View file:', file);
    // Handle view logic
  };

  const handleDelete = (file) => {
    console.log('Delete file:', file);
    // Handle delete logic
  };

  const handleUploadImages = () => {
    // Handle file upload logic
    console.log('Upload images clicked');
  };

  const shouldShowTable = selectedSkill && selectedSubSkill;

  return (
    <div className="pageWrapper">
      <div className="pageWrapper-header d-flex align-items-center gap-3 mb-4">
        <BackButton />
        <h1 className="dashboard-title text-primary fw-bold mb-0">Manage Files</h1>
      </div>

      {/* Filter Bar */}
      <div className="manage-files-filter-bar d-flex align-items-center gap-3 mb-4 flex-wrap">
        <div className="filter-group">
          <select
            className="form-select manage-files-select"
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
          >
            <option value="">Select skill</option>
            {skills.map((skill, index) => (
              <option key={index} value={skill}>
                {skill}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select
            className="form-select manage-files-select"
            value={selectedSubSkill}
            onChange={(e) => setSelectedSubSkill(e.target.value)}
            disabled={!selectedSkill}
          >
            <option value="">Select sub skill</option>
            {subSkills.map((subSkill, index) => (
              <option key={index} value={subSkill}>
                {subSkill}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select
            className="form-select manage-files-select"
            value={selectedFileType}
            onChange={(e) => setSelectedFileType(e.target.value)}
            disabled={!selectedSkill || !selectedSubSkill}
          >
            <option value="">Select file type</option>
            {fileTypes.map((fileType, index) => (
              <option key={index} value={fileType}>
                {fileType}
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn btn-white manage-files-upload-btn"
          onClick={handleUploadImages}
          disabled={!selectedSkill || !selectedSubSkill}
        >
          Upload images
        </button>
      </div>

      {/* Table Section */}
      <div className="manage-files-table-container">
        <table className="table-primary manage-files-table">
          <thead>
            <tr>
              <th className="sortable-header" onClick={() => handleSort('srno')}>
                <div className="header-content">
                  srno
                  <span className="sort-icons">
                    <HiChevronUp
                      className={sortColumn === 'srno' && sortDirection === 'asc' ? 'active' : ''}
                    />
                    <HiChevronDown
                      className={sortColumn === 'srno' && sortDirection === 'desc' ? 'active' : ''}
                    />
                  </span>
                </div>
              </th>
              <th className="sortable-header" onClick={() => handleSort('skill')}>
                <div className="header-content">
                  Skill
                  <span className="sort-icons">
                    <HiChevronUp
                      className={sortColumn === 'skill' && sortDirection === 'asc' ? 'active' : ''}
                    />
                    <HiChevronDown
                      className={sortColumn === 'skill' && sortDirection === 'desc' ? 'active' : ''}
                    />
                  </span>
                </div>
              </th>
              <th className="sortable-header" onClick={() => handleSort('subSkill')}>
                <div className="header-content">
                  Sub Skill
                  <span className="sort-icons">
                    <HiChevronUp
                      className={
                        sortColumn === 'subSkill' && sortDirection === 'asc' ? 'active' : ''
                      }
                    />
                    <HiChevronDown
                      className={
                        sortColumn === 'subSkill' && sortDirection === 'desc' ? 'active' : ''
                      }
                    />
                  </span>
                </div>
              </th>
              <th className="sortable-header" onClick={() => handleSort('fileName')}>
                <div className="header-content">
                  File Name
                  <span className="sort-icons">
                    <HiChevronUp
                      className={
                        sortColumn === 'fileName' && sortDirection === 'asc' ? 'active' : ''
                      }
                    />
                    <HiChevronDown
                      className={
                        sortColumn === 'fileName' && sortDirection === 'desc' ? 'active' : ''
                      }
                    />
                  </span>
                </div>
              </th>
              <th className="sortable-header" onClick={() => handleSort('fileType')}>
                <div className="header-content">
                  File Type
                  <span className="sort-icons">
                    <HiChevronUp
                      className={
                        sortColumn === 'fileType' && sortDirection === 'asc' ? 'active' : ''
                      }
                    />
                    <HiChevronDown
                      className={
                        sortColumn === 'fileType' && sortDirection === 'desc' ? 'active' : ''
                      }
                    />
                  </span>
                </div>
              </th>
              <th className="sortable-header" onClick={() => handleSort('uploadTime')}>
                <div className="header-content">
                  Upload Time
                  <span className="sort-icons">
                    <HiChevronUp
                      className={
                        sortColumn === 'uploadTime' && sortDirection === 'asc' ? 'active' : ''
                      }
                    />
                    <HiChevronDown
                      className={
                        sortColumn === 'uploadTime' && sortDirection === 'desc' ? 'active' : ''
                      }
                    />
                  </span>
                </div>
              </th>
              <th className="sortable-header" onClick={() => handleSort('uploadBy')}>
                <div className="header-content">
                  Upload By
                  <span className="sort-icons">
                    <HiChevronUp
                      className={
                        sortColumn === 'uploadBy' && sortDirection === 'asc' ? 'active' : ''
                      }
                    />
                    <HiChevronDown
                      className={
                        sortColumn === 'uploadBy' && sortDirection === 'desc' ? 'active' : ''
                      }
                    />
                  </span>
                </div>
              </th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className="manage-files-table-body text-center">
            {shouldShowTable && filteredFiles.length > 0 ? (
              filteredFiles.map((file, index) => (
                <tr key={file.srno || index} className="text-center">
                  <td className="text-center">{file.srno}</td>
                  <td className="text-center">{file.skill}</td>
                  <td className="text-center">{file.subSkill}</td>
                  <td className="text-center">{file.fileName}</td>
                  <td className="text-center">{file.fileType}</td>
                  <td className="text-center">{file.uploadTime}</td>
                  <td className="text-center">{file.uploadBy}</td>
                  <td className="text-center">
                    <div className="action-buttons">
                      <button
                        className="action-btn view-btn"
                        onClick={() => handleView(file)}
                        title="View"
                      >
                        <FaEye />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(file)}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center manage-files-empty-message">
                  Please select skill and sub-skill.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageFiles;
