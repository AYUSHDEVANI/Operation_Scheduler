import { useState, useEffect } from 'react';
import API from '../services/api';

const OTs = () => {
  const [ots, setOTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ otNumber: '', name: '', capacity: '' });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchOTs();
  }, []);

  const fetchOTs = async () => {
    try {
      const { data } = await API.get('/ots');
      setOTs(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching OTs:', error);
      setLoading(false);
    }
  };

  const handleEdit = (ot) => {
    setEditingId(ot._id);
    setFormData({
      otNumber: ot.otNumber,
      name: ot.name,
      capacity: ot.capacity || '' // Ensure capacity is set, default to empty string if not present
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/ots/${editingId}`, formData);
        setEditingId(null);
      } else {
        await API.post('/ots', formData);
      }
      setShowForm(false);
      setFormData({ otNumber: '', name: '', capacity: '' });
      fetchOTs();
    } catch (error) {
      alert('Error saving OT');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Operation Theatres</h2>
        <button 
           onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ otNumber: '', name: '', capacity: '' });
            }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Close Form' : 'Add OT'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold mb-4">{editingId ? 'Edit OT' : 'Add New OT'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700">OT Number</label>
              <input 
                type="text" 
                className="w-full border rounded px-3 py-2" 
                required
                value={formData.otNumber}
                onChange={(e) => setFormData({...formData, otNumber: e.target.value})}
              />
            </div>
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
              <label className="block text-gray-700">Capacity</label>
               <input 
                type="text" 
                className="w-full border rounded px-3 py-2" 
                required
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: e.target.value})}
              />
            </div>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">{editingId ? 'Update' : 'Save'} OT</button>
          </form>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ots.map((ot) => (
                <tr key={ot._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{ot.otNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{ot.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ot.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {ot.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => handleEdit(ot)}
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

export default OTs;
