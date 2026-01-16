import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useQuery } from '@tanstack/react-query';
import { Calendar, FileText, Activity, Clock, User, Stethoscope, AlertCircle, Loader2 } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const AdminDashboard = ({ user, stats, surgeryData }) => (
    <div className="space-y-8 text-charcoal">
      {/* Quick Actions - Visible to Admin AND Doctors */}
      {(user.role === 'ADMIN' || user.role === 'DOCTOR') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/surgeries" className="bg-primary text-surface p-6 rounded-xl shadow-lg hover:brightness-110 transition flex items-center justify-center space-x-2">
            <span className="text-xl font-semibold">Schedule Surgery</span>
          </Link>
          <Link to="/reports" className="bg-success text-surface p-6 rounded-xl shadow-lg hover:brightness-110 transition flex items-center justify-center space-x-2">
            <span className="text-xl font-semibold">Upload Post-Op Report</span>
          </Link>
          <Link to="/resources" className="bg-secondary text-surface p-6 rounded-xl shadow-lg hover:brightness-110 transition flex items-center justify-center space-x-2">
            <span className="text-xl font-semibold">Check Resource Availability</span>
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface p-6 rounded-xl shadow-md border-l-4 border-primary hover:shadow-lg transition-shadow">
          <p className="text-secondary text-sm font-medium uppercase tracking-wide">Total Surgeries</p>
          <p className="text-3xl font-extrabold text-charcoal mt-2">{stats.total}</p>
        </div>
        <div className="bg-surface p-6 rounded-xl shadow-md border-l-4 border-warning hover:shadow-lg transition-shadow">
          <p className="text-secondary text-sm font-medium uppercase tracking-wide">Pending</p>
          <p className="text-3xl font-extrabold text-charcoal mt-2">{stats.scheduled}</p>
        </div>
        <div className="bg-surface p-6 rounded-xl shadow-md border-l-4 border-success hover:shadow-lg transition-shadow">
          <p className="text-secondary text-sm font-medium uppercase tracking-wide">Completed</p>
          <p className="text-3xl font-extrabold text-charcoal mt-2">{stats.completed}</p>
        </div>
        <div className="bg-surface p-6 rounded-xl shadow-md border-l-4 border-emergency hover:shadow-lg transition-shadow">
          <p className="text-secondary text-sm font-medium uppercase tracking-wide">Emergency</p>
          <p className="text-3xl font-extrabold text-charcoal mt-2">{stats.emergency}</p>
        </div>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface p-6 rounded-xl shadow-md flex flex-col items-center">
            <h3 className="text-lg font-bold mb-4 text-charcoal">Surgery Outcome Rates</h3>
            <div className="w-full max-w-xs h-64 flex items-center justify-center">
                <Doughnut data={surgeryData} options={{ maintainAspectRatio: false }} />
            </div>
        </div>

        <div className="bg-surface p-6 rounded-xl shadow-md">
             <h3 className="text-lg font-bold mb-4 text-charcoal">Operational Status</h3>
             <ul className="space-y-3">
                <li className="flex justify-between text-sm border-b border-gray-100 pb-2">
                    <span className="text-secondary">Active Doctors</span>
                    <span className="text-charcoal font-semibold">-</span>
                </li>
                 <li className="flex justify-between text-sm border-b border-gray-100 pb-2">
                    <span className="text-secondary">Active Patients</span>
                    <span className="text-charcoal font-semibold">-</span>
                </li>
                 <li className="flex justify-between text-sm border-b border-gray-100 pb-2">
                    <span className="text-secondary">Pending Surgeries (Scheduled)</span>
                    <span className="text-primary font-bold">{stats.scheduled}</span>
                </li>
             </ul>
        </div>
      </div>
    </div>
);

const UserDashboard = ({ user, todaySurgeries }) => {
    // Helper to safely format time
    const formatTime = (dateString) => {
        try {
            if(!dateString) return 'N/A';
            return new Date(dateString).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        } catch (e) {
            return 'Invalid Time';
        }
    };

    return (
    <div className="space-y-8 font-sans text-charcoal">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-blue-800 text-surface p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold">Welcome, {user?.name}</h2>
        <p className="mt-2 text-blue-100 flex items-center gap-2">
            <Stethoscope size={18} />
            <span className="capitalize">{user?.role?.toLowerCase() || 'Medical Staff'}</span>
        </p>
      </div>

       {/* Quick Actions Grid */}
       {(user?.role === 'DOCTOR') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/surgeries" className="group bg-surface p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-primary flex flex-col items-center text-center">
            <div className="bg-blue-50 p-4 rounded-full mb-4 group-hover:bg-blue-100 transition-colors">
                <Calendar className="text-primary" size={24} />
            </div>
            <span className="text-lg font-semibold text-charcoal">View Schedule</span>
            <span className="text-sm text-secondary mt-1">Check your upcoming surgeries</span>
          </Link>
          
          <Link to="/reports" className="group bg-surface p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-success flex flex-col items-center text-center">
            <div className="bg-green-50 p-4 rounded-full mb-4 group-hover:bg-green-100 transition-colors">
                <FileText className="text-success" size={24} />
            </div>
            <span className="text-lg font-semibold text-charcoal">Upload Report</span>
            <span className="text-sm text-secondary mt-1">Submit post-op documentation</span>
          </Link>

          <Link to="/resources" className="group bg-surface p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-secondary flex flex-col items-center text-center">
             <div className="bg-gray-100 p-4 rounded-full mb-4 group-hover:bg-gray-200 transition-colors">
                <Activity className="text-secondary" size={24} />
            </div>
            <span className="text-lg font-semibold text-charcoal">Check Resources</span>
             <span className="text-sm text-secondary mt-1">Verify OT availability</span>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Schedule Column */}
        <div className="lg:col-span-2 bg-surface p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-charcoal flex items-center gap-2">
                    <Clock className="text-primary" size={20} />
                    Today's Surgeries
                </h3>
                <span className="text-sm text-secondary font-medium">{new Date().toLocaleDateString()}</span>
            </div>
           
           {todaySurgeries.length > 0 ? (
               <div className="space-y-4">
                   {todaySurgeries.map(surgery => (
                       <div key={surgery._id} className="p-4 rounded-lg border border-gray-100 hover:border-primary bg-background hover:bg-surface transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                           <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-charcoal">{surgery.patient?.name || 'Unknown Patient'}</h4>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-surface border border-gray-200 text-secondary">
                                        {surgery.operationTheatre?.name || 'Unknown OT'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-secondary">
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} />
                                        {formatTime(surgery.startDateTime)} - {formatTime(surgery.endDateTime)}
                                    </span>
                                </div>
                           </div>
                           
                           <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                               surgery.status === 'Completed' ? 'bg-green-100 text-success' : 
                               surgery.status === 'Cancelled' ? 'bg-red-100 text-emergency' : 
                               'bg-blue-100 text-primary'
                           }`}>
                               {surgery.status}
                           </span>
                       </div>
                   ))}
               </div>
           ) : (
                <div className="py-12 text-center text-secondary bg-background rounded-lg border border-dashed border-gray-300">
                    <AlertCircle className="mx-auto mb-2 opacity-50" size={32} />
                    <p>No surgeries scheduled for today.</p>
                </div>
           )}
           <div className="mt-6 text-right">
                <Link to="/surgeries" className="text-primary hover:text-blue-800 font-medium text-sm flex items-center justify-end gap-1 hover:gap-2 transition-all">
                    View Full Calendar →
                </Link>
           </div>
        </div>

        {/* Status / Notifications Column */}
        <div className="bg-surface p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
           <h3 className="text-lg font-bold text-charcoal mb-4">Quick Links</h3>
            <nav className="space-y-2">
             <Link to="/surgeries" className="block p-3 rounded-lg hover:bg-background text-charcoal hover:text-primary transition-colors flex items-center justify-between group">
                 <span>Full Calendar</span>
                 <span className="text-secondary group-hover:text-primary">→</span>
             </Link>
             {(user?.role === 'DOCTOR' || user?.role === 'ADMIN') && (
                 <>
                    <Link to="/reports" className="block p-3 rounded-lg hover:bg-background text-charcoal hover:text-primary transition-colors flex items-center justify-between group">
                        <span>Post-Op Reports</span>
                        <span className="text-secondary group-hover:text-primary">→</span>
                    </Link>
                    <Link to="/resources" className="block p-3 rounded-lg hover:bg-background text-charcoal hover:text-primary transition-colors flex items-center justify-between group">
                        <span>Resource Management</span>
                        <span className="text-secondary group-hover:text-primary">→</span>
                    </Link>
                 </>
             )}
            </nav>
            
            <div className="mt-8 pt-6 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-4">System Status</h4>
                <div className="flex items-center gap-2 text-sm text-success bg-background p-2 rounded-md border border-gray-100">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                    Systems Operational
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    // Query for Statistics
    const { data: stats = { total: 0, completed: 0, cancelled: 0, scheduled: 0, emergency: 0 }, isLoading: loadingStats } = useQuery({
        queryKey: ['surgeryStats'],
        queryFn: async () => {
        const res = await API.get('/surgeries/stats');
        return res.data;
        },
        enabled: !!user // Only run if user exists
    });

    // Query for Today's Surgeries
    const { data: todaySurgeries = [], isLoading: loadingSurgeries } = useQuery({
        queryKey: ['todaySurgeries'],
        queryFn: async () => {
        const today = new Date().toISOString().split('T')[0];
        const res = await API.get(`/surgeries?date=${today}&limit=10`);
        return Array.isArray(res.data.surgeries) ? res.data.surgeries : (Array.isArray(res.data) ? res.data : []);
        },
        enabled: !!user
    });

    if (loadingStats || loadingSurgeries) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    const surgeryData = {
        labels: ['Completed', 'Cancelled', 'Scheduled'],
        datasets: [
            {
            label: '# of Surgeries',
            data: [stats.completed, stats.cancelled, stats.scheduled],
            backgroundColor: [
                'rgba(5, 150, 105, 0.7)',   // Success (Emerald)
                'rgba(185, 28, 28, 0.7)',   // Emergency (Red)
                'rgba(30, 41, 59, 0.7)',    // Primary (Navy)
            ],
            borderColor: [
                '#059669',
                '#b91c1c',
                '#1e293b',
            ],
            borderWidth: 1,
            },
        ],
        };

    return (
        <div className="space-y-6">
        <h1 className="text-3xl font-bold text-charcoal">Dashboard</h1>
        {user?.role === 'ADMIN' ? 
            <AdminDashboard user={user} stats={stats} surgeryData={surgeryData} /> : 
            <UserDashboard user={user} todaySurgeries={todaySurgeries} />
        }
        </div>
    );
};

export default Dashboard;
