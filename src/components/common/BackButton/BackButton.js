import { useNavigate } from 'react-router-dom';
import { HiMiniArrowLongLeft } from 'react-icons/hi2';

export default function BackButton() {
  const navigate = useNavigate();
  return (
    <button
      className="back-button m-0 d-inline-flex align-items-center gap-1 fw-medium shadow-sm rounded-pill bg-white px-2 py-1 shadow-sm border border-opacity-10 border-dark"
      onClick={() => navigate(-1)}
    >
      <HiMiniArrowLongLeft size={20} className="lh-1" />{' '}
      <span className="small fw-semibold">BACK</span>
    </button>
  );
}
