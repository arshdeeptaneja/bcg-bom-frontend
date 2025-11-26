/**
 * The RoleAcceptanceSummaryCard component displays a summary of accepted roles with main role,
 * location, and start date details.
 * @param props - The `RoleAcceptanceSummaryCard` component takes a prop called `acceptedRoleSummary`,
 * which is an array of objects containing information about accepted roles. Each object in the array
 * should have the following properties:
 * @returns The `RoleAcceptanceSummaryCard` component is being returned. It renders a card with role
 * acceptance summary details including main role, location, and role start date for each accepted role
 * in the `acceptedRoleSummary` array. The `dateConvert` function is used to format the role start
 * date.
 */
import React from 'react'
import './RoleAcceptanceSummaryCard.css'



const RoleAcceptanceSummaryCard = (props) => {
  const { acceptedRoleSummary } = props;
  let startDate = acceptedRoleSummary && acceptedRoleSummary.length > 0 ? acceptedRoleSummary.ROLE_START_DATE : '';


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