import React from "react";
import "./DevelopmentInputs.css";

/**
 * Props:
 * - items: array of { question: string, response?: string }
 * - className: optional wrapper class
 */
export default function DevelopmentInput({ items, className = "" }) {
  const defaultItems = [
    { question: "Highlights of my performance during the year as under", response: "Highlights of my performance during the year as under" },
    { question: "Areas in which I feel I have not done well are as under", response: "Highlights of my performance during the year as under" },
    { question: "Constraints faced", response: "Highlights of my performance during the year as under" },
    { question: "What according to me would enable me to perform better", response: "Highlights of my performance during the year as under" },
    { question: "Outstanding achievements during the year under review, in addition to regular routine assignments", response: "Highlights of my performance during the year as under" },
    { question: "Highlights of my performance during the year as under", response: "Highlights of my performance during the year as under" },
    { question: "Areas in which I feel I have not done well are as under", response: "Highlights of my performance during the year as under" },
    { question: "Constraints faced", response: "Highlights of my performance during the year as under" },
    { question: "What according to me would enable me to perform better", response: "Highlights of my performance during the year as under" },
    { question: "Outstanding achievements during the year under review, in addition to regular routine assignments", response: "Highlights of my performance during the year as under" },
  ];

  const data = [
    {
      kra: "Business Dimension",
      weightage: 70.0,
      reporting: 27.2,
      reviewing: 27.2,
    },
    {
      kra: "Discretionary Measurable KRAs",
      weightage: 10.0,
      reporting: 7.2,
      reviewing: 7.2,
    },
    {
      kra: "Discretionary Non-Measurable KRAs",
      weightage: 20.0,
      reporting: 11.6,
      reviewing: 0.0,
    },
  ];

  const list = Array.isArray(items) && items.length ? items : defaultItems;

  return (
    <>
    <div className={`development-inputs ${className}`}>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="dev-card p-4 rounded-3">

              <div className="dev-list">
                {list.map((it, idx) => (
                  <div key={idx} className="dev-item row mb-4 align-items-start">
                    <div className="col-12">
                      <p className="dev-question mb-2">
                        <span className="dev-index">{idx + 1}.</span>{" "}
                        <span className="dev-question-text">{it.question}</span>
                      </p>

                      <p className="appraisee-label mb-1">Appraisee Response:</p>
                      <p className="appraisee-response mb-0">
                        {it.response || <em className="text-muted">No response provided</em>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>

     
    </div>

     <section className="score-section">
      <h2 className="mb-4 final-score">Final Score Summary</h2>

      <div className="table-responsive">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th>KRAs</th>
              <th className="text-center">Weightage</th>
              <th className="text-center">Reporting Authority</th>
              <th className="text-center">Reviewing Authority</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item, i) => (
              <tr key={i}>
                <td style={{textAlign:"left"}}>{item.kra}</td>
                <td style={{textAlign:"left"}}>{item.weightage}</td>
                <td style={{textAlign:"left"}}>{item.reporting}</td>
                <td style={{textAlign:"left"}}>{item.reviewing}</td>
              </tr>
            ))}

            {/* Penalty Row */}
            <tr>
              <td >Penalty Deduction:</td>
              <td></td>
              <td></td>
              <td></td>
            </tr>

            {/* Total Score Row */}
            <tr className="total-row fw-bold">
              <td>Total Score</td>
              <td style={{textAlign:"left"}}>100.0</td>
              <td style={{textAlign:"left"}}>46.0</td>
              <td style={{textAlign:"left"}}>34.4</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    </>
  );
}
