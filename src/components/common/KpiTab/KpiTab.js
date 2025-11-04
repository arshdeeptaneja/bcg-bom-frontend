import './KpiTab.css';

/**
 * KPI Tab component.
 * @param {Object} props - Component props.
 * @param {string} props.heading - The heading text for the tab.
 * @param {function} [props.onClick] - Click handler for the tab.
 * @param {Object} [props.kpiData] - Data to display in the KPI tab.
 * @returns {JSX.Element}
 */
export default function KpiTab({ heading, kpiData = [], onClick }) {
  return (
    <div className="kpi-tab" onClick={onClick} role="button" tabIndex={0}>
      <div className="kpi-tab-content">
        <h3 className="kpi-tab-heading">{heading}</h3>
        <div className="kpi-tab-data">
          {kpiData.map((kpi) => (
            <div className="kpi-tab-data-item" key={kpi.id ?? kpi.label}>
              <span className="kpi-tab-value">{kpi.value}</span>
              <span className="kpi-tab-label">{kpi.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="kpi-tab-cta">
        <span>View Details</span>
        <span className="kpi-tab-arrow">&rarr;</span>
      </div>
    </div>
  );
}
