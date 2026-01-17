import { useState, useEffect } from 'react';
import API from '../services/api';

const OTs = () => {
  const [ots, setOTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ otNumber: '', name: '', capacity: '' });

  const [editingId, setEditingId] = useState(null);

  /* Pagination State */
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOTs();
  }, [currentPage]);

  const fetchOTs = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/ots?page=${currentPage}&limit=10`);
      if (Array.isArray(data)) {
         setOTs(data);
         setTotalPages(1);
      } else {
         setOTs(data.ots);
         setTotalPages(data.totalPages);
      }
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
      capacity: ot.capacity || '' 
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
    <div className="space-y-6 text-charcoal">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-charcoal">Operation Theatres</h2>
        <button 
           onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ otNumber: '', name: '', capacity: '' });
            }}
          className="bg-primary text-surface px-6 py-2 rounded-lg hover:brightness-110 shadow-sm transition-all w-full md:w-auto font-medium"
        >
          {showForm ? 'Close Form' : 'Add New OT'}
        </button>
      </div>

      {showForm && (
        <div className="bg-surface p-6 rounded-xl shadow-md mb-6 border border-gray-100">
          <h3 className="text-xl font-semibold mb-4 text-charcoal">{editingId ? 'Edit OT' : 'Add New OT'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">OT Number</label>
                <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                    required
                    placeholder="e.g. 101"
                    value={formData.otNumber}
                    onChange={(e) => setFormData({...formData, otNumber: e.target.value})}
                />
                </div>
                <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Name/Label</label>
                <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                    required
                    placeholder="e.g. General Surgery A"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                </div>
                <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Capacity</label>
                <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                    required
                    placeholder="e.g. 2"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                />
                </div>
             </div>
            <button type="submit" className="bg-success text-surface px-6 py-2 rounded-lg hover:brightness-110 transition-all font-bold w-full md:w-auto shadow-sm">{editingId ? 'Update' : 'Save'} OT</button>
          </form>
        </div>
      )}

      <div className="bg-surface shadow-md rounded-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-background">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-charcoal uppercase tracking-wider">Number</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-charcoal uppercase tracking-wider">Name</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-charcoal uppercase tracking-wider">Status</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-charcoal uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-gray-200">
              {ots.length > 0 ? ots.map((ot) => (
                <tr key={ot._id}>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-charcoal">{ot.otNumber}</td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-charcoal">{ot.name}</td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ot.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {ot.status}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm">
                    <button 
                      onClick={() => handleEdit(ot)}
                      className="text-primary hover:text-blue-900 font-medium"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              )) : (
                  <tr>
                      <td colSpan="4" className="text-center py-4 text-gray-500">No OTs found</td>
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

export default OTs;
