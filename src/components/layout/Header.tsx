import { FiLogOut, FiUser } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const Header = () => {
  const { logout, currentUser } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [adminName, setAdminName] = useState<string | null>(null);

  useEffect(() => {
    // Get admin data from session storage
    const storedAdmin = sessionStorage.getItem('currentAdmin');
    if (storedAdmin) {
      try {
        const parsedData = JSON.parse(storedAdmin);
        setAdminName(parsedData.name);
      } catch (error) {
        console.error('Error parsing admin data:', error);
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      await logout();
      console.log('Logged out successfully');
      
      // Clear session storage manually to ensure it's cleared
      sessionStorage.removeItem('currentAdmin');
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setShowDropdown(prev => !prev);
  };

  // Get the first letter of the admin name for the avatar
  const getInitial = () => {
    if (adminName) {
      return adminName.charAt(0).toUpperCase();
    }
    return currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : <FiUser />;
  };

  return (
    <header className="bg-white shadow-sm h-16 fixed top-0 right-0 left-0 lg:left-64 z-10">
      <div className="flex items-center justify-between h-full px-4">
        <h1 className="text-xl font-semibold text-gray-800 lg:hidden">
          Admin Dashboard
        </h1>
        
        <div className="relative ml-auto" ref={dropdownRef}>
          <div 
            className="flex items-center cursor-pointer p-2 rounded-full "
            onClick={toggleDropdown}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
              <FiUser size={18} />
            </div>
          </div>
          
          {showDropdown && (
            <div 
              className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-20"
            >
              <Link 
                href="/profile" 
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                onClick={() => setShowDropdown(false)}
              >
                <FiUser className="mr-2" /> View Profile
              </Link>
              <button 
                onClick={() => {
                  handleLogout();
                  setShowDropdown(false);
                }} 
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <FiLogOut className="mr-2" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 