import { useState, useEffect } from 'react';
import API from '../services/api';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', age: '', gender: 'Male', contactNumber: '', email: '', assignedDoctor: '' });
  const [doctors, setDoctors] = useState([]);

  const [editingId, setEditingId] = useState(null);
  
  // History Modal State
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [newHistory, setNewHistory] = useState({ condition: '', diagnosedDate: '', details: '' });

  /* Pagination State */
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchPatients();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, currentPage]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
        const { data } = await API.get('/doctors');
        setDoctors(Array.isArray(data) ? data : data.doctors || []);
    } catch(e) {
        console.error("Failed to load doctors", e);
    }
  };

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/patients?search=${searchTerm}&page=${currentPage}&limit=10`);
      // Handle data: supports both array (legacy) and object (paginated)
      if (Array.isArray(data)) {
           setPatients(data);
           setTotalPages(1);
      } else {
           setPatients(data.patients);
           setTotalPages(data.totalPages);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      name: item.name,
      age: item.age,
      gender: item.gender,
      contactNumber: item.contactNumber || '',
      email: item.email || '',
      assignedDoctor: item.assignedDoctor || '',
      medicalHistory: item.medicalHistory || [],
      pastSurgeries: item.pastSurgeries || []
    });
    setShowForm(true);
  };

  const handleViewHistory = (patient) => {
    setSelectedPatient(patient);
    setHistoryModalOpen(true);
  };

  const handleAddHistory = async (e) => {
      e.preventDefault();
      if (!selectedPatient) return;
      
      const updatedHistory = [...(selectedPatient.medicalHistory || []), newHistory];
      
      try {
          await API.put(`/patients/${selectedPatient._id}`, { ...selectedPatient, medicalHistory: updatedHistory });
          setHistoryModalOpen(false);
          setNewHistory({ condition: '', diagnosedDate: '', details: '' });
          fetchPatients();
          // Ideally re-open modal with updated data, but closing is safer for state sync
          alert('History added successfully');
      } catch(e) {
          alert('Failed to add history');
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/patients/${editingId}`, formData);
        setEditingId(null);
      } else {
        await API.post('/patients', formData);
      }
      setShowForm(false);
      setFormData({ name: '', age: '', gender: 'Male', contactNumber: '', email: '', assignedDoctor: '' });
      fetchPatients();
    } catch (error) {
      alert('Error saving patient');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6 text-charcoal">
      {/* History Modal */}
      {historyModalOpen && selectedPatient && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-surface p-6 rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-auto border border-gray-100">
                <h3 className="text-xl font-bold mb-4 text-primary">Medical History: {selectedPatient.name}</h3>
                
                <div className="mb-6">
                    <h4 className="font-semibold mb-2 text-charcoal">Existing Records:</h4>
                    {selectedPatient.medicalHistory && selectedPatient.medicalHistory.length > 0 ? (
                        <ul className="list-disc pl-5">
                            {selectedPatient.medicalHistory.map((h, i) => (
                                <li key={i} className="mb-2">
                                    <span className="font-bold text-charcoal">{h.condition}</span> ({new Date(h.diagnosedDate).toLocaleDateString()})
                                    <p className="text-sm text-secondary">{h.details}</p>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-secondary">No medical history recorded.</p>}
                </div>

                <div className="border-t border-gray-100 pt-4">
                    <h4 className="font-semibold mb-4 text-charcoal">Add New Record</h4>
                    <form onSubmit={handleAddHistory} className="space-y-3">
                        <input type="text" placeholder="Condition" className="w-full border p-2 rounded focus:ring-primary focus:border-primary" required 
                            value={newHistory.condition} onChange={e => setNewHistory({...newHistory, condition: e.target.value})} />
                        <input type="date" className="w-full border p-2 rounded focus:ring-primary focus:border-primary" required
                            value={newHistory.diagnosedDate} onChange={e => setNewHistory({...newHistory, diagnosedDate: e.target.value})} />
                        <textarea placeholder="Details" className="w-full border p-2 rounded focus:ring-primary focus:border-primary"
                            value={newHistory.details} onChange={e => setNewHistory({...newHistory, details: e.target.value})}></textarea>
                        <button type="submit" className="bg-primary text-surface px-4 py-2 rounded hover:brightness-110 w-full transition-all">Add Record</button>
                    </form>
                </div>
                <button onClick={() => setHistoryModalOpen(false)} className="mt-4 text-emergency underline hover:text-red-700">Close</button>
            </div>
         </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-charcoal">Patient Management</h2>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
           <input 
             type="text" 
             placeholder="Search patients..." 
             className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent w-full md:w-64"
             value={searchTerm}
             onChange={(e) => {
                 setSearchTerm(e.target.value);
                 setCurrentPage(1); // Reset page on search
             }}
           />
          <button 
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ name: '', age: '', gender: 'Male', contactNumber: '', email: '', assignedDoctor: '' });
            }}
            className="bg-primary text-surface px-6 py-2 rounded-lg hover:brightness-110 transition-all font-medium whitespace-nowrap shadow-sm hover:shadow-md"
          >
            {showForm ? 'Close Form' : 'Add New Patient'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold mb-4">{editingId ? 'Edit Patient' : 'Register New Patient'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Age</label>
                <input 
                  type="number" 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                  required
                  placeholder="Years"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white" 
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Number</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                value={formData.contactNumber}
                onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                required
                placeholder="+1 234 567 8900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Primary Doctor</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white"
                value={formData.assignedDoctor}
                onChange={(e) => setFormData({...formData, assignedDoctor: e.target.value})}
              >
                  <option value="">-- Assign a Doctor --</option>
                  {doctors.map(d => (
                      <option key={d._id} value={d._id}>{d.name} ({d.specialization})</option>
                  ))}
              </select>
            </div>
             </div>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">{editingId ? 'Update' : 'Save'} Patient</button>
          </form>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Age/Gender</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Email</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">History</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patients.length > 0 ? patients.map((patient) => (
                <tr key={patient._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-charcoal">{patient.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-secondary hidden md:table-cell">{patient.age} / {patient.gender}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-secondary">{patient.contactNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-secondary hidden lg:table-cell">{patient.email || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                     <button onClick={() => handleViewHistory(patient)} className="text-blue-600 hover:text-blue-800 font-medium">
                        {patient.medicalHistory?.length || 0} Records
                     </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                     <button 
                      onClick={() => handleEdit(patient)}
                      className="text-primary hover:text-indigo-800 font-semibold"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              )) : (
                  <tr>
                      <td colSpan="6" className="text-center py-4 text-gray-500">No patients found</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="px-6 py-3 flex justify-between items-center border-t">
            <div>
                <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
            </div>
            <div className="space-x-2">
                <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                    Previous
                </button>
                <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Patients;
