import React, { useState, useRef, useEffect } from 'react'
import "./RoleAcceptance.css";
import RoleAcceptanceGraph from '../../Graphs/RoleAcceptanceGraph';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/Spinner';
import { showToast } from '../../components/common/ToastMessage';
import SideDrawer from '../../components/SideDrawer';
import RoleAllocationService from '../../services/roleAllocationService';
import { RoleAcceptanceService } from '../../services/roleAcceptanceService';
import RoleAcceptanceKRATable from '../../components/RoleAcceptanceKRATable/RoleAcceptanceKRATable';
import RoleAcceptanceSummaryCard from '../../components/RoleAcceptanceSummaryCard/RoleAcceptanceSummaryCard';
import RoleScoreSummaryCard from '../../components/RoleScoreSummaryCard/RoleScoreSummaryCard';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { HiMiniArrowLongLeft } from "react-icons/hi2";
import { useAuth } from '../../contexts/AuthContext';
import DashboardService from '../../services/dashboardService';

const RoleAcceptance = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [openDrawer, setOpenDrawer] = useState(null);
  const [acceptanceKRADetails, setAcceptanceKRADetails] = useState({})
  const [errorMsg, setErrorMsg] = useState(true);
  const [discussionReason, setDiscussionReason] = useState('')
  const [disscussionComment, setDiscussionComment] = useState('')
  const [showButton, setShowButton] = useState(true)

  const location = useLocation()
  const navigate = useNavigate()
  const RoleAcceptanceContainerRef = useRef()
  const { user, getEmployeeDetails, getUserProperty } = useAuth();
  const { ROLE_NAME } = user || {};
  const employeeDetails = getEmployeeDetails();
  const sol = getUserProperty('sol', employeeDetails.currentUser[0].LOCATION);
  const unitType = getUserProperty('unitType', employeeDetails.currentUser[0].BRANCH_UNIT_TYPE);
  const empDsg = getUserProperty('empDsg', employeeDetails.currentUser[0].POSITION_DESIGNATION);
  const userName = getUserProperty('name');

  const { URL_ID, empNo } = location.state || {};

  // ========== Open and Close Side Drawer ===================
  const handleOpenDrawer = (drawerName) => {
    setOpenDrawer(drawerName)
  }

  //   handle back
  const handleBackClick = () => {
    navigate(-1);
  }

  //  ====================  GET Role Acceptance Details   =================
  const getRoleAcceptanceDetails = async () => {
    try {
      setLoading(true);
      setMessage('')
      setErrorMsg('')
      const response = await RoleAcceptanceService.getAcceptanceKraDetails(URL_ID, empNo, sol);
      //  if(response){
      //     await DashboardService.getRCTDashboard( empNo,sol, unitType,empDsg);
      //  }
      setLoading(false);
      setMessage('')
      setErrorMsg('')
      setAcceptanceKRADetails(response)
      //  setAcceptanceKRADetails(response)
    } catch (error) {
      console.error("Failed to fetch role acceptance details", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRoleAcceptanceDetails()
  }, [])

  // ========  Move page to top on load with smooth scrolling ==========
  useEffect(() => {
    if (RoleAcceptanceContainerRef.current) {
      RoleAcceptanceContainerRef.current.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (openDrawer === null) {
      setDiscussionReason('');
    }
  }, [openDrawer]);

  //    ==========  Handle Choose Reason for Discussion ============ 
  const handleChooseReasonDiscussion = (e) => {
    setDiscussionReason(e.target.value)
  }

  //  ================= Handle Validation for not choosing any reason ================
  const handleDiscussionValidation = () => {
    if (openDrawer === 'discuss' && !discussionReason) {
      showToast('Please select a reason for discussion', 'error')
      return false
    }
    return true;
  }
  // =============    Submitting Role Acceptance   ============

  //  ============ Submitting Role Acceptance ================
// ============ Submitting Role Acceptance ================
const handleRoleAcceptance = async (status) => {
  if (!handleDiscussionValidation()) return;

  try {
    setMessage(null);

    const payload = {
      empNo: empNo || null,
      urlId: URL_ID || null,
      // Status is 'Accepted' for YES, 'notaccepted' for NO (Discuss/Flag)
      submitType: status === 'YES' ? "Accepted" : "notaccepted", 
      comment: openDrawer === 'discuss' ? discussionReason : '',
      commentReason: openDrawer === 'discuss' ? disscussionComment || null : "",
      pDiscussion: ""
    };
    
    const response = await RoleAcceptanceService.saveRoleAcceptance(payload);
    
    if (response?.type === 'success') {
      setMessage(response.data);
      showToast(response.data, "success");
      setShowButton(false)
      // 🔥 CRITICAL FIX: Determine the NEW status based on the submission type
      let newStatus;
      if (status === 'YES') {
          newStatus = 'role_accepted';
      } else if (openDrawer === 'discuss') {
          // Assuming 'Discuss' leads to a 'role_not_accepted' or 'flagged' status in the backend. 
          // We will use 'role_not_accepted' as it immediately hides the buttons.
          newStatus = 'role_not_accepted'; 
      }
      
      // Update the state to reflect the new status
      if (newStatus) {
        setAcceptanceKRADetails(prevDetails => {
            const updatedResNew = prevDetails.res_new ? 
                prevDetails.res_new.map(item => ({ 
                    ...item, 
                    STATUS: newStatus // Set the new status
                })) : 
                [{ STATUS: newStatus }]; // Handle case where res_new is empty
            
            return {
                ...prevDetails,
                res_new: updatedResNew
            };
        });
      }
      
      setOpenDrawer(null);
      setDiscussionReason('')
      
    } else if (response?.type === 'error') {
      setMessage(response.data);
      showToast(response.data, "error");
      setDiscussionReason('')
    }

  } catch (error) {
    console.log(error, 'newerror');
    setErrorMsg(error?.data || 'Failed to Submit');
    showToast(error?.data || 'Failed to Submit', "error");
    setDiscussionReason('')
  } finally {
    // This is good practice to ensure the drawer closes
    setOpenDrawer(null);
    setDiscussionReason('')
  }
};

  //  ========================= handle  Comment ================ 

  const handleChangeComment = (e) => {
    setDiscussionComment(e.target.value)
  }
console.log(acceptanceKRADetails, "acceptanceKRADetailsacceptanceKRADetails")
  const { chart_data, kra_data, mes_total, totals, total, res_new } = acceptanceKRADetails
  const showReportingAuthoritySection = ROLE_NAME && (ROLE_NAME === 'Branch Head' || ROLE_NAME === 'Zonal Head' || ROLE_NAME === 'Vertical Head');
  const roleStatus = res_new?.[0]?.STATUS || '';

  return (

    <>
      {loading ? (
        <div className="spinner-container">
          <LoadingSpinner />
        </div>
      ) :
        (
          <>
            <div className="role-acceptance-container" ref={RoleAcceptanceContainerRef}>
              <div className='col-12 d-flex align-items-center gap-3'>
                <button className="back-button m-0 d-inline-flex align-items-center gap-1 fw-medium shadow-sm rounded-pill bg-white px-2 py-1 shadow-sm border border-opacity-10 border-dark" onClick={handleBackClick}>
                  <HiMiniArrowLongLeft size={20} className='lh-1' /> <span className='small fw-semibold'>BACK</span>
                </button>
                <h1 className="dashboard-title text-primary fw-bold mb-0">Role Acceptance</h1>
              </div>
              <div className="role-acceptance-wrapper">
                <div className="role-acceptance-table-section">
                  <div className="role-kras">
                    <RoleAcceptanceKRATable
                      kraListData={kra_data}
                      kraTotal={mes_total}
                      acceptanceKRADetails={acceptanceKRADetails}
                    />
                  </div>
                </div>
                <div className="role-acceptance-graph-section">
                  <RoleAcceptanceSummaryCard
                    acceptedRoleSummary={res_new}
                  />

                  <div className="role-graph">
                    {/* Graph component */}
                    <RoleAcceptanceGraph
                      chartData={chart_data}
                      total={total}
                    />
                    <RoleScoreSummaryCard
                      acceptedRoleSummaryList={totals}
                    />
                    {!showReportingAuthoritySection && showButton &&
                      roleStatus !== 'role_accepted' &&
                      roleStatus !== 'role_not_accepted' ? (
                      <div className="role-agree btn-wrapper">
                        <button
                          className="btn btn-blue discuss-btn"
                          title="Discuss with Supervisor"
                          data-bs-toggle="offcanvas"
                          data-bs-target="#offcanvasWithBothOptions"
                          aria-controls="offcanvasWithBothOptions"
                          onClick={() => handleOpenDrawer('discuss')}
                        >
                          Discuss with Role Allocator
                        </button>
                        <button
                          className="btn btn-green accept-btn"
                          title="Yes"
                          data-bs-toggle="offcanvas"
                          data-bs-target="#offcanvasWithBackdrop"
                          aria-controls="offcanvasWithBackdrop"
                          onClick={() => handleOpenDrawer('accept')}
                        >
                          Accept
                        </button>
                      </div>
                    ) : null}

                  </div>

                </div>

              </div>
            </div>
            <SideDrawer
              handleOpenDrawer={handleOpenDrawer}
              openDrawer={openDrawer}
              handleRoleAcceptance={handleRoleAcceptance}
              handleChooseReasonDiscussion={handleChooseReasonDiscussion}
              discussionReason={discussionReason}
              handleChangeComment={handleChangeComment}
              disscussionComment={disscussionComment}
              acceptanceKRADetails={acceptanceKRADetails}
            />
          </>
        )}
    </>
  );
}

export default RoleAcceptance