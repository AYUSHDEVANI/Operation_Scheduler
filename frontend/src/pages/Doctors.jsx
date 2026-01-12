import { useState, useEffect } from 'react';
import API from '../services/api';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', specialization: '', department: '', contactNumber: '', email: '' });

  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, [searchTerm]);

  const fetchDoctors = async () => {
    try {
      const { data } = await API.get(`/doctors?search=${searchTerm}`);
      setDoctors(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setLoading(false);
    }
  };

  const handleEdit = (doctor) => {
    setEditingId(doctor._id);
    setFormData({
      name: doctor.name,
      specialization: doctor.specialization,
      department: doctor.department,
      contactNumber: doctor.contactNumber,
      email: doctor.email
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/doctors/${editingId}`, formData);
        setEditingId(null);
      } else {
        await API.post('/doctors', formData);
      }
      setShowForm(false);
      setFormData({ name: '', specialization: '', department: '', contactNumber: '', email: '' });
      fetchDoctors();
    } catch (error) {
      alert('Error saving doctor');
    }
  };
    // ... inside return ...
            <div>
              <label className="block text-gray-700">Specialization</label>
              <input 
                type="text" 
                className="w-full border rounded px-3 py-2" 
                required
                value={formData.specialization}
                onChange={(e) => setFormData({...formData, specialization: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-gray-700">Department</label>
              <input 
                type="text" 
                className="w-full border rounded px-3 py-2" 
                required
                placeholder="e.g. Cardiology"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              />
            </div>

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Doctors Management</h2>
        <div className="flex gap-4">
           <input 
             type="text" 
             placeholder="Search doctors..." 
             className="border rounded px-4 py-2"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
           <button 
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ name: '', specialization: '', department: '', contactNumber: '', email: '' });
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showForm ? 'Close Form' : 'Add Doctor'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold mb-4">{editingId ? 'Edit Doctor' : 'Add New Doctor'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <label className="block text-gray-700">Specialization</label>
              <input 
                type="text" 
                className="w-full border rounded px-3 py-2" 
                required
                value={formData.specialization}
                onChange={(e) => setFormData({...formData, specialization: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-gray-700">Department</label>
              <input 
                type="text" 
                className="w-full border rounded px-3 py-2" 
                required
                placeholder="e.g. Cardiology"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-gray-700">Contact Number</label>
              <input 
                type="text" 
                className="w-full border rounded px-3 py-2" 
                value={formData.contactNumber}
                onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
              />
            </div>
             <div>
              <label className="block text-gray-700">Email (for Login Link)</label>
              <input 
                type="email" 
                className="w-full border rounded px-3 py-2" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">{editingId ? 'Update' : 'Save'} Doctor</button>
          </form>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {doctors.map((doctor) => (
                <tr key={doctor._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{doctor.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{doctor.specialization}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{doctor.contactNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${doctor.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {doctor.availability ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => handleEdit(doctor)}
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

export default Doctors;
