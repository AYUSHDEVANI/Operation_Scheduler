import { useState, useEffect } from 'react';
import API from '../services/api';
import { Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Resources = () => {
  // Add editingId state
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', type: 'Drug', quantity: 0, unit: '', lowStockThreshold: 10 });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
     const delayDebounce = setTimeout(() => {
      fetchResources();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const fetchResources = async () => {
    try {
      const { data } = await API.get(`/resources?search=${searchTerm}`);
      setResources(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load resources');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
          await API.put(`/resources/${editingId}`, formData);
          toast.success('Resource updated successfully');
      } else {
          await API.post('/resources', formData);
          toast.success('Resource added successfully');
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', type: 'Drug', quantity: 0, unit: '', lowStockThreshold: 10 });
      fetchResources();
    } catch (error) {
       toast.error(editingId ? 'Failed to update resource' : 'Failed to add resource');
    }
  };

  const handleEdit = (item) => {
      setEditingId(item._id);
      setFormData({
          name: item.name,
          type: item.type,
          quantity: item.quantity,
          unit: item.unit,
          lowStockThreshold: item.lowStockThreshold
      });
      setShowForm(true);
  };

  const handleDelete = async (id) => {
      if (window.confirm('Are you sure you want to delete this item?')) {
          try {
              await API.delete(`/resources/${id}`);
              toast.success('Resource deleted successfully');
              fetchResources();
          } catch (error) {
              toast.error('Failed to delete resource');
          }
      }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Resource Inventory</h2>
         <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
           <input 
             type="text" 
             placeholder="Search items..." 
             className="border rounded px-4 py-2 w-full sm:w-64"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
            <button 
              onClick={() => {
                  setShowForm(!showForm);
                  setEditingId(null);
                  setFormData({ name: '', type: 'Drug', quantity: 0, unit: '', lowStockThreshold: 10 });
              }}
              className="bg-primary text-surface px-4 py-2 rounded hover:brightness-110 shadow-sm w-full sm:w-auto whitespace-nowrap transition-all"
            >
              {showForm ? 'Close Form' : 'Add Item'}
            </button>
         </div>
      </div>

      {showForm && (
        <div className="bg-surface p-6 rounded-xl shadow-md mb-6 border border-gray-100">
          <h3 className="text-xl font-semibold mb-4 text-charcoal">{editingId ? 'Edit Resource' : 'Add New Resource'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Item Name</label>
                <input 
                  type="text" 
                  className="w-full border rounded px-3 py-2 focus:ring-primary focus:border-primary" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Type</label>
                <select
                  className="w-full border rounded px-3 py-2 focus:ring-primary focus:border-primary bg-surface"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                    <option value="Drug">Drug</option>
                    <option value="Instrument">Instrument</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Consumable">Consumable</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Quantity</label>
                <input 
                  type="number" 
                  className="w-full border rounded px-3 py-2 focus:ring-primary focus:border-primary" 
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Unit</label>
                <input 
                  type="text" 
                  placeholder="e.g. mg, pcs"
                  className="w-full border rounded px-3 py-2 focus:ring-primary focus:border-primary" 
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Low Stock Alert Limit</label>
                <input 
                  type="number" 
                  className="w-full border rounded px-3 py-2 focus:ring-primary focus:border-primary" 
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({...formData, lowStockThreshold: Number(e.target.value)})}
                />
              </div>
             </div>
            <button type="submit" className="bg-success text-surface px-4 py-2 rounded hover:brightness-110 font-medium">
                {editingId ? 'Update Item' : 'Save Item'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-surface shadow-md rounded-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-background">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-charcoal uppercase tracking-wider">Name</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-charcoal uppercase tracking-wider">Type</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-charcoal uppercase tracking-wider">Stock</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-charcoal uppercase tracking-wider">Status</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-charcoal uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-gray-200">
              {resources.map((item) => (
                <tr key={item._id}>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap font-medium text-charcoal text-sm">{item.name}</td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-charcoal text-sm">{item.type}</td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-charcoal text-sm">
                      {item.quantity} {item.unit}
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    {item.quantity <= item.lowStockThreshold ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Low Stock</span>
                    ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">In Stock</span>
                    )}
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap flex items-center">
                      <button 
                          onClick={() => handleEdit(item)}
                          className="text-primary hover:text-blue-700 font-medium text-sm mr-4 flex items-center gap-1"
                      >
                          <Edit size={16} /> Edit
                      </button>
                      <button 
                          onClick={() => handleDelete(item._id)}
                          className="text-red-500 hover:text-red-700 font-medium text-sm flex items-center gap-1"
                      >
                          <Trash2 size={16} /> Delete
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

export default Resources;
