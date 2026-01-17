import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'USER' });
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      // Success Message as requested
      alert("Account created successfully!\n\nNOTE: You are currently assigned as a 'User/Staff'.\n\nPlease wait for the Super Admin to assign you a specific role (Doctor/Admin) if applicable.\n\nYou can now use your account as a normal user.");
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8 bg-surface rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-charcoal">Sign Up</h2>
        {error && <div className="text-emergency text-center">{error}</div>}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-primary focus:border-primary"
            required
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email address"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-primary focus:border-primary"
            required
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-primary focus:border-primary"
            required
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <button type="submit" className="w-full py-2 px-4 bg-primary text-surface rounded hover:brightness-110 transition-all font-semibold shadow-md">
            Create Account
          </button>
        </form>
        <div className="text-center">
          <Link to="/login" className="text-primary hover:text-blue-800 transition-colors">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
