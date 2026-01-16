import { useState, useEffect } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', type: 'Drug', quantity: 0, unit: '', lowStockThreshold: 10 });

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
      await API.post('/resources', formData);
      toast.success('Resource added successfully');
      setShowForm(false);
      setFormData({ name: '', type: 'Drug', quantity: 0, unit: '', lowStockThreshold: 10 });
      fetchResources();
    } catch (error) {
       toast.error('Failed to add resource');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Resource Inventory</h2>
         <div className="flex gap-4">
           <input 
             type="text" 
             placeholder="Search items..." 
             className="border rounded px-4 py-2"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
            <button 
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {showForm ? 'Close Form' : 'Add Item'}
            </button>
         </div>
      </div>

      {showForm && (
        <div className="bg-surface p-6 rounded-xl shadow-md mb-6 border border-gray-100">
          <h3 className="text-xl font-semibold mb-4 text-charcoal">Add New Resource</h3>
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
            <button type="submit" className="bg-success text-surface px-4 py-2 rounded hover:brightness-110 font-medium">Save Item</button>
          </form>
        </div>
      )}

      <div className="bg-surface shadow-md rounded-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-background">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-gray-200">
              {resources.map((item) => (
                <tr key={item._id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-charcoal">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-charcoal">{item.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-charcoal">
                      {item.quantity} {item.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.quantity <= item.lowStockThreshold ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Low Stock</span>
                    ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">In Stock</span>
                    )}
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
