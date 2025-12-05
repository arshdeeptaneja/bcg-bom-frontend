/* The User class represents an employee with properties such as employee number, name, scale, roles,
appraiser, and primary role. */
/**
 * User model for the employee
 * @param {Object} props - The user properties.
 * @param {string} props.empNo - The employee number.
 * @param {string} props.employeeName - The employee name.
 * @param {string} props.employeeScale - The employee scale.
 * @param {string} props.roles - The employee roles.
 * @param {string} props.appraiser - The employee appraiser.
 * @param {string} props.name - The employee appraiser name.
 */
export default class User {
  constructor({ empNo, employeeName, employeeScale, additionalRoles, appraiser, primaryRole, branch, url, appraisalStatus, appraiserName }) {
    this.empNo = empNo;
    this.employeeName = employeeName;
    this.employeeScale = employeeScale;
    this.additionalRoles = additionalRoles;
    this.appraiser = appraiser;
    this.primaryRole = primaryRole;
    this.branch = branch
    this.url = url
    this.appraisalStatus = appraisalStatus
    this.appraiserName = appraiserName;
  }

  getFirstName() {
    return this.name?.split(' ')[0] || 'User';
  }

  getAppraiserName() {
    return this.appraiser?.name || 'N/A';
  }
}
