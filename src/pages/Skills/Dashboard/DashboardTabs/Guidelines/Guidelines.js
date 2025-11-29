import React from 'react';
import { FaHandPointer, FaSearch, FaList, FaFileAlt } from 'react-icons/fa';
import './Guidelines.css';

const Guidelines = ({ onNext }) => {
  const steps = [
    {
      id: 'select-skills',
      label: 'Select Skills',
      icon: <FaHandPointer />,
    },
    {
      id: 'know-assessment',
      label: 'Know Your Assessment',
      icon: <FaSearch />,
    },
    {
      id: 'track-status',
      label: 'Track Your Status',
      icon: <FaList />,
    },
    {
      id: 'prerequisites',
      label: 'Prerequisites for starting the test',
      icon: <FaFileAlt />,
    },
  ];

  return (
    <div className="guidelines-container">
      {/* Left Section */}
      <div className="guidelines-left-section">
        <div className="guidelines-title-wrapper">
          <h1 className="guidelines-title">Skill Assessment Guidelines</h1>
        </div>
        <div className="guidelines-image-placeholder">{/* Placeholder for image */}</div>
      </div>

      {/* Right Section */}
      <div className="guidelines-right-section">
        {/* Static Icons */}
        <div className="guidelines-progress-indicator">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="progress-step">
                <div className="progress-step-icon">{step.icon}</div>
                <div className="progress-step-label">{step.label}</div>
              </div>
              {index < steps.length - 1 && <div className="progress-step-connector"></div>}
            </React.Fragment>
          ))}
        </div>

        {/* Guidelines Content */}
        <div className="guidelines-content">
          <p className="guidelines-text">
            The preliminary recommendation of the skills will be made by the tool based on your job
            family (experience-based skills).
          </p>
          <p className="guidelines-text">
            Considering your prior experience, you are requested to pick up your most proficient
            skills for assessment
          </p>
          <p className="guidelines-text">
            On the following page, you can select a minimum of 0 skill and maximum of two skills
            that you are interested in evaluating (interest-based skills).
          </p>
          <button className="primary-button" onClick={onNext}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Guidelines;
