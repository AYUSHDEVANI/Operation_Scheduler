import { useState, useContext } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-hot-toast';
import { X, User, Lock, Mail, ShieldAlert } from 'lucide-react';
import API from '../services/api';
import AuthContext from '../context/AuthContext';

Modal.setAppElement('#root');

const ProfileModal = ({ isOpen, onRequestClose }) => {
  const { user, login } = useContext(AuthContext); // Re-login to update context if needed
  const [activeTab, setActiveTab] = useState('profile');

  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Security State
  const [step, setStep] = useState('request'); // request, verify
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const { data } = await API.put('/auth/profile', { name });
      
      // Update local user context (hacky but works for now without full re-fetch)
      const updatedUser = { ...user, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // Ideally call a setUser method from context, assuming login updates it
      login(updatedUser); 
      
      toast.success('Profile updated successfully');
      onRequestClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleRequestOTP = async () => {
    setIsSendingOTP(true);
    try {
      await API.post('/auth/request-otp');
      toast.success('OTP sent to your email');
      setStep('verify');
    } catch (error) {
      toast.error('Failed to send OTP');
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyAndChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
        toast.error("Passwords don't match");
        return;
    }
    setIsVerifying(true);
    try {
        await API.post('/auth/verify-otp', { otp, newPassword });
        toast.success('Password changed successfully! Please login again.');
        onRequestClose();
        // Optional: Logout user
    } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to verify OTP');
    } finally {
        setIsVerifying(false);
    }
  };

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 outline-none overflow-hidden"
      overlayClassName="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm"
    >
      {/* Header */}
      <div className="bg-primary px-6 py-4 flex justify-between items-center text-white">
        <h2 className="text-lg font-bold flex items-center gap-2">
            <User size={20} /> User Profile
        </h2>
        <button onClick={onRequestClose} className="hover:bg-white/20 p-1 rounded-full transition"><X size={20} /></button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button 
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'profile' ? 'text-primary border-b-2 border-primary bg-blue-50' : 'text-gray-500 hover:text-gray-700'}`}
        >
            Details
        </button>
        <button 
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'security' ? 'text-primary border-b-2 border-primary bg-blue-50' : 'text-gray-500 hover:text-gray-700'}`}
        >
            Security
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input 
                            type="email" 
                            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                            value={user.email}
                            disabled
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-1">Email cannot be changed directly.</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <div className="relative">
                        <ShieldAlert className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed capitalize"
                            value={user.role}
                            disabled
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button 
                        type="submit" 
                        disabled={isUpdatingProfile}
                        className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:brightness-110 shadow-sm disabled:opacity-70 flex justify-center gap-2"
                    >
                        {isUpdatingProfile ? 'Updating...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        )}

        {activeTab === 'security' && (
            <div>
                {step === 'request' ? (
                    <div className="text-center space-y-4 py-4">
                        <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-primary">
                            <Lock size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Change Password</h3>
                        <p className="text-gray-500 text-sm px-4">
                            To protect your account, we will send a One-Time Password (OTP) to your registered email <strong>{user.email}</strong>.
                        </p>
                        <button 
                            onClick={handleRequestOTP}
                            disabled={isSendingOTP}
                            className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:brightness-110 shadow-sm disabled:opacity-70"
                        >
                            {isSendingOTP ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleVerifyAndChangePassword} className="space-y-4">
                         <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3 text-sm text-blue-800 mb-4">
                            <ShieldAlert size={18} className="mt-0.5 shrink-0" />
                            <p>An OTP has been sent to your email. It expires in 10 minutes.</p>
                        </div>

                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary text-center tracking-[0.5em] font-mono text-lg"
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input 
                                type="password" 
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Min 6 characters"
                                required
                                minLength={6}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <input 
                                type="password" 
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        
                         <div className="pt-2 flex gap-3">
                            <button 
                                type="button"
                                onClick={() => setStep('request')}
                                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300"
                            >
                                Back
                            </button>
                            <button 
                                type="submit" 
                                disabled={isVerifying}
                                className="flex-[2] bg-primary text-white py-2 rounded-lg font-semibold hover:brightness-110 shadow-sm disabled:opacity-70"
                            >
                                {isVerifying ? 'Verifying...' : 'Reset Password'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        )}
      </div>
    </Modal>
  );
};

export default ProfileModal;
