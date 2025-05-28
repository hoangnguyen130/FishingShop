import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Search from '../../Search/Search';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingCart, 
  faUser, 
  faSignOutAlt, 
  faHome,
  faFish,
  faTools,
  faBox,
  faUserEdit,
  faClipboardList,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import defaultAvatar from '~/assets/imgs/default-avatar.webp';

// Logout Confirmation Modal Component
const LogoutConfirmation = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Xác nhận đăng xuất</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn đăng xuất không?</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};

function Header() {
  const [showbg, setShowbg] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState(defaultAvatar);
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy thông tin người dùng từ API
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const userId = sessionStorage.getItem('userId');
    if (!token || !userId) {
      setCartCount(0);
      return;
    }
    setIsAuthenticated(true);

    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/v1/auth/profile?userId=${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserAvatar(response.data.user.avatar || defaultAvatar);
      } catch (err) {
        console.error('Lỗi khi lấy thông tin người dùng:', err);
        setUserAvatar(defaultAvatar);
      }
    };

    fetchUserProfile();
  }, []);

  // Lấy số lượng sản phẩm trong giỏ hàng từ API
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      setCartCount(0);
      return;
    }
    setIsAuthenticated(true);

    const updateCartCount = async () => {
      try {
        const response = await axios.get('http://localhost:3001/v1/products/cart', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const totalItems = response.data.items.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(totalItems);
      } catch (err) {
        console.error('Lỗi khi lấy giỏ hàng:', err);
        setCartCount(0);
      }
    };

    updateCartCount();
  }, []);

  useEffect(() => {
    const handlerScroll = () => {
      if (window.scrollY >= 0) {
        setShowbg(true);
      } else {
        setShowbg(false);
      }
    };
    window.addEventListener('scroll', handlerScroll);

    return () => {
      window.removeEventListener('scroll', handlerScroll);
    };
  }, []);

  const handleUserMenuClick = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('userName');
    setIsAuthenticated(false);
    sessionStorage.removeItem('userName');
    setIsAuthenticated(false);
    setCartCount(0);
    toast.success('Đã đăng xuất thành công!');
    setIsUserMenuOpen(false);
    setIsLogoutModalOpen(false);
  };

  const handleMenuClick = (action) => {
    switch (action) {
      case 'profile':
        navigate('/user');
        break;
      case 'orders':
        navigate('/orders');
        break;
      case 'logout':
        setIsLogoutModalOpen(true);
        break;
      default:
        break;
    }
    setIsUserMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: '/', label: 'Trang chủ', icon: faHome },
    { path: '/cancau', label: 'Cần câu', icon: faFish },
    { path: '/docau', label: 'Đồ câu', icon: faTools },
    { path: '/phukien', label: 'Phụ kiện', icon: faBox }
  ];

  return (
    <>
      <header 
        className={`w-full fixed top-0 left-0 z-50 transition-all duration-300 ${
          showbg ? 'bg-blue-600 shadow-md' : 'bg-transparent'
        }`}
      >
        <div className="max-w-screen-xl mx-auto py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              {/* <img src="/logo.png" alt="Logo" className="h-12 w-auto" /> */}
              <span className="text-xl items-center justify-center font-bold text-white mr-8">HN Fishing</span>
            </Link>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    isActive(link.path)
                      ? 'text-white bg-blue-700'
                      : 'text-gray-100 hover:text-white hover:bg-blue-700'
                  }`}
                >
                  <FontAwesomeIcon icon={link.icon} className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>

            {/* Search bar */}
            <div className="flex-1 max-w-xl mx-4">
              <Search />
            </div>

            {/* Cart and User */}
            <div className="flex items-center space-x-4">
              {/* Cart */}
              <Link to="/cart" className="relative group">
                <div className="p-2 rounded-full hover:bg-blue-700 transition-colors">
                  <FontAwesomeIcon 
                    icon={faShoppingCart} 
                    className={`text-xl ${isActive('/cart') ? 'text-white' : 'text-gray-100'}`} 
                  />
                  {isAuthenticated && cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </div>

              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={handleUserMenuClick}
                    className="flex items-center space-x-2 p-2 rounded-full hover:bg-blue-700 transition-colors group"
                  >
                    <div className="relative">
                      <img
                        className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-md hover:shadow-lg transition-all duration-300"
                        src={userAvatar}
                        alt="User Avatar"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = defaultAvatar;
                        }}
                      />
                      <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                    </div>
                  </button>
                  
                  {/* User Menu Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <img
                            className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover"
                            src={userAvatar}
                            alt="User Avatar"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = defaultAvatar;
                            }}
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{sessionStorage.getItem('userName')}</p>
                            <p className="text-xs text-gray-500">{sessionStorage.getItem('email')}</p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleMenuClick('profile')}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <FontAwesomeIcon icon={faUserEdit} className="w-4 h-4 mr-3 text-blue-500" />
                        Thay đổi thông tin
                      </button>
                      <button
                        onClick={() => handleMenuClick('orders')}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <FontAwesomeIcon icon={faClipboardList} className="w-4 h-4 mr-3 text-blue-500" />
                        Đơn hàng
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={() => handleMenuClick('logout')}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4 mr-3" />
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/sign-in"
                  className="flex items-center space-x-2 px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <FontAwesomeIcon icon={faUser} />
                  <span>Đăng nhập</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmation
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}

export default Header;