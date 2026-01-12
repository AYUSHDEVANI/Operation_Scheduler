import { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
      total: 0,
      completed: 0,
      cancelled: 0,
      scheduled: 0,
      emergency: 0
  });

  useEffect(() => {
      const fetchStats = async () => {
          try {
              const { data } = await API.get('/surgeries/stats');
              setStats(data);
          } catch (error) {
              console.error("Failed to load stats", error);
          }
      };
      if(user) fetchStats();
  }, [user]);

  const surgeryData = {
      labels: ['Completed', 'Cancelled', 'Scheduled'],
      datasets: [
        {
          label: '# of Surgeries',
          data: [stats.completed, stats.cancelled, stats.scheduled],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };

  const AdminDashboard = () => (
    <div className="space-y-8">
      {/* Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
          <h3 className="text-xl font-semibold text-gray-700">Total Surgeries</h3>
          <p className="text-3xl font-bold mt-2 text-blue-600">{stats.total}</p>
          <Link to="/surgeries" className="mt-4 inline-block text-sm text-gray-500 hover:text-blue-600">View Schedule &rarr;</Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-500">
          <h3 className="text-xl font-semibold text-gray-700">Completed</h3>
          <p className="text-3xl font-bold mt-2 text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-red-500">
          <h3 className="text-xl font-semibold text-gray-700">Cancelled</h3>
          <p className="text-3xl font-bold mt-2 text-red-600">{stats.cancelled}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-yellow-500">
          <h3 className="text-xl font-semibold text-gray-700">Emergency</h3>
          <p className="text-3xl font-bold mt-2 text-yellow-600">{stats.emergency}</p>
        </div>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Surgery Outcome Rates</h3>
            <div className="w-64 h-64">
                <Doughnut data={surgeryData} />
            </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
             <h3 className="text-lg font-bold mb-4 text-gray-800">Operational Status</h3>
             <ul className="space-y-3">
                <li className="flex justify-between text-sm border-b pb-2">
                    <span className="text-gray-600">Active Doctors</span>
                    <span className="text-gray-800 font-semibold">-</span> {/* Could fetch if needed */}
                </li>
                 <li className="flex justify-between text-sm border-b pb-2">
                    <span className="text-gray-600">Active Patients</span>
                    <span className="text-gray-800 font-semibold">-</span>
                </li>
                 <li className="flex justify-between text-sm border-b pb-2">
                    <span className="text-gray-600">Pending Surgeries (Scheduled)</span>
                    <span className="text-blue-600 font-bold">{stats.scheduled}</span>
                </li>
             </ul>
        </div>
      </div>
    </div>
  );

  const UserDashboard = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
        <h2 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name}</h2>
        <p className="text-gray-600">Role: <span className="capitalize">{user?.role}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
           <h3 className="text-lg font-bold mb-4">My Upcoming Surgeries</h3>
           <p className="text-gray-500 italic">No surgeries scheduled for today.</p>
           <Link to="/surgeries" className="mt-4 inline-block text-blue-600 hover:text-blue-800">View Full Schedule &rarr;</Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
           <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
           <div className="space-y-2">
             <Link to="/reports" className="block w-full text-center px-4 py-2 border rounded hover:bg-gray-50">Upload Post-Op Report</Link>
             <Link to="/resources" className="block w-full text-center px-4 py-2 border rounded hover:bg-gray-50">Check Resource Availability</Link>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      {user.role === 'admin' || user.role === 'ADMIN' ? <AdminDashboard /> : <UserDashboard />}
    </div>
  );
};

export default Dashboard;
