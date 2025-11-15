import React from "react";
import "./Remark.css";

const RemarkTable = ({ rows = [] }) => {
  return (
    <div className="container-fluid py-4">

      <h5 className="text-primary fw-bold mb-3">Remark</h5>

      {rows.map((item, index) => (
        <div key={index} className="remark-row mb-4">

          {/* Question */}
          <h5 className="fw-bold">
            {index + 1}. {item.question} 
            <span className="text-danger">*</span>
          </h5>

          {/* Labels */}
          <p className="mb-1 text-muted"><i>Appraiser Response:</i></p>

          {/* Response box */}
          <div className="training-box p-3">
            {item.response}
          </div>

        </div>
      ))}

    </div>
  );
};

export default RemarkTable;
