import { useState, useEffect } from 'react';
import API from '../services/api';

const Reports = () => {
  const [surgeries, setSurgeries] = useState([]);
  const [selectedSurgery, setSelectedSurgery] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New Report State
  const [newReport, setNewReport] = useState({ type: 'Post-Op', title: '', notes: '', fileUrl: '' });

  useEffect(() => {
    fetchSurgeries();
  }, []);

  const fetchSurgeries = async () => {
    try {
      const { data } = await API.get('/surgeries');
      setSurgeries(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching surgeries:', error);
      setLoading(false);
    }
  };

  const handleSelectSurgery = async (surgeryId) => {
    setSelectedSurgery(surgeryId);
    try {
      const { data } = await API.get(`/reports/surgery/${surgeryId}`);
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!selectedSurgery) return alert('Select a surgery first');

    try {
      const payload = { ...newReport, surgery: selectedSurgery };
      await API.post('/reports', payload);
      setNewReport({ type: 'Post-Op', title: '', notes: '', fileUrl: '' });
      handleSelectSurgery(selectedSurgery); // Refresh list
    } catch (error) {
      console.error('Error creating report', error);
      alert('Failed to add report');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Sidebar: Surgery List */}
      <div className="md:col-span-1 bg-white p-4 rounded shadow h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Select Surgery</h3>
        <ul className="space-y-2">
          {surgeries.map(s => (
            <li 
              key={s._id} 
              onClick={() => handleSelectSurgery(s._id)}
              className={`p-3 rounded cursor-pointer border ${selectedSurgery === s._id ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-50'}`}
            >
              <div className="font-semibold">{s.patient.name}</div>
              <div className="text-sm text-gray-500">{new Date(s.date).toLocaleDateString()} - {s.operationTheatre.otNumber}</div>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content: Reports for Selected Surgery */}
      <div className="md:col-span-2 bg-white p-6 rounded shadow">
        {selectedSurgery ? (
          <>
            <h2 className="text-2xl font-bold mb-6">Surgical Reports</h2>
            
            {/* Add Report Form */}
            <div className="bg-gray-50 p-4 rounded mb-6 border">
              <h4 className="font-semibold mb-2">Upload New Report</h4>
              <form onSubmit={handleCreateReport} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <select 
                    className="border rounded p-2"
                    value={newReport.type}
                    onChange={(e) => setNewReport({...newReport, type: e.target.value})}
                  >
                    <option value="Pre-Op">Pre-Op</option>
                    <option value="Post-Op">Post-Op</option>
                    <option value="Lab">Lab</option>
                    <option value="Imaging">Imaging</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="Report Title" 
                    className="border rounded p-2"
                    value={newReport.title}
                    onChange={(e) => setNewReport({...newReport, title: e.target.value})}
                    required
                  />
                </div>
                 <textarea 
                    placeholder="Notes..." 
                    className="w-full border rounded p-2"
                    value={newReport.notes}
                    onChange={(e) => setNewReport({...newReport, notes: e.target.value})}
                  />
                  <input 
                    type="text" 
                    placeholder="File URL (Simulated Upload)" 
                    className="w-full border rounded p-2"
                    value={newReport.fileUrl}
                    onChange={(e) => setNewReport({...newReport, fileUrl: e.target.value})}
                    required
                  />
                  <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Add Report</button>
              </form>
            </div>

            {/* List Reports */}
            <div className="space-y-4">
              {reports.length === 0 && <p className="text-gray-500">No reports found.</p>}
              {reports.map(report => (
                <div key={report._id} className="border p-4 rounded-lg flex justify-between items-start">
                   <div>
                     <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full uppercase font-semibold">{report.type}</span>
                     <h4 className="font-bold mt-1">{report.title}</h4>
                     <p className="text-gray-600 text-sm mt-1">{report.notes}</p>
                     <p className="text-xs text-gray-400 mt-2">Added on {new Date(report.createdAt).toLocaleDateString()}</p>
                   </div>
                   <a 
                     href={report.fileUrl} 
                     target="_blank" 
                     rel="noreferrer"
                     className="text-blue-600 hover:underline text-sm"
                   >
                     View Attachment 📎
                   </a>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a surgery from the left to view reports.
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
