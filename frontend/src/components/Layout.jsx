import { useContext, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-blue-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold">
                Hospital OT Scheduler
              </Link>
              {/* Desktop Menu */}
              {user && (
                <div className="hidden md:block ml-10 flex items-baseline space-x-4">
                  <Link to="/" className="px-3 py-2 rounded-md hover:bg-blue-700">Dashboard</Link>
                  <Link to="/surgeries" className="px-3 py-2 rounded-md hover:bg-blue-700">Surgeries</Link>
                  {user.role === 'ADMIN' && (
                    <>
                       <Link to="/doctors" className="px-3 py-2 rounded-md hover:bg-blue-700">Doctors</Link>
                       <Link to="/patients" className="px-3 py-2 rounded-md hover:bg-blue-700">Patients</Link>
                       <Link to="/ots" className="px-3 py-2 rounded-md hover:bg-blue-700">OTs</Link>
                       <Link to="/resources" className="px-3 py-2 rounded-md hover:bg-blue-700">Resources</Link>
                       <Link to="/reports" className="px-3 py-2 rounded-md hover:bg-blue-700">Reports</Link>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {/* User Profile & Logout (Desktop) */}
            <div className="hidden md:block">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span>{user.name} ({user.role})</span>
                  <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded">
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100">
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                type="button"
                className="bg-blue-700 inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-blue-800 focus:outline-none"
              >
                <span className="sr-only">Open main menu</span>
                {!isMobileMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {user && (
                <>
                  <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">Dashboard</Link>
                  <Link to="/surgeries" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">Surgeries</Link>
                  {user.role === 'ADMIN' && (
                    <>
                       <Link to="/doctors" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">Doctors</Link>
                       <Link to="/patients" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">Patients</Link>
                       <Link to="/ots" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">OTs</Link>
                       <Link to="/resources" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">Resources</Link>
                       <Link to="/reports" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">Reports</Link>
                    </>
                  )}
                  <div className="border-t border-blue-700 pt-4 pb-3">
                    <div className="flex items-center px-5">
                      <div className="ml-3">
                        <div className="text-base font-medium leading-none text-white">{user.name}</div>
                        <div className="text-sm font-medium leading-none text-blue-300">{user.role}</div>
                      </div>
                      <button onClick={handleLogout} className="ml-auto bg-red-500 hover:bg-red-600 px-3 py-1 rounded">
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
               {!user && (
                   <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">Login</Link>
               )}
            </div>
          </div>
        )}
      </nav>
      <main className="flex-grow bg-gray-100 p-4">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
