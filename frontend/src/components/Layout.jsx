import { useContext, useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Menu, X, LayoutDashboard, Calendar, Stethoscope, Users, BedDouble, Package, FileText, LogOut, ChevronLeft } from 'lucide-react';
import ProfileModal from './ProfileModal';

const NavItem = ({ to, icon: Icon, children, setIsMobileMenuOpen, location }) => {
  const isActive = location.pathname === to;
  return (
    <Link 
      to={to} 
      onClick={() => setIsMobileMenuOpen(false)}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg mx-2 transition-all duration-200 group
        ${isActive 
          ? 'bg-white/10 text-white shadow-sm' 
          : 'text-gray-300 hover:bg-white/5 hover:text-white'
        }`}
    >
      <Icon size={20} className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
      <span className="font-medium">{children}</span>
    </Link>
  );
};

const SidebarContent = ({ user, handleLogout, setIsMobileMenuOpen, setIsProfileModalOpen, location }) => (
  <div className="flex flex-col h-full bg-primary text-surface shadow-xl w-64">
    {/* Brand */}
    <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-black/10">
      <div className="text-xl font-extrabold tracking-wide flex items-center gap-2 text-white">
          <span>🏥</span> 
          <span>OT Scheduler</span>
      </div>
      {/* Mobile Close Button */}
      <button 
        onClick={() => setIsMobileMenuOpen(false)}
        className="lg:hidden text-gray-300 hover:text-white transition-colors"
      >
        <ChevronLeft size={24} />
      </button>
    </div>

    {/* Navigation */}
    <div className="flex-1 overflow-y-auto py-6 space-y-1">
      {user && (
        <>
          <NavItem to="/" icon={LayoutDashboard} setIsMobileMenuOpen={setIsMobileMenuOpen} location={location}>Dashboard</NavItem>
          <NavItem to="/surgeries" icon={Calendar} setIsMobileMenuOpen={setIsMobileMenuOpen} location={location}>Surgeries</NavItem>
          {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
            <>
               <NavItem to="/doctors" icon={Stethoscope} setIsMobileMenuOpen={setIsMobileMenuOpen} location={location}>Doctors</NavItem>
               <NavItem to="/patients" icon={Users} setIsMobileMenuOpen={setIsMobileMenuOpen} location={location}>Patients</NavItem>
               <NavItem to="/ots" icon={BedDouble} setIsMobileMenuOpen={setIsMobileMenuOpen} location={location}>OTs</NavItem>
               <NavItem to="/resources" icon={Package} setIsMobileMenuOpen={setIsMobileMenuOpen} location={location}>Resources</NavItem>
               <NavItem to="/reports" icon={FileText} setIsMobileMenuOpen={setIsMobileMenuOpen} location={location}>Reports</NavItem>
            </>
          )}
          {user.role === 'SUPER_ADMIN' && (
             <NavItem to="/audit-logs" icon={FileText} setIsMobileMenuOpen={setIsMobileMenuOpen} location={location}>Audit Logs</NavItem>
          )}
        </>
      )}
      {!user && (
         <NavItem to="/login" icon={LogOut} setIsMobileMenuOpen={setIsMobileMenuOpen} location={location}>Login</NavItem>
      )}
    </div>

    {/* User & Logout */}
    {user && (
      <div className="p-4 border-t border-white/10 bg-black/10">
        <div 
          className="flex items-center gap-3 mb-3 px-2 cursor-pointer hover:bg-white/10 p-2 rounded-lg transition-colors group"
          onClick={() => setIsProfileModalOpen(true)}
          title="Edit Profile"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white group-hover:bg-white/30 transition">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden">
             <p className="text-sm font-semibold text-white truncate">{user.name || 'User'}</p>
             <p className="text-xs text-gray-400 capitalize">{user.role || 'Guest'}</p>
          </div>
          {/* Edit Hint Icon */}
          <div className="ml-auto opacity-0 group-hover:opacity-100 transition text-gray-300">
              <Menu size={14} className="rotate-90" />
          </div>
        </div>
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center justify-center gap-2 bg-red-600/90 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    )}
  </div>
);

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Profile Modal */}
      <ProfileModal 
         isOpen={isProfileModalOpen} 
         onRequestClose={() => setIsProfileModalOpen(false)} 
      />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-shrink-0 transition-all duration-300">
        <SidebarContent 
            user={user} 
            handleLogout={handleLogout} 
            setIsMobileMenuOpen={setIsMobileMenuOpen} 
            setIsProfileModalOpen={setIsProfileModalOpen}
            location={location}
        />
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} w-64 z-50 transition-transform duration-300 ease-in-out lg:hidden`}>
         <SidebarContent 
            user={user} 
            handleLogout={handleLogout} 
            setIsMobileMenuOpen={setIsMobileMenuOpen} 
            setIsProfileModalOpen={setIsProfileModalOpen}
            location={location}
         />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full w-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-primary text-white flex items-center justify-between px-4 shadow-md flex-shrink-0 z-20 transition-all sticky top-0">
           <div className="flex items-center gap-3">
             <button 
               onClick={() => setIsMobileMenuOpen(true)}
               className="p-2 -ml-2 rounded-md hover:bg-white/10 focus:outline-none text-white"
             >
               <Menu size={28} />
             </button>
             <span className="font-bold text-lg">Hospital OT Scheduler</span>
           </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full">
           <div className="max-w-7xl mx-auto">
             <Outlet />
           </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
