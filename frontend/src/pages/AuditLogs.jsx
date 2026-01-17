import { useState } from 'react';
import API from '../services/api';
import { useQuery } from '@tanstack/react-query';
import { RefreshCcw, Search } from 'lucide-react';
import moment from 'moment';

const AuditLogs = () => {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const limit = 20;

  const fetchLogs = async ({ queryKey }) => {
    const [_key, page, category, search] = queryKey;
    const { data } = await API.get(`/audit-logs`, {
        params: { page, limit, category, search }
    });
    return data;
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['auditLogs', page, category, search],
    queryFn: fetchLogs,
    keepPreviousData: true
  });

  const categories = [
    { id: 'all', label: 'All Logs' },
    { id: 'doctors', label: 'Doctors' },
    { id: 'surgeries', label: 'Surgeries' },
    { id: 'patients', label: 'Patients' },
    { id: 'ots', label: 'OTs' },
    { id: 'resources', label: 'Resources' },
    { id: 'reports', label: 'Reports' },
  ];

  if (isLoading) return <div className="p-8 text-center">Loading Logs...</div>;
  if (isError || !data) return <div className="p-8 text-center text-red-500">Failed to load logs. You might not have permission.</div>;
  
  const logs = data.logs || [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 relative">
      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
             onClick={() => setSelectedLog(null)}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200"
               onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div>
                   <h3 className="text-lg font-bold text-gray-800">Action Details</h3>
                   <p className="text-xs text-gray-500 font-mono mt-1">{selectedLog._id}</p>
                </div>
                <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600">
                    ✕
                </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="mb-4">
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Action Type</span>
                    <p className="font-medium text-gray-800 mt-1">{selectedLog.action}</p>
                </div>
                
                <div className="mb-6">
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Target</span>
                     <p className="text-sm text-gray-700 mt-1">
                        <span className="font-bold">{selectedLog.target?.collectionName}:</span> {selectedLog.target?.name}
                     </p>
                </div>

                {/* Changes Table */}
                {(() => {
                    // Helper to determine if we have a changes object
                    const payload = selectedLog.details || {};
                    const changes = payload.changes || (
                        // Legacy: check if the payload itself is a diff map (values have old/new)
                        Object.values(payload).some(v => v && typeof v === 'object' && ('old' in v || 'new' in v)) 
                        ? payload 
                        : null
                    );
                    
                    if (changes && Object.keys(changes).length > 0) {
                        return (
                            <div className="mb-6">
                                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Changes</span>
                                <div className="mt-2 border rounded-lg overflow-x-auto">
                                    <table className="w-full text-sm text-left min-w-[300px]">
                                        <thead className="bg-gray-50 text-gray-500 font-medium">
                                            <tr>
                                                <th className="px-4 py-2">Field</th>
                                                <th className="px-4 py-2 text-red-600">Old Value</th>
                                                <th className="px-4 py-2 text-green-600">New Value</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {Object.entries(changes).map(([key, val]) => (
                                                <tr key={key}>
                                                    <td className="px-4 py-2 font-medium text-gray-700">{key}</td>
                                                    <td className="px-4 py-2 text-gray-600 bg-red-50/50">
                                                        {val && typeof val === 'object' && 'old' in val ? String(val.old) : '-'}
                                                    </td>
                                                    <td className="px-4 py-2 text-gray-800 bg-green-50/50 font-medium">
                                                         {val && typeof val === 'object' && 'new' in val ? String(val.new) : String(val)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    }
                    return null;
                })()}

                <div>
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Full Payload (Snapshot)</span>
                    <div className="mt-2 bg-gray-900 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-xs text-green-400 font-mono leading-relaxed">
                            {(() => {
                                const payload = selectedLog.details || {};
                                // Use snapshot if available, otherwise fallback to full details (unless it's just the changes wrapper)
                                const textToShow = payload.snapshot || (payload.changes ? payload.changes : payload);
                                return JSON.stringify(textToShow, null, 2);
                            })()}
                        </pre>
                    </div>
                </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
                <button 
                    onClick={() => setSelectedLog(null)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                    Close
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100 gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">Audit Logs</h1>
           <p className="text-sm text-gray-500">Track all system changes and sensitive actions</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
             <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search logs..." 
                    className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-primary outline-none"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
             </div>
            <button 
                onClick={() => refetch()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition"
            >
                <RefreshCcw size={18} /> Refresh
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-gray-200 pb-1">
        {categories.map(tab => (
            <button
                key={tab.id}
                onClick={() => { setCategory(tab.id); setPage(1); }}
                className={`px-4 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap
                    ${category === tab.id 
                        ? 'bg-primary text-white shadow-sm' 
                        : 'bg-transparent text-gray-600 hover:bg-gray-100'
                    }`}
            >
                {tab.label}
            </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Action</th>
                <th className="p-4">Target</th>
                <th className="p-4 text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedLog(log)}>
                  <td className="p-4 whitespace-nowrap text-sm text-gray-600">
                    {moment(log.timestamp).format('MMM D, YYYY HH:mm:ss')}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-800">{log.actor?.name || 'Unknown'}</span>
                        <span className="text-xs text-gray-400">{log.actor?.role}</span>
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold 
                        ${log.action.includes('DELETE') ? 'bg-red-100 text-red-700' : 
                          log.action.includes('CREATE') ? 'bg-green-100 text-green-700' : 
                          'bg-blue-100 text-blue-700'}`}>
                        {log.action}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm text-gray-600">
                    <span className="font-medium">{log.target?.collectionName}</span>: {log.target?.name || log.target?.id}
                  </td>
                  <td className="p-4 text-center">
                    {log.details && Object.keys(log.details).length > 0 ? (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLog(log);
                            }}
                            className="text-primary hover:text-blue-700 text-xs font-bold underline"
                        >
                            View Details
                        </button>
                    ) : (
                        <span className="text-gray-300 text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                  <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-400">No logs found.</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */ }
        <div className="p-4 border-t border-gray-100 flex justify-between items-center">
            <button 
                disabled={page === 1}
                onClick={() => setPage(old => Math.max(old - 1, 1))}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
                Previous
            </button>
            <span className="text-sm text-gray-600">Page {data.currentPage} of {data.totalPages}</span>
            <button 
                disabled={page >= data.totalPages}
                onClick={() => setPage(old => old + 1)}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
                Next
            </button>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
