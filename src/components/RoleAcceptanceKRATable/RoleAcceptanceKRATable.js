/**
 * The RoleAcceptanceKRATable component renders a table displaying Key Result Areas (KRAs) with their
 * descriptions, weights, and frequencies along with a total weight calculation.
 * @param props - The `RoleAcceptanceKRATable` component takes in the following props:
 * @returns The `RoleAcceptanceKRATable` component is being returned. It renders a table displaying Key
 * Result Areas (KRAs) with their descriptions, weights, and frequencies. The component receives
 * `kraListData`, `kraTotal`, and `acceptanceKRADetails` as props. It maps over the `kraListData` array
 * to display each KRA item in a table
 */
import React from 'react'
import './RoleAcceptanceKRATable.css'

const RoleAcceptanceKRATable = (props) => {
  const { kraListData, kraTotal, acceptanceKRADetails } = props;

  return (
    <div className="scrollTable">
      <table className="table-primary table-primary-3 table-primary-3--style-3">
        <thead>
          <tr>
            <th className="kra-description">KRAs Description</th>
            <th className="kra-weight p-0">Weight</th>
            <th className="kra-frequency p-0">Frequency</th>
          </tr>
        </thead>
        <tbody>
          {
            kraListData && kraListData.length > 0 ?
              kraListData.map((item) => (
                <tr key={item.KRA_CODE}>
                  <td className="kra-description">
                    {item.KRA_NAME}
                  </td>
                  <td className="kra-weight px-2"><span className="bg-wgt"> {item.KRA_WEIGHT ? item.KRA_WEIGHT : '-'}</span></td>
                  <td className="kra-frequency  px-2">{item.KRA_FREQUENCY ? item.KRA_FREQUENCY : '-'}</td>
                </tr>
              ))
              : []
          }
        </tbody>
        <tfoot>
          <tr className="bg-white">
            <td className="kra-description pt-2">Total</td>
            <td className="kra-weight px-0">{acceptanceKRADetails.kra_total_weight ? acceptanceKRADetails.kra_total_weight : 0}</td>
            <td className="kra-frequency"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default RoleAcceptanceKRATable