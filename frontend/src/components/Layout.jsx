import { useContext, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavLink = ({ to, children }) => (
    <Link 
        to={to} 
        className="px-3 py-2 rounded-md hover:bg-black/20 hover:text-white transition-all duration-200 text-sm font-medium"
    >
        {children}
    </Link>
  );

  const MobileNavLink = ({ to, children }) => (
      <Link 
        to={to} 
        onClick={() => setIsMobileMenuOpen(false)} 
        className="block px-4 py-3 rounded-md text-base font-medium hover:bg-black/20 hover:pl-6 transition-all duration-200"
      >
        {children}
      </Link>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-charcoal transition-colors duration-300">
      <nav className="bg-primary text-surface shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {/* Logo Icon maybe? */}
              <Link to="/" className="text-xl font-extrabold tracking-wide flex items-center gap-2">
                 🏥 <span className="hidden sm:inline">Hospital OT Scheduler</span>
                 <span className="sm:hidden">OT Scheduler</span>
              </Link>
              
              {/* Desktop Menu */}
              {user && (
                <div className="hidden md:flex ml-10 items-baseline space-x-2">
                  <NavLink to="/">Dashboard</NavLink>
                  <NavLink to="/surgeries">Surgeries</NavLink>
                  {user.role === 'ADMIN' && (
                    <>
                       <NavLink to="/doctors">Doctors</NavLink>
                       <NavLink to="/patients">Patients</NavLink>
                       <NavLink to="/ots">OTs</NavLink>
                       <NavLink to="/resources">Resources</NavLink>
                       <NavLink to="/reports">Reports</NavLink>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {/* User Profile & Logout (Desktop) */}
            <div className="hidden md:block">
              {user ? (
                <div className="flex items-center space-x-4 bg-black/10 px-4 py-1.5 rounded-full">
                  <span className="text-sm font-medium">{user.name} <span className="opacity-75 text-xs">({user.role})</span></span>
                  <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-xs font-bold uppercase tracking-wide transition-colors shadow-sm">
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" className="bg-white text-primary px-4 py-1.5 rounded font-bold hover:bg-gray-100 transition-colors shadow-sm">
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-surface hover:bg-black/20 focus:outline-none transition-colors"
              >
                <span className="sr-only">Open main menu</span>
                {!isMobileMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-primary/95 backdrop-blur-sm shadow-inner">
            {user && (
              <>
                <MobileNavLink to="/">Dashboard</MobileNavLink>
                <MobileNavLink to="/surgeries">Surgeries</MobileNavLink>
                {user.role === 'ADMIN' && (
                  <>
                     <MobileNavLink to="/doctors">Doctors</MobileNavLink>
                     <MobileNavLink to="/patients">Patients</MobileNavLink>
                     <MobileNavLink to="/ots">OTs</MobileNavLink>
                     <MobileNavLink to="/resources">Resources</MobileNavLink>
                     <MobileNavLink to="/reports">Reports</MobileNavLink>
                  </>
                )}
                <div className="border-t border-white/20 pt-4 pb-3 mt-2">
                  <div className="flex items-center px-4 justify-between">
                    <div>
                      <div className="text-base font-bold leading-none text-white">{user.name}</div>
                      <div className="text-xs font-medium leading-none text-blue-200 mt-1">{user.role}</div>
                    </div>
                    <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm font-bold shadow-sm">
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
             {!user && (
                 <MobileNavLink to="/login">Login</MobileNavLink>
             )}
          </div>
        </div>
      </nav>
      <main className="flex-grow p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
