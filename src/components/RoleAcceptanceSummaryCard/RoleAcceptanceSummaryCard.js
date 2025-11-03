import React from 'react'
import './RoleAcceptanceSummaryCard.css'
const RoleAcceptanceSummaryCard = (props) => {
  const { acceptedRoleSummary } = props;
  let startDate = acceptedRoleSummary && acceptedRoleSummary.length > 0 ? acceptedRoleSummary.ROLE_START_DATE : '';

  // function dateConvert(dateStr) {
  //   if (!dateStr) return "";
  //   // Take only date part (YYYY-MM-DD)
  //   const [year, month, day] = dateStr.split("T")[0].split("-");
  //   // Format manually
  //   const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  //   const shortYear = year.slice(-2);
  //   return `${day.padStart(2, "0")} ${months[month - 1]} ${shortYear}`;
  // }

  function dateConvert(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const options = { day: "2-digit", month: "short", year: "2-digit" };
    return date.toLocaleDateString("en-IN", options).toUpperCase().replace(",", "");
  }

  return (
    <div className="role-summary card">
      {
        acceptedRoleSummary && acceptedRoleSummary.length > 0 ?
          acceptedRoleSummary.map((item) => (
            <>
              <p className="role-primary" title={item.MAIN_ROLE ? item.MAIN_ROLE : ''}>
                {item.MAIN_ROLE ? item.MAIN_ROLE : ''}
              </p>

              <div className="additional-details">
                <div className="detail-item">
                  <img
                    src="http://180.149.245.93/bcg-bom//assets/img/location.svg"
                    alt="location"
                  />
                  <div>
                    <span>Location -</span>
                    <p>{item.ORGANISATION ? item.ORGANISATION : ''}</p>
                  </div>
                </div>

                <div className="detail-item">
                  <img
                    src="http://180.149.245.93/bcg-bom//assets/img/calendar.svg"
                    alt="calendar"
                  />
                  <div>
                    <span>Role Start Date -</span>
                    <p>
                      {item.ROLE_START_DATE ? dateConvert(item.ROLE_START_DATE) : ''}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ))
          :
          []
      }
    </div>
  )
}

export default RoleAcceptanceSummaryCard