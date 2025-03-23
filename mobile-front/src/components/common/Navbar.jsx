import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from './Button';
import { Menu, X, User } from 'lucide-react';
import { ROLES } from '../../utils/constants';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const userMenuRef = React.useRef(null);

  // Close menus when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowUserMenu(false);
  };

  const isActiveLink = (path) => {
    return location.pathname === path ? 
      'border-indigo-500 text-indigo-400' : 
      'border-transparent text-gray-300 hover:border-gray-500 hover:text-gray-100';
  };

  return (
    <nav className="bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link 
              to="/" 
              className="flex-shrink-0 flex items-center text-indigo-400 font-bold text-xl"
            >
              RepairMatch
            </Link>
            
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {user.role === ROLES.CUSTOMER && (
                  <>
                    <Link
                      to="/dashboard"
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActiveLink('/dashboard')}`}
                    >
                      My Repairs
                    </Link>
                    <Link
                      to="/shops"
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActiveLink('/shops')}`}
                    >
                      Find Shops
                    </Link>
                  </>
                )}
                {user.role === ROLES.SHOP_OWNER && (
                  <Link
                    to="/shop-dashboard"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActiveLink('/shop-dashboard')}`}
                  >
                    Dashboard
                  </Link>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center">
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-gray-300 hover:text-indigo-400"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-900 flex items-center justify-center">
                      <User size={16} className="text-indigo-400" />
                    </div>
                    <span className="font-medium">{user.fullName}</span>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 py-2 bg-gray-700 rounded-md shadow-lg z-10 border border-gray-600">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Your Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-x-4">
                  <Button 
                    variant="secondary" 
                    size="small" 
                    onClick={() => navigate('/login')}
                    className="text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600"
                  >
                    Login
                  </Button>
                  <Button 
                    variant="primary" 
                    size="small" 
                    onClick={() => navigate('/register')}
                    className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500"
                  >
                    Register
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="sm:hidden p-2 rounded-md text-gray-300 hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-expanded={isOpen}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden bg-gray-700 border-t border-gray-600">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user ? (
              <>
                <div className="px-3 py-2 text-sm font-medium text-gray-300">
                  {user.fullName}
                </div>
                
                {user.role === ROLES.CUSTOMER && (
                  <>
                    <Link
                      to="/dashboard"
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        location.pathname === '/dashboard' 
                          ? 'text-indigo-400 bg-indigo-900/30' 
                          : 'text-gray-300 hover:text-indigo-400 hover:bg-gray-600'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      My Repairs
                    </Link>
                    <Link
                      to="/shops"
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        location.pathname === '/shops' 
                          ? 'text-indigo-400 bg-indigo-900/30' 
                          : 'text-gray-300 hover:text-indigo-400 hover:bg-gray-600'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      Find Shops
                    </Link>
                  </>
                )}
                {user.role === ROLES.SHOP_OWNER && (
                  <Link
                    to="/shop-dashboard"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      location.pathname === '/shop-dashboard' 
                        ? 'text-indigo-400 bg-indigo-900/30' 
                        : 'text-gray-300 hover:text-indigo-400 hover:bg-gray-600'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-indigo-400 hover:bg-gray-600"
                  onClick={() => setIsOpen(false)}
                >
                  Your Profile
                </Link>
                <Link
                  to="/settings"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-indigo-400 hover:bg-gray-600"
                  onClick={() => setIsOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-indigo-400 hover:bg-gray-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    navigate('/login');
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-indigo-400 hover:bg-gray-600"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    navigate('/register');
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-indigo-400 hover:bg-gray-600"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;