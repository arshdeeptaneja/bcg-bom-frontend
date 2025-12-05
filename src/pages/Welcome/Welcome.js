import React from 'react';
import TopBar from '../../components/common/TopBar';
import LeftNavigation from '../../components/common/LeftNavigation';
import { useAuth } from '../../contexts/AuthContext';
import './Welcome.css';

const Welcome = ({ onLogout }) => {
  const { user, getEmployeeDetails, getUserProperty, getDebugInfo } = useAuth();
  
  // Get user details from AuthContext
  const employeeDetails = getEmployeeDetails();
  const userName = getUserProperty('name');
  const empNum = getUserProperty('empNo', employeeDetails?.empNo);
  const corporation = getUserProperty('corporation');
  const department = getUserProperty('department');
  const designation = getUserProperty('designation');

  // Debug function to check saved data
  const handleDebugClick = () => {
    const debugInfo = getDebugInfo();
    console.log('=== AuthContext Debug Info ===');
    console.log('Current User:', debugInfo.currentUser);
    console.log('LocalStorage Data:', debugInfo.localStorage);
    console.log('Is Authenticated:', debugInfo.isAuthenticated);
    console.log('Employee Details:', debugInfo.employeeDetails);
    console.log('===============================');
  };

  return (
    <div className="welcome-layout">
      <TopBar onLogout={onLogout} />
      <LeftNavigation />
      
      <div className="welcome-content px-4">
        <div className="welcome-container container-fluid vh-100">
          <div className='row mt-3'>            
            <div className='col-12'>
              <h4 className='fw-bold mb-0'  style={{color:"#185f73"}} > Welcome <span className="text-primary text-capitalize">{employeeDetails?.currentUser[0]?.EMP_NAME.toLowerCase()|| "Arvind kumar Sinha"}</span>, Good day!</h4>
              <p className="mb-0">Have a great day ahead.</p>
            </div>
          </div>
          <div className="row mt-4">
            <div className="col-md-4  d-flex flex-column">
              <div className="user-info-card card border-0 shadow-sm h-100 rounded-2">
                <div className="card-body p-0">

                  <div className='p-4'>
                    <h5 className="card-title text-primary fw-bold mb-2 text-capitalize">{employeeDetails?.currentUser[0]?.EMP_NAME.toLowerCase()|| "Arvind kumar Sinha"}</h5>
                    {/* <p className="card-text mb-3">Emp Num: {employeeDetails?.currentUser[0]?.EMP_ID}</p> */}
                  </div>
                                    <div className='cards-separator bg-dark position-relative' style={{    color:"#185f73"}}></div>


                  <div className='p-4'>

                    <p className="card-text mb-3">{employeeDetails.currentUser[0]?.BRNAME}</p>
                    
                    {/* {department && (
                      <p className="card-text mb-2">Department: {department}</p>
                    )}
                    
                    {designation && (
                      <p className="card-text mb-3">Designation: {designation}</p>
                    )} */}
                    
                    <div className="corporation-info">
                      <h6 className="text-uppercase fw-bold mb-0" style={{fontSize: '0.8rem'}}>
                        {corporation}
                      </h6>
                    </div>
                  </div>
                  
                  {/* Debug button - remove in production */}
                  {/* <button 
                    className="btn btn-sm btn-outline-info mt-3" 
                    onClick={handleDebugClick}
                    style={{fontSize: '0.8rem'}}
                  >
                    Debug User Data
                  </button> */}
                </div>
              </div>
            </div>

            <div className="col-md-8  d-flex align-items-center justify-content-center">
              <div className="quote-section rounded-2 w-100">
                <div className="quote-card text-white text-center p-5 rounded-3 shadow-lg" 
                     style={{
                       minHeight: '240px',
                       display: 'flex',
                       flexDirection: 'column',
                       justifyContent: 'center'
                     }}>
                  <h3 className="fw-bold mb-3">
                    "Your ambitions, our foundation. Bank of Maharashtra."
                  </h3>
                  <p className="lead mb-0">
                    (Connects customer goals with the bank's role)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;