import React, { useState } from 'react';
import { BackButton } from '../../../../components/common';
import { BsCalendar } from 'react-icons/bs';
import './SetConfiguration.css';

const SetConfiguration = () => {
  const [skillAssessmentForm, setSkillAssessmentForm] = useState({
    startDate: '2025-08-15',
    inactiveDate: '2025-08-26',
    scale: '',
    region: '',
    skillAssessmentType: '',
    assessmentName: '',
  });

  const [idpReportForm, setIdpReportForm] = useState({
    startDate: '2025-07-01',
    endDate: '2025-07-31',
    scale: '',
    region: '',
    selectAssessment: '',
  });

  const [smtpAccountForm, setSmtpAccountForm] = useState({
    hostName: '',
    userName: '36663',
    emailId: '',
    emailPassword: '',
    smtpPort: '',
    smtpSecure: '',
  });

  const handleSkillAssessmentChange = (field, value) => {
    setSkillAssessmentForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleIdpReportChange = (field, value) => {
    setIdpReportForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSkillAssessmentSubmit = (e) => {
    e.preventDefault();
    console.log('Skill Assessment Form:', skillAssessmentForm);
    // Handle submit logic
  };

  const handleIdpReportSubmit = (e) => {
    e.preventDefault();
    console.log('IDP Report Form:', idpReportForm);
    // Handle submit logic
  };

  const handleSmtpAccountChange = (field, value) => {
    setSmtpAccountForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSmtpAccountSubmit = (e) => {
    e.preventDefault();
    console.log('SMTP Account Form:', smtpAccountForm);
    // Handle submit logic
  };

  return (
    <div className="pageWrapper">
      {/* Header Section */}
      <div className="pageWrapper-header d-flex align-items-center gap-3 mb-4">
        <BackButton />
        <h1 className="dashboard-title text-primary fw-bold mb-0">Set Configuration</h1>
      </div>

      {/* Set skill assessment start end date Section */}
      <div className="configuration-section mb-4">
        <h2 className="configuration-section-title text-primary mb-4">
          Set skill assessment start end date
        </h2>
        <form onSubmit={handleSkillAssessmentSubmit}>
          <div className="configuration-form">
            <div className="form-field-row">
              <label className="form-field-label">Start Date</label>
              <div className="form-field-input-wrapper">
                <BsCalendar className="form-field-icon" />
                <input
                  type="date"
                  className="form-field-input"
                  value={skillAssessmentForm.startDate}
                  onChange={(e) => handleSkillAssessmentChange('startDate', e.target.value)}
                />
              </div>
            </div>

            <div className="form-field-row">
              <label className="form-field-label">Inactive Date</label>
              <div className="form-field-input-wrapper">
                <BsCalendar className="form-field-icon" />
                <input
                  type="date"
                  className="form-field-input"
                  value={skillAssessmentForm.inactiveDate}
                  onChange={(e) => handleSkillAssessmentChange('inactiveDate', e.target.value)}
                />
              </div>
            </div>

            <div className="form-field-row">
              <label className="form-field-label">Scale</label>
              <input
                type="text"
                className="form-field-input"
                value={skillAssessmentForm.scale}
                onChange={(e) => handleSkillAssessmentChange('scale', e.target.value)}
                placeholder=""
              />
            </div>

            <div className="form-field-row">
              <label className="form-field-label">Region</label>
              <input
                type="text"
                className="form-field-input"
                value={skillAssessmentForm.region}
                onChange={(e) => handleSkillAssessmentChange('region', e.target.value)}
                placeholder=""
                autoFocus
              />
            </div>

            <div className="form-field-row">
              <label className="form-field-label">Skill Assessment Type</label>
              <select
                className="form-field-input form-field-select"
                value={skillAssessmentForm.skillAssessmentType}
                onChange={(e) => handleSkillAssessmentChange('skillAssessmentType', e.target.value)}
              >
                <option value="">--- Select ---</option>
                <option value="type1">Type 1</option>
                <option value="type2">Type 2</option>
                <option value="type3">Type 3</option>
              </select>
            </div>

            <div className="form-field-row">
              <label className="form-field-label">Assessment Name</label>
              <input
                type="text"
                className="form-field-input"
                value={skillAssessmentForm.assessmentName}
                onChange={(e) => handleSkillAssessmentChange('assessmentName', e.target.value)}
                placeholder=""
              />
            </div>

            <div className="form-field-row">
              <button type="submit" className="btn-submit">
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Set IDP report start end date Section */}
      <div className="configuration-section mb-4">
        <h2 className="configuration-section-title text-primary mb-4">
          Set IDP report start end date
        </h2>
        <form onSubmit={handleIdpReportSubmit}>
          <div className="configuration-form">
            <div className="form-field-row">
              <label className="form-field-label">Start Date</label>
              <div className="form-field-input-wrapper">
                <BsCalendar className="form-field-icon" />
                <input
                  type="date"
                  className="form-field-input"
                  value={idpReportForm.startDate}
                  onChange={(e) => handleIdpReportChange('startDate', e.target.value)}
                />
              </div>
            </div>

            <div className="form-field-row">
              <label className="form-field-label">End Date</label>
              <div className="form-field-input-wrapper">
                <BsCalendar className="form-field-icon" />
                <input
                  type="date"
                  className="form-field-input"
                  value={idpReportForm.endDate}
                  onChange={(e) => handleIdpReportChange('endDate', e.target.value)}
                />
              </div>
            </div>

            <div className="form-field-row">
              <label className="form-field-label">Scale</label>
              <input
                type="text"
                className="form-field-input"
                value={idpReportForm.scale}
                onChange={(e) => handleIdpReportChange('scale', e.target.value)}
                placeholder=""
              />
            </div>

            <div className="form-field-row">
              <label className="form-field-label">Region</label>
              <input
                type="text"
                className="form-field-input"
                value={idpReportForm.region}
                onChange={(e) => handleIdpReportChange('region', e.target.value)}
                placeholder=""
              />
            </div>

            <div className="form-field-row">
              <label className="form-field-label">Select Assessment</label>
              <select
                className="form-field-input form-field-select"
                value={idpReportForm.selectAssessment}
                onChange={(e) => handleIdpReportChange('selectAssessment', e.target.value)}
              >
                <option value="">--Select Assessment--</option>
                <option value="assessment1">Assessment 1</option>
                <option value="assessment2">Assessment 2</option>
                <option value="assessment3">Assessment 3</option>
              </select>
            </div>

            <div className="form-field-row">
              <button type="submit" className="btn-submit">
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Set SMTP Account Details Section */}
      <div className="configuration-section">
        <h2 className="configuration-section-title text-primary mb-4">Set SMTP Account Details</h2>
        <form onSubmit={handleSmtpAccountSubmit}>
          <div className="configuration-form">
            <div className="form-field-row">
              <label className="form-field-label">Host Name</label>
              <input
                type="text"
                className="form-field-input"
                value={smtpAccountForm.hostName}
                onChange={(e) => handleSmtpAccountChange('hostName', e.target.value)}
                placeholder=""
              />
            </div>

            <div className="form-field-row">
              <label className="form-field-label">User name</label>
              <input
                type="text"
                className="form-field-input"
                value={smtpAccountForm.userName}
                onChange={(e) => handleSmtpAccountChange('userName', e.target.value)}
                placeholder=""
              />
            </div>

            <div className="form-field-row">
              <label className="form-field-label">Email Id</label>
              <input
                type="email"
                className="form-field-input"
                value={smtpAccountForm.emailId}
                onChange={(e) => handleSmtpAccountChange('emailId', e.target.value)}
                placeholder=""
              />
            </div>

            <div className="form-field-row">
              <label className="form-field-label">Email Password</label>
              <input
                type="password"
                className="form-field-input"
                value={smtpAccountForm.emailPassword}
                onChange={(e) => handleSmtpAccountChange('emailPassword', e.target.value)}
                placeholder=""
              />
            </div>

            <div className="form-field-row">
              <label className="form-field-label">SMTP Port</label>
              <input
                type="text"
                className="form-field-input"
                value={smtpAccountForm.smtpPort}
                onChange={(e) => handleSmtpAccountChange('smtpPort', e.target.value)}
                placeholder=""
              />
            </div>

            <div className="form-field-row">
              <label className="form-field-label">SMTP Secure</label>
              <select
                className="form-field-input form-field-select"
                value={smtpAccountForm.smtpSecure}
                onChange={(e) => handleSmtpAccountChange('smtpSecure', e.target.value)}
              >
                <option value="">-Select-</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="form-field-row">
              <button type="submit" className="btn-submit">
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetConfiguration;
