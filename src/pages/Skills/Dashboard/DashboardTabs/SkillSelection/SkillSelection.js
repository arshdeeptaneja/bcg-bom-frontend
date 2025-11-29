import React, { useState } from 'react';
import './SkillSelection.css';

// Dummy skills data matching the image
const skillsData = [
  { id: 1, name: 'Agri-Banking and Financial Inclusion', status: 'unselected' },
  { id: 2, name: 'Audit Planning & Strategy', status: 'completed' },
  { id: 3, name: 'Branch & Centralized Operations', status: 'unselected' },
  { id: 4, name: 'Brand Marketing & Communication', status: 'unselected' },
  { id: 5, name: 'Business Strategy & Planning', status: 'unselected' },
  { id: 6, name: 'Collections & Capital Recovery', status: 'unselected' },
  { id: 7, name: 'Corporate Banking', status: 'unselected' },
  { id: 8, name: 'Credit Underwriting & Monitoring', status: 'completed' },
  { id: 9, name: 'Customer Sales, Service and Experience', status: 'unselected' },
  { id: 10, name: 'Cybersecurity', status: 'completed' },
  { id: 11, name: 'Data Analytics, MIS & Reporting', status: 'unselected' },
  { id: 12, name: 'Digital Banking Journeys & Channels', status: 'unselected' },
  { id: 13, name: 'Finance & Accounting', status: 'unselected' },
  { id: 14, name: 'Learning & Development', status: 'unselected' },
  { id: 15, name: 'MSME Banking', status: 'unselected' },
  { id: 16, name: 'New Age IT', status: 'unselected' },
  { id: 17, name: 'New Skill', status: 'unselected' },
  { id: 18, name: 'Regulatory & Legal Compliances', status: 'completed' },
  { id: 19, name: 'Retail, HNI & NRI Banking', status: 'in-progress' },
  { id: 20, name: 'Strategic HR', status: 'unselected' },
  { id: 21, name: 'Strategic Risk Management', status: 'completed' },
  { id: 22, name: 'Traditional IT', status: 'unselected' },
  { id: 23, name: 'Treasury, Forex and International Banking', status: 'unselected' },
];

const SkillSelection = () => {
  const [skills, setSkills] = useState(skillsData);

  const handleSkillClick = (skillId) => {
    setSkills((prevSkills) =>
      prevSkills.map((skill) => {
        if (skill.id === skillId) {
          // Toggle between unselected and user-selected
          // Don't allow toggling completed or pre-selected skills
          if (skill.status === 'completed' || skill.status === 'pre-selected') {
            return skill;
          }
          return {
            ...skill,
            status: skill.status === 'unselected' ? 'user-selected' : 'unselected',
          };
        }
        return skill;
      })
    );
  };

  const getSkillClassName = (status) => {
    switch (status) {
      case 'completed':
        return 'skill-box completed';
      case 'user-selected':
        return 'skill-box selected';
      case 'pre-selected':
        return 'skill-box pre-selected';
      case 'in-progress':
        return 'skill-box in-progress';
      default:
        return 'skill-box unselected';
    }
  };

  return (
    <div className="skill-selection-container">
      {/* Instructions */}
      <div className="skill-selection-instructions">
        <h2 className="instruction-title">
          Select additional skills based on your interest / experience.
        </h2>
        <p className="instruction-text">
          The pre-selected skills (if any) are suggested based on your Job Family. You can add more
          skills based on you knowledge / experience / interest.
        </p>
      </div>

      {/* Skills Grid */}
      <div className="skills-grid">
        {skills.map((skill) => (
          <div
            key={skill.id}
            className={getSkillClassName(skill.status)}
            onClick={() => handleSkillClick(skill.id)}
          >
            {skill.name}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="skill-selection-legend">
        <div className="legend-item">
          <div className="legend-icon completed"></div>
          <span className="legend-label">Completed</span>
        </div>
        <div className="legend-item">
          <div className="legend-icon selected"></div>
          <span className="legend-label">Selected</span>
        </div>
        <div className="legend-item">
          <div className="legend-icon in-progress"></div>
          <span className="legend-label">In Progress</span>
        </div>
      </div>
    </div>
  );
};

export default SkillSelection;
