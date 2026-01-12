import { useState, useEffect } from 'react';
import API from '../services/api';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', age: '', gender: 'Male', contactNumber: '', email: '' });

  const [editingId, setEditingId] = useState(null);
  
  // History Modal State
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [newHistory, setNewHistory] = useState({ condition: '', diagnosedDate: '', details: '' });

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchPatients();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const fetchPatients = async () => {
    try {
      const { data } = await API.get(`/patients?search=${searchTerm}`);
      setPatients(data);
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
      setFormData({ name: '', age: '', gender: 'Male', contactNumber: '' });
      fetchPatients();
    } catch (error) {
      alert('Error saving patient');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* History Modal */}
      {historyModalOpen && selectedPatient && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full max-h-[90vh] overflow-auto">
                <h3 className="text-xl font-bold mb-4">Medical History: {selectedPatient.name}</h3>
                
                <div className="mb-6">
                    <h4 className="font-semibold mb-2">Existing Records:</h4>
                    {selectedPatient.medicalHistory && selectedPatient.medicalHistory.length > 0 ? (
                        <ul className="list-disc pl-5">
                            {selectedPatient.medicalHistory.map((h, i) => (
                                <li key={i} className="mb-2">
                                    <span className="font-bold">{h.condition}</span> ({new Date(h.diagnosedDate).toLocaleDateString()})
                                    <p className="text-sm text-gray-600">{h.details}</p>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-gray-500">No medical history recorded.</p>}
                </div>

                <div className="border-t pt-4">
                    <h4 className="font-semibold mb-4">Add New Record</h4>
                    <form onSubmit={handleAddHistory} className="space-y-3">
                        <input type="text" placeholder="Condition" className="w-full border p-2 rounded" required 
                            value={newHistory.condition} onChange={e => setNewHistory({...newHistory, condition: e.target.value})} />
                        <input type="date" className="w-full border p-2 rounded" required
                            value={newHistory.diagnosedDate} onChange={e => setNewHistory({...newHistory, diagnosedDate: e.target.value})} />
                        <textarea placeholder="Details" className="w-full border p-2 rounded"
                            value={newHistory.details} onChange={e => setNewHistory({...newHistory, details: e.target.value})}></textarea>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">Add Record</button>
                    </form>
                </div>
                <button onClick={() => setHistoryModalOpen(false)} className="mt-4 text-red-500 underline">Close</button>
            </div>
         </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Patient Management</h2>
        <div className="flex gap-4">
           <input 
             type="text" 
             placeholder="Search patients..." 
             className="border rounded px-4 py-2"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
          <button 
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ name: '', age: '', gender: 'Male', contactNumber: '' });
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showForm ? 'Close Form' : 'Add Patient'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold mb-4">{editingId ? 'Edit Patient' : 'Register New Patient'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700">Name</label>
                <input 
                  type="text" 
                  className="w-full border rounded px-3 py-2" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-gray-700">Age</label>
                <input 
                  type="number" 
                  className="w-full border rounded px-3 py-2" 
                  required
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-gray-700">Gender</label>
                <select 
                  className="w-full border rounded px-3 py-2" 
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
              <label className="block text-sm font-medium text-gray-700">Contact Number</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                value={formData.contactNumber}
                onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age/Gender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">History</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patients.map((patient) => (
                <tr key={patient._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{patient.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{patient.age} / {patient.gender}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{patient.contactNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{patient.email || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     <button onClick={() => handleViewHistory(patient)} className="text-blue-600 hover:underline">
                        {patient.medicalHistory?.length || 0} Records
                     </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                     <button 
                      onClick={() => handleEdit(patient)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Patients;
