/**
 * This component shows the Appraisal Accordion
 * @param {Object[]} accordionItems - List of Accordion Items. Each item must contain:
 *    @param {string} item.heading - The heading/title of the accordion section.
 *    @param {number} item.pendingCount - The number of pending items for this section.
 *    @param {Object[]} item.tableData - Optional array of table rows. Each row should have:
 * @param {string[]} columns - Optional array of column names containing:
 * @returns
 */
export default function AppraisalAccordion({ accordionItems = [], columns = [] }) {
  return (
    <div className="accordion" id="appraisalAccordion">
      {accordionItems.map((item, index) => {
        return (
          <div className="accordion-item border-0 mb-2" key={item.id ?? index}>
            <h2 className="accordion-header" id={`heading-${index}`}>
              <button
                className="accordion-button collapsed fw-bold d-flex justify-content-between align-items-center w-100"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#collapse-${index}`}
                aria-expanded="false"
                aria-controls={`collapse-${index}`}
              >
                <div className="d-flex flex-row justify-content-between align-items-center w-100 px-3">
                  <span>{item.heading}</span>
                  <span className="fw-semibold">
                    {item.pendingCount != null ? `Pending ${item.pendingCount}` : ''}
                  </span>
                </div>
              </button>
            </h2>
            <div
              id={`collapse-${index}`}
              className="accordion-collapse collapse"
              aria-labelledby={`heading-${index}`}
              data-bs-parent="#appraisalAccordion"
            >
              <div className="accordion-body">
                {columns && columns.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead className="table-primary">
                        <tr>
                          {columns.map((column) => (
                            <th className="text-center" key={column}>
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="text-center">
                        {item.tableData.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {columns.map((column) => (
                              <td key={column}>{row[column] ?? '-'}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted">No score data available.</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
