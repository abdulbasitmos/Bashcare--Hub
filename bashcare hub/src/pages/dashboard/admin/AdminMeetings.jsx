import { useNavigate } from 'react-router-dom';
import MeetingPortal from '../meetings/MeetingPortal';

const AdminMeetings = ({ user }) => {
  const navigate = useNavigate();
  const exitPortal = () => navigate('/dashboard/admin');

  return (
    <div className="h-[calc(100vh-8rem)] min-h-[600px] -m-8 relative overflow-hidden bg-slate-900 rounded-[24px]">
      <MeetingPortal user={user} role="admin" exitPortal={exitPortal} />
    </div>
  );
};

export default AdminMeetings;
