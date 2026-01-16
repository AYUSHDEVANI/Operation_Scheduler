import { useState } from 'react';
import API from '../services/api';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Doctors = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', specialization: '', department: '', contactNumber: '', email: '', workingHours: '', preferredOTs: [] });
  const [editingId, setEditingId] = useState(null);
  
  /* Pagination State */
  const [currentPage, setCurrentPage] = useState(1);

  // FETCH DOCTORS
  const { data, isLoading, isError } = useQuery({
    queryKey: ['doctors', currentPage],
    queryFn: async () => {
      const res = await API.get(`/doctors?page=${currentPage}&limit=10`);
      // Standardize response: if array (no pagination), wrap it; else return as is
      if (Array.isArray(res.data)) {
         return { doctors: res.data, totalPages: 1 };
      }
      return res.data;
    },
    placeholderData: keepPreviousData, // Keep old data while fetching new page
  });

  const doctors = data?.doctors || [];
  const totalPages = data?.totalPages || 1;

  // MUTATION: Create or Update Doctor
  const mutation = useMutation({
    mutationFn: async (doctorData) => {
      if (editingId) {
        return API.put(`/doctors/${editingId}`, doctorData);
      } else {
        return API.post('/doctors', doctorData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['doctors']); // Refetch list
      setShowForm(false);
      resetForm();
      toast.success(editingId ? 'Doctor updated!' : 'Doctor added successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error saving doctor');
    }
  });

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', specialization: '', department: '', email: '', contactNumber: '', workingHours: '', preferredOTs: [] });
  };

  const handleEdit = (doctor) => {
    setEditingId(doctor._id);
    setFormData({
      name: doctor.name,
      specialization: doctor.specialization,
      department: doctor.department || '',
      email: doctor.email || '',
      contactNumber: doctor.contactNumber,
      workingHours: doctor.workingHours,
      preferredOTs: doctor.preferredOTs
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isLoading && !doctors.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (isError) {
    return <div className="text-center text-red-500 py-10">Error loading doctors.</div>;
  }

  return (
    <div className="space-y-6 text-charcoal">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-charcoal">Doctors Directory</h2>
        <div className="flex gap-4 w-full md:w-auto">
           <button
            onClick={() => {
              setShowForm(!showForm);
              resetForm();
            }}
            className="bg-primary text-surface px-6 py-2 rounded-lg hover:brightness-110 shadow-sm transition-all w-full md:w-auto font-medium"
          >
            {showForm ? 'Close Form' : 'Add New Doctor'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-surface p-6 rounded-xl shadow-md mb-6 border border-gray-100">
          <h3 className="text-xl font-semibold mb-4 text-charcoal">{editingId ? 'Edit Doctor' : 'Add New Doctor'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  required
                  placeholder="Dr. Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Specialization</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  required
                  placeholder="e.g. Cardiology"
                  value={formData.specialization}
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                />
              </div>
               <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  required
                  placeholder="Department Name"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                />
              </div>
               <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Number</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  required
                  placeholder="+1 234 567 890"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Working Hours</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  required
                  placeholder="09:00 - 17:00"
                  value={formData.workingHours}
                  onChange={(e) => setFormData({...formData, workingHours: e.target.value})}
                />
              </div>
             </div>
            <button 
              type="submit" 
              disabled={mutation.isPending}
              className="bg-success text-surface px-6 py-2 rounded-lg hover:brightness-110 font-bold transition-all shadow-sm w-full md:w-auto flex items-center justify-center gap-2"
            >
              {mutation.isPending && <Loader2 className="animate-spin" size={18} />}
              {editingId ? 'Update' : 'Save'} Doctor
            </button>
          </form>
        </div>
      )}

      <div className="bg-surface shadow-md rounded-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-background">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal uppercase tracking-wider">Specialization</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-gray-200">
              {doctors.length > 0 ? doctors.map((doctor) => (
                <tr key={doctor._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-charcoal">{doctor.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-charcoal">{doctor.specialization}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-charcoal">{doctor.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-charcoal">{doctor.contactNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(doctor)}
                      className="text-primary hover:text-blue-800 font-medium"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              )) : (
                  <tr>
                      <td colSpan="5" className="text-center py-4 text-gray-500">No doctors found</td>
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
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
                >
                    Previous
                </button>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
                >
                    Next
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Doctors;
