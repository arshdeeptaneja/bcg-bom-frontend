/**
 * The RoleScoreSummaryCard component displays a summary of KRA scores including measurable,
 * non-measurable, discretionary KRAs, and the total score.
 * @param props - The `RoleScoreSummaryCard` component receives a prop called
 * `acceptedRoleSummaryList`, which is an object containing information about the role score summary.
 * The component extracts specific values from this object such as "Total Non measurable KRAs Score"
 * and "Total Score" to display in the table.
 * @returns The `RoleScoreSummaryCard` component is being returned. It displays a table with KRA (Key
 * Result Area) score summary information such as Total Measurable KRAs, Total Discretionary KRAs, and
 * the Total Score. The data for Total Measurable KRAs and Total Discretionary KRAs are hardcoded as
 * '70' and '30' respectively. The component receives `acceptedRole
 */
import React from 'react';
import './RoleScoreSummaryCard.css'

const RoleScoreSummaryCard = (props) => {
  const { acceptedRoleSummaryList } = props;

  // const {
  //   // "Total Measurable KRAs Score": totalMeasurable,
  //   // "Total Non measurable KRAs Score": totalNonMeasurable,
  //   // "Total Discretionary KRAs Score": totalDiscretionary,

  //   "Total Measurable KRAs Score": totalMeasurableData,
  //   "Total Non measurable KRAs Score": totalNonMeasurable,
  //   "Total Discretionary KRAs Score": totalDiscretionary,
  //   "Total Score": total
  // } = acceptedRoleSummaryList || {};

const totalMeasurable = '70';
const totalDiscretionary = '30';

const {
    "Total Non measurable KRAs Score": totalNonMeasurable,
    "Total Score": total
} = acceptedRoleSummaryList || {};

  return (
    <div className="table-responsive">
      <table className="table  text-center ">
        <thead className="table-primary">
          <tr>
            <th className="text-start">KRA Score Summary</th>
            <th className='text-center'>Wgt</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="text-start">Total Measurable KRAs</td>
            <td className="text-center">{totalMeasurable}</td>
          </tr>
          <tr>
            <td className="text-start">Total Discretionary KRAs</td>
            <td className="text-center">{totalDiscretionary}</td>
          </tr>
        </tbody>
        <tfoot className='role-table-footer bg-primary' >
          <tr className="fw-bold bg-primary">
            <td className="text-start">Total</td>
            <td>{total}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default RoleScoreSummaryCard;
