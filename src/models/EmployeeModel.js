/**
 * User model for the employee
 * @param {Object} props - The user properties.
 * @param {string} props.empNo - The employee number.
 * @param {string} props.employeeName - The employee name.
 * @param {string} props.employeeScale - The employee scale.
 * @param {string} props.roles - The employee roles.
 * @param {string} props.appraiser - The employee appraiser.
 */
export default class User {
  constructor({ empNo, employeeName, employeeScale, additionalRoles, appraiser, primaryRole }) {
    this.empNo = empNo;
    this.employeeName = employeeName;
    this.employeeScale = employeeScale;
    this.additionalRoles = additionalRoles;
    this.appraiser = appraiser;
    this.primaryRole = primaryRole;
  }

  getFirstName() {
    return this.name?.split(' ')[0] || 'User';
  }

  getAppraiserName() {
    return this.appraiser?.name || 'N/A';
  }
}
