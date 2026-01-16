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
      const { data } = await API.get('/surgeries?limit=100'); // Ensure we get a list
      // Handle both array and paginated object responses
      const surgeriesList = Array.isArray(data) ? data : (data.surgeries || []);
      setSurgeries(surgeriesList);
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
      // Handle potential response structure differences if any
      setReports(Array.isArray(data) ? data : (data.reports || []));
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]); // Reset on error
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-charcoal">
      {/* Sidebar: Surgery List */}
      <div className="md:col-span-1 bg-surface p-4 rounded-xl shadow border border-gray-100 h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4 text-charcoal">Select Surgery</h3>
        <ul className="space-y-2">
          {Array.isArray(surgeries) && surgeries.map(s => (
            <li 
              key={s._id} 
              onClick={() => handleSelectSurgery(s._id)}
              className={`p-3 rounded cursor-pointer border transition-colors ${selectedSurgery === s._id ? 'bg-blue-50 border-primary text-primary' : 'hover:bg-background border-transparent'}`}
            >
              <div className="font-semibold">{s.patient?.name || 'Unknown Patient'}</div>
              <div className="text-sm text-secondary">
                  {new Date(s.startDateTime || s.date).toLocaleDateString()} - {s.operationTheatre?.otNumber || 'No OT'}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content: Reports for Selected Surgery */}
      <div className="md:col-span-2 bg-surface p-6 rounded-xl shadow border border-gray-100">
        {selectedSurgery ? (
          <>
            <h2 className="text-2xl font-bold mb-6 text-charcoal">Surgical Reports</h2>
            
            {/* Add Report Form */}
            <div className="bg-background p-4 rounded-lg mb-6 border border-gray-200">
              <h4 className="font-semibold mb-2 text-charcoal">Upload New Report</h4>
              <form onSubmit={handleCreateReport} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <select 
                    className="border rounded p-2 focus:ring-primary focus:border-primary"
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
                    className="border rounded p-2 focus:ring-primary focus:border-primary"
                    value={newReport.title}
                    onChange={(e) => setNewReport({...newReport, title: e.target.value})}
                    required
                  />
                </div>
                 <textarea 
                    placeholder="Notes..." 
                    className="w-full border rounded p-2 focus:ring-primary focus:border-primary"
                    value={newReport.notes}
                    onChange={(e) => setNewReport({...newReport, notes: e.target.value})}
                  />
                  <input 
                    type="text" 
                    placeholder="File URL (Simulated Upload)" 
                    className="w-full border rounded p-2 focus:ring-primary focus:border-primary"
                    value={newReport.fileUrl}
                    onChange={(e) => setNewReport({...newReport, fileUrl: e.target.value})}
                    required
                  />
                  <button type="submit" className="bg-success text-surface px-4 py-2 rounded hover:brightness-110 font-medium">Add Report</button>
              </form>
            </div>

            {/* List Reports */}
            <div className="space-y-4">
              {reports.length === 0 && <p className="text-secondary">No reports found.</p>}
              {reports.map(report => (
                <div key={report._id} className="border p-4 rounded-lg flex justify-between items-start bg-white">
                   <div>
                     <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full uppercase font-semibold">{report.type}</span>
                     <h4 className="font-bold mt-1 text-charcoal">{report.title}</h4>
                     <p className="text-secondary text-sm mt-1">{report.notes}</p>
                     <p className="text-xs text-secondary mt-2">Added on {new Date(report.createdAt).toLocaleDateString()}</p>
                   </div>
                   <a 
                     href={report.fileUrl} 
                     target="_blank" 
                     rel="noreferrer"
                     className="text-primary hover:underline text-sm font-medium"
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
