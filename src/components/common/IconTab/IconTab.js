import './IconTab.css';

/**
 * Icon tab component with circular icon and text label
 */
export default function IconTab({ icon, label, iconColor, onClick }) {
  return (
    <div 
      className="icon-tab" 
      onClick={onClick} 
      role="button" 
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="icon-tab-icon-wrapper" style={{ backgroundColor: iconColor }}>
        <div className="icon-tab-icon">{icon}</div>
      </div>
      <div className="icon-tab-label">{label}</div>
    </div>
  );
}

