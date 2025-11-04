import './AdminPanel.css';
import { ImageTab } from '../../../components/common';
import { HiOutlineDocumentCheck } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';

/**
 * This component is used to display the appraisal dashboard.
 * @returns
 */
const AdminPanel = () => {
 



  const navigate = useNavigate();

  return (
    <div className="pageWrapper">
      <h1 className="dashboard-title text-primary fw-bold mb-0">Admin Panel</h1>

    

      {/* Appraisal Tabs */}
      <div className="appraisal-tabs mt-3 d-flex flex-row gap-3">
        <ImageTab
          heading="Appraisal Tracking"
          body="Click here for Appraisal Tracking"
          image={<HiOutlineDocumentCheck />}
          onClick={() => navigate('/appraisal/..')}//path not created
        />
        <ImageTab
          heading="Scorecard Issues"
          body="Click here to View Scorecard issues"
          image={<HiOutlineDocumentCheck />}
          onClick={() => console.log('RectangleTab clicked')}
        />
      </div>

   
    
    </div>
  );
};

export default AdminPanel;
