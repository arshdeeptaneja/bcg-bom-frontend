import React, { useState, useEffect } from 'react';
import { BackButton } from '../../../components/common';
import { useLocation } from 'react-router-dom';
import {CheckInDescriptionSection} from '../../../components/Appraisal';
import KraTable from './KraTable';

function ReviewQuarterlyException() {
    const location = useLocation();

    // ✅ FIXED: role added in destructuring
    // const { financialYear, appraisalPeriod, quarter, dateRange, employee, role } = location.state || {};
    const { financialYear, appraisalPeriod, quarter, dateRange, employee, role } = location.state || {
        financialYear: "2024-2025",
        appraisalPeriod: "Mid-Year",
        quarter: "Q2",
        dateRange: "01 Jul 2024 - 30 Sep 2024",
        employee: { name: "John Doe", id: "EMP123" },
        role: "APPRAISEE",
    };

    const [currentRole, setCurrentRole] = useState(role || 'APPRAISEE');



    const [kraData, setKraData] = useState([]);

 

    



    if (!financialYear || !appraisalPeriod || !quarter) {
        return <div>No financial year, appraisal period, or quarter found</div>;
    }

    return (
        <div className="pageWrapper">
            {/* Header Section */}
            <div className="pageWrapper-header d-flex flex-row justify-content-between align-items-center">
                <div className="headline d-flex flex-row justify-content-between align-items-center">
                    <BackButton />
                    <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">Review Quarterly Exception</h1>
                </div>



            </div>

            {/* Rest of your UI unchanged below */}
            <div className="pageWrapper-content d-flex flex-column m-1 p-3">
                <CheckInDescriptionSection
                    employee={employee}
                    dateRange={dateRange}
                    showDownloadButton={true}
                    onDownload={() => console.log("Download file...")}
                />

                <div className="note mt-5 mb-5">
                    <span className="text-muted">Note: </span>
                    <span className="text-muted">
                        Please raise an exception if actual or target values are incorrect.
                    </span>
                </div>

                <KraTable />

            </div>

        </div>
    );
}

export default ReviewQuarterlyException;
