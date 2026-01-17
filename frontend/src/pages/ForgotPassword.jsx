import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';
import { Mail, KeyRound, Lock, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Step 1: Send OTP
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/auth/forgot-password', { email });
            toast.success('OTP sent to your email!');
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/auth/verify-reset-otp', { email, otp });
            toast.success('OTP Verified!');
            setStep(3);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }

        setLoading(true);
        try {
            await API.post('/auth/reset-password', { 
                email, 
                otp, 
                newPassword: passwords.newPassword 
            });
            toast.success('Password reset successfully! Please login.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-primary/5 p-6 text-center border-b border-gray-100">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                        {step === 1 && <Mail className="text-primary" size={24} />}
                        {step === 2 && <KeyRound className="text-primary" size={24} />}
                        {step === 3 && <Lock className="text-primary" size={24} />}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {step === 1 && 'Forgot Password?'}
                        {step === 2 && 'Enter OTP'}
                        {step === 3 && 'Reset Password'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-2">
                        {step === 1 && 'Enter your email to receive a verification code.'}
                        {step === 2 && `We sent a code to ${email}`}
                        {step === 3 && 'Create a new secure password.'}
                    </p>
                </div>

                <div className="p-8">
                    {/* Step 1: Email Form */}
                    {step === 1 && (
                        <form onSubmit={handleSendOTP} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                        placeholder="Enter your email"
                                        required 
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition flex items-center justify-center gap-2 font-medium"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <>Send OTP <ArrowRight size={18} /></>}
                            </button>
                        </form>
                    )}

                    {/* Step 2: OTP Form */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">One-Time Password (OTP)</label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input 
                                        type="text" 
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none tracking-widest"
                                        placeholder="Enter 6-digit OTP"
                                        required 
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition flex items-center justify-center gap-2 font-medium"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <>Verify OTP <CheckCircle2 size={18} /></>}
                            </button>
                            <button 
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
                            >
                                Change Email
                            </button>
                        </form>
                    )}

                    {/* Step 3: New Password Form */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input 
                                            type="password" 
                                            value={passwords.newPassword}
                                            onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                            placeholder="New password"
                                            required 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input 
                                            type="password" 
                                            value={passwords.confirmPassword}
                                            onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                            placeholder="Confirm password"
                                            required 
                                        />
                                    </div>
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition flex items-center justify-center gap-2 font-medium"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Reset Password'}
                            </button>
                        </form>
                    )}
                </div>

                <div className="bg-gray-50 p-4 border-t border-gray-100 text-center">
                    <Link to="/login" className="text-sm font-semibold text-primary hover:text-blue-700 flex items-center justify-center gap-1">
                        Return to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
