import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import Modal from 'react-modal';
import toast, { Toaster } from 'react-hot-toast';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import API from '../services/api';

// PDF Imports
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const localizer = momentLocalizer(moment);

Modal.setAppElement('#root'); // Accessibility

const SurgeryScheduler = () => {
  const [events, setEvents] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editingSurgeryId, setEditingSurgeryId] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [ots, setOTs] = useState([]);

  // Fetch Data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [surgeriesRes, doctorsRes, patientsRes, otsRes] = await Promise.all([
        API.get('/surgeries?limit=1000'), // Calendar: Fetch many
        API.get('/doctors?limit=1000'), // Dropdowns: Needs all
        API.get('/patients?limit=1000'), // Dropdowns: Needs all
        API.get('/ots?limit=1000') // Dropdowns: Needs all
      ]);

      // Helper to extract data (Array vs Paginated Object)
      const extractData = (res) => Array.isArray(res.data) ? res.data : res.data[Object.keys(res.data)[0]]; // Just grab the first key which usually matches e.g. 'patients' or 'surgeries'
      
      // Better explicit extraction
      const getList = (res, key) => Array.isArray(res.data) ? res.data : (res.data[key] || []);

      const surgeries = getList(surgeriesRes, 'surgeries');
      const docsList = getList(doctorsRes, 'doctors');
      const patientsList = getList(patientsRes, 'patients');
      const otsList = getList(otsRes, 'ots');

      const formattedEvents = surgeries.map(s => ({
        id: s._id,
        title: `Surgery (${s.patient.name}) - ${s.operationTheatre.name}`,
        start: new Date(s.startDateTime),
        end: new Date(s.endDateTime),
        resource: s
      }));

      setEvents(formattedEvents);
      setDoctors(docsList);
      setPatients(patientsList);
      setOTs(otsList);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load data ' + error.message);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text('Surgery Schedule', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${moment().format('MMMM Do YYYY, h:mm:ss a')}`, 14, 30);

    // Table
    const tableColumn = ["Date", "Time", "Patient", "Doctor", "OT", "Status", "Priority"];
    const tableRows = [];

    // Sort by date
    const sortedEvents = [...events].sort((a,b) => new Date(a.start) - new Date(b.start));

    sortedEvents.forEach(event => {
      const s = event.resource;
      const surgeryData = [
        moment(s.startDateTime).format('YYYY-MM-DD'),
        `${moment(s.startDateTime).format('HH:mm')} - ${moment(s.endDateTime).format('HH:mm')}`,
        s.patient?.name || 'Unknown',
        s.doctor?.name || 'Unknown',
        s.operationTheatre?.name || 'Unassigned',
        s.status,
        s.priority
      ];
      tableRows.push(surgeryData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
    });

    doc.save('surgery_schedule.pdf');
    toast.success('Schedule exported successfully!');
  };

  // Form Validation Schema
  const validationSchema = Yup.object({
    patient: Yup.string().required('Patient is required'),
    doctor: Yup.string().required('Doctor is required'),
    operationTheatre: Yup.string().required('OT is required'),
    date: Yup.date().required('Date is required'),
    startTime: Yup.string().required('Start Time is required'),
    endTime: Yup.string().required('End Time is required'),
    priority: Yup.string().oneOf(['Normal', 'Emergency']),
    anesthesiaType: Yup.string()
  });

  const formik = useFormik({
    initialValues: {
      patient: '',
      doctor: '',
      operationTheatre: '',
      date: '',
      startTime: '',
      endTime: '',
      priority: 'Normal',
      anesthesiaType: 'General'
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (editingSurgeryId) {
            await API.put(`/surgeries/${editingSurgeryId}`, values);
            toast.success('Surgery Updated Successfully');
        } else {
            await API.post('/surgeries', values);
            toast.success('Surgery Scheduled Successfully');
        }
        setModalIsOpen(false);
        setEditingSurgeryId(null); // Reset
        formik.resetForm();
        fetchData(); 
      } catch (error) {
        toast.error(error.response?.data?.message || 'Operation Failed');
      }
    }
  });

  // Check Availability when time changes (Moved after formik init)
  useEffect(() => {
    const checkAvailability = async () => {
        const { date, startTime, endTime } = formik.values;
        if (date && startTime && endTime) {
            try {
                const { data } = await API.get(`/ots/available?date=${date}&startTime=${startTime}&endTime=${endTime}`);
                setOTs(data);
                
                // If current selection is invalid, reset it
                if (formik.values.operationTheatre) {
                      const isAvailable = data.find(ot => ot._id === formik.values.operationTheatre);
                      if (!isAvailable) {
                          toast.error('Selected OT is not available at this time.');
                          formik.setFieldValue('operationTheatre', '');
                      }
                }
            } catch (error) {
                console.error('Error fetching available OTs', error);
            }
        }
    };
    checkAvailability();
  }, [formik.values.date, formik.values.startTime, formik.values.endTime]);

  // Details Modal State
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailsModalIsOpen, setDetailsModalIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'tracking'

  /* Tracking State */
  const [trackingData, setTrackingData] = useState(null);
  const [newTracking, setNewTracking] = useState({
       preOpChecklist: { patientConsent: false, anesthesiaCheck: false, fastingComplete: false },
       postOpNotes: '',
       recoveryStatus: 'Stable'
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchTracking = async (surgeryId) => {
      try {
          const { data } = await API.get(`/surgery-tracking/${surgeryId}`);
          if(data) {
              setTrackingData(data);
              setNewTracking({
                  preOpChecklist: data.preOpChecklist || { patientConsent: false, anesthesiaCheck: false, fastingComplete: false },
                  postOpNotes: data.postOpNotes || '',
                  recoveryStatus: data.recoveryStatus || 'Stable'
              });
          }
      } catch (error) {
          // No tracking data yet, use defaults
          setTrackingData(null);
          setNewTracking({
               preOpChecklist: { patientConsent: false, anesthesiaCheck: false, fastingComplete: false },
               postOpNotes: '',
               recoveryStatus: 'Stable'
          });
      }
  };

  const saveTracking = async () => {
      try {
          const formData = new FormData();
          formData.append('surgeryId', selectedEvent.id);
          formData.append('preOpChecklist', JSON.stringify(newTracking.preOpChecklist));
          formData.append('postOpNotes', newTracking.postOpNotes);
          formData.append('recoveryStatus', newTracking.recoveryStatus);
          
          if (selectedFile) {
            formData.append('file', selectedFile);
          }

          await API.post('/surgery-tracking', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          toast.success('Tracking info updated!');
          setSelectedFile(null); // Reset file input
          fetchTracking(selectedEvent.id);
      } catch (e) {
          console.error(e);
          toast.error('Failed to update tracking');
      }
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setDetailsModalIsOpen(true);
    setActiveTab('details');
    fetchTracking(event.id);
  };

  const handleEditSurgery = () => {
    if (!selectedEvent) return;
    const s = selectedEvent.resource;
    setEditingSurgeryId(selectedEvent.id); // Set ID
    formik.setValues({
      patient: s.patient._id,
      doctor: s.doctor._id,
      operationTheatre: s.operationTheatre._id,
      date: moment(s.startDateTime).format('YYYY-MM-DD'),
      startTime: moment(s.startDateTime).format('HH:mm'),
      endTime: moment(s.endDateTime).format('HH:mm'),
      priority: s.priority || 'Normal',
      anesthesiaType: s.anesthesiaType || ''
    });
    setDetailsModalIsOpen(false);
    setModalIsOpen(true);
  };

  const handleCompleteSurgery = async () => {
      if (!selectedEvent) return;
      try {
          await API.put(`/surgeries/${selectedEvent.id}`, { status: 'Completed' });
          toast.success('Surgery Marked Completed');
          setDetailsModalIsOpen(false);
          fetchData();
      } catch (error) {
          toast.error('Failed to update status');
      }
  };

  const handleCancelSurgery = async () => {
    if (!selectedEvent) return;
    if (!window.confirm(`Are you sure you want to cancel surgery for ${selectedEvent.title}?`)) return;

    try {
      // Soft Delete (Status Update) preferred over Delete
      await API.put(`/surgeries/${selectedEvent.id}`, { status: 'Cancelled' });
      toast.success('Surgery Cancelled');
      setDetailsModalIsOpen(false);
      fetchData();
    } catch (error) {
       toast.error('Failed to cancel surgery');
    }
  };

  const eventStyleGetter = (event, start, end, isSelected) => {
    let backgroundColor = '#1e293b'; // Primary (Navy)
    const status = event.resource.status;
    const priority = event.resource.priority;

    if (status === 'Cancelled') {
        backgroundColor = '#475569'; // Slate (Cancelled)
    } else if (status === 'Completed') {
        backgroundColor = '#059669'; // Success (Emerald)
    } else if (status === 'Rescheduled') {
        backgroundColor = '#d97706'; // Warning (Amber/Gold)
    }

    // Emergency Override for Active Surgeries
    if (priority === 'Emergency' && status !== 'Cancelled' && status !== 'Completed') {
        backgroundColor = '#b91c1c'; // Emergency (Red)
    }

    const style = {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        textDecoration: status === 'Cancelled' ? 'line-through' : 'none',
        padding: '2px 5px',
        fontSize: '0.85em'
    };

    return { style };
  };

  return (
    <div className="h-screen flex flex-col p-4 bg-background">
      <Toaster />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-charcoal">Surgery Scheduler</h2>
        <div className="flex gap-2">
           {/* Legend */}
           <div className="flex items-center gap-3 mr-4 text-sm hidden md:flex">
                <div className="flex items-center gap-1"><span className="w-3 h-3 bg-primary rounded-full"></span> Scheduled</div>
                <div className="flex items-center gap-1"><span className="w-3 h-3 bg-emergency rounded-full"></span> Emergency</div>
                <div className="flex items-center gap-1"><span className="w-3 h-3 bg-success rounded-full"></span> Completed</div>
                <div className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-500 rounded-full"></span> Cancelled</div>
           </div>

            <button 
                onClick={handleDownloadPDF} 
                className="bg-charcoal text-surface px-4 py-2 rounded hover:bg-black transition-all flex items-center gap-2 shadow-sm"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Export Schedule
            </button>
            <button 
              onClick={() => {
                  setModalIsOpen(true);
                  setEditingSurgeryId(null);
                  formik.resetForm();
              }}
              className="bg-primary text-surface px-4 py-2 rounded hover:brightness-110 shadow-sm"
            >
              Schedule New Surgery
            </button>
        </div>
      </div>

      <div className="flex-grow bg-surface p-4 rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="flex-grow overflow-x-auto">
             <div className="min-w-[800px] h-full">
                <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%', minHeight: '500px' }}
                onSelectEvent={handleEventSelect}
                eventPropGetter={eventStyleGetter}
                />
             </div>
        </div>
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={detailsModalIsOpen}
        onRequestClose={() => setDetailsModalIsOpen(false)}
        className="relative bg-white p-6 rounded shadow-lg w-full max-w-2xl outline-none z-50 max-h-[90vh] overflow-y-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      >
        {selectedEvent && (
          <div>
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-xl font-bold">Surgery Details</h2>
                <div className="space-x-2">
                    <button 
                        className={`px-3 py-1 rounded ${activeTab === 'details' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                        onClick={() => setActiveTab('details')}
                    >
                        Info
                    </button>
                    <button 
                        className={`px-3 py-1 rounded ${activeTab === 'tracking' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                        onClick={() => setActiveTab('tracking')}
                    >
                        Pre/Post-Op Tracking
                    </button>
                </div>
            </div>

            {activeTab === 'details' ? (
                <div className="space-y-3">
                    <p><strong>Patient:</strong> {selectedEvent.resource.patient.name}</p>
                    <p><strong>Doctor:</strong> {selectedEvent.resource.doctor.name}</p> {/* Ideally map ID to Name */}
                    <p><strong>OT:</strong> {selectedEvent.resource.operationTheatre.name}</p>
                    <p><strong>Time:</strong> {moment(selectedEvent.start).format('LT')} - {moment(selectedEvent.end).format('LT')}</p>
                    <p>
                        <strong>Priority:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs text-white ${selectedEvent.resource.priority === 'Emergency' ? 'bg-red-500' : 'bg-green-500'}`}>
                            {selectedEvent.resource.priority || 'Normal'}
                        </span>
                    </p>
                    <div className="mt-6 flex justify-end space-x-2">
                        {/* Edit Button - Always visible or maybe hide for Cancelled? Let's keep it visible for rescheduling */}
                         <button 
                            onClick={handleEditSurgery}
                            className="bg-warning text-charcoal px-4 py-2 rounded hover:brightness-110"
                        >
                            Edit
                        </button>

                        {/* Complete Button - Hide if already Completed or Cancelled */}
                        {selectedEvent.resource.status !== 'Completed' && selectedEvent.resource.status !== 'Cancelled' && (
                            <button 
                                onClick={handleCompleteSurgery}
                                className="bg-success text-surface px-4 py-2 rounded hover:brightness-110"
                            >
                                Complete
                            </button>
                        )}

                        {/* Cancel Button - Hide if already Cancelled or Completed */}
                         {selectedEvent.resource.status !== 'Cancelled' && selectedEvent.resource.status !== 'Completed' && (
                            <button 
                                onClick={handleCancelSurgery}
                                className="bg-emergency text-surface px-4 py-2 rounded hover:brightness-110"
                            >
                                Cancel
                            </button>
                        )}

                        <button 
                            onClick={() => setDetailsModalIsOpen(false)}
                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                        >
                            Close
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                        <h4 className="font-semibold mb-2">Pre-Op Checklist</h4>
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" 
                                checked={newTracking.preOpChecklist.patientConsent} 
                                onChange={e => setNewTracking({...newTracking, preOpChecklist: {...newTracking.preOpChecklist, patientConsent: e.target.checked}})} 
                            />
                            <span>Patient Consent Form Signed</span>
                        </label>
                        <label className="flex items-center space-x-2 mt-1">
                             <input type="checkbox" 
                                checked={newTracking.preOpChecklist.anesthesiaCheck} 
                                onChange={e => setNewTracking({...newTracking, preOpChecklist: {...newTracking.preOpChecklist, anesthesiaCheck: e.target.checked}})} 
                            />
                            <span>Anesthesia Safety Check</span>
                        </label>
                         <label className="flex items-center space-x-2 mt-1">
                             <input type="checkbox" 
                                checked={newTracking.preOpChecklist.fastingComplete} 
                                onChange={e => setNewTracking({...newTracking, preOpChecklist: {...newTracking.preOpChecklist, fastingComplete: e.target.checked}})} 
                            />
                            <span>Fasting Protocol Complete</span>
                        </label>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">Post-Op Notes</h4>
                        <textarea 
                            className="w-full border rounded p-2" 
                            rows="3"
                            value={newTracking.postOpNotes} 
                            onChange={e => setNewTracking({...newTracking, postOpNotes: e.target.value})}
                        ></textarea>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">Recovery Status</h4>
                        <select 
                            className="w-full border rounded p-2"
                            value={newTracking.recoveryStatus} 
                            onChange={e => setNewTracking({...newTracking, recoveryStatus: e.target.value})}
                        >
                            <option value="Stable">Stable</option>
                            <option value="Recovering">Recovering</option>
                            <option value="Critical">Critical</option>
                            <option value="Discharged">Discharged</option>
                        </select>
                    </div>

                    {/* File Attachments */}
                    <div className="border-t pt-4 mt-4">
                        <h4 className="font-semibold mb-2">Medical Reports / Attachments</h4>
                        
                        {/* List Existing Attachments */}
                        {trackingData && trackingData.attachments && trackingData.attachments.length > 0 && (
                            <ul className="mb-4 space-y-2">
                                {trackingData.attachments.map((file, index) => (
                                    <li key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-blue-600 font-bold">📎</span>
                                            <a 
                                                href={`http://localhost:5000/${file.filePath.replace(/\\/g, '/')}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline text-sm"
                                            >
                                                {file.fileName}
                                            </a>
                                        </div>
                                        <span className="text-xs text-gray-500">{new Date(file.uploadDate).toLocaleDateString()}</span>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* Upload New File */}
                        <div className="flex items-center gap-2">
                            <input 
                                type="file" 
                                onChange={(e) => setSelectedFile(e.target.files[0])}
                                className="text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                            />
                            {selectedFile && (
                                <span className="text-xs text-green-600 font-semibold">Selected: {selectedFile.name}</span>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-2">
                         <button 
                            onClick={saveTracking}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Save Tracking Info
                        </button>
                         <button 
                            onClick={() => setDetailsModalIsOpen(false)}
                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="relative bg-white p-8 rounded shadow-lg w-full max-w-lg outline-none max-h-[90vh] overflow-y-auto z-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      >
        <h2 className="text-xl font-bold mb-4">{editingSurgeryId ? 'Edit Surgery' : 'Schedule Surgery'}</h2>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          
          {/* Patient Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Patient</label>
            <select 
              name="patient"
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
              onChange={(e) => {
                  formik.handleChange(e);
                  const pid = e.target.value;
                  const foundPatient = patients.find(p => p._id === pid);
                  if (foundPatient && foundPatient.assignedDoctor) {
                      formik.setFieldValue('doctor', foundPatient.assignedDoctor);
                  }
              }}
              value={formik.values.patient}
            >
              <option value="">Select Patient</option>
              {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
            {formik.errors.patient && <div className="text-emergency text-sm mt-1">{formik.errors.patient}</div>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Doctor Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Doctor</label>
                <select 
                  name="doctor"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
                  onChange={formik.handleChange}
                  value={formik.values.doctor}
                >
                   <option value="">Select Doctor</option>
                  {doctors.map(d => <option key={d._id} value={d._id}>{d.name} ({d.specialization})</option>)}
                </select>
                 {formik.errors.doctor && <div className="text-emergency text-sm mt-1">{formik.errors.doctor}</div>}
              </div>

              {/* OT Selection */}
               <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Operation Theatre</label>
                <select 
                  name="operationTheatre"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
                  onChange={formik.handleChange}
                  value={formik.values.operationTheatre}
                >
                   <option value="">Select OT</option>
                  {ots.map(o => <option key={o._id} value={o._id}>{o.name} - {o.status}</option>)}
                </select>
                 {formik.errors.operationTheatre && <div className="text-emergency text-sm mt-1">{formik.errors.operationTheatre}</div>}
              </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
              <input type="date" name="date" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary focus:border-transparent" onChange={formik.handleChange} value={formik.values.date} />
            </div>
            <div className="grid grid-cols-2 md:col-span-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Start Time</label>
                  <input type="time" name="startTime" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary focus:border-transparent" onChange={formik.handleChange} value={formik.values.startTime} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">End Time</label>
                  <input type="time" name="endTime" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary focus:border-transparent" onChange={formik.handleChange} value={formik.values.endTime} />
                </div>
            </div>
          </div>
           {formik.errors.date && <div className="text-emergency text-sm mt-1">{formik.errors.date}</div>}

           {/* Priority & Anesthesia */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
                <select name="priority" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary focus:border-transparent bg-white" onChange={formik.handleChange} value={formik.values.priority}>
                  <option value="Normal">Normal</option>
                  <option value="Emergency">Emergency</option>
                </select>
             </div>
             <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Anesthesia Type</label>
                <input type="text" name="anesthesiaType" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="e.g. General" onChange={formik.handleChange} value={formik.values.anesthesiaType} />
             </div>
           </div>

          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => setModalIsOpen(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Schedule</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SurgeryScheduler;
