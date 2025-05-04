import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Search from '../../Search/Search';
import axios from 'axios';
import SignOut from '../../SignOut';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';

function Header() {
  const [showbg, setShowbg] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);

  // Lấy số lượng sản phẩm trong giỏ hàng từ API
  useEffect(() => {
    const token = localStorage.getItem('token');
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

  const handleOpenSignOut = () => {
    setIsSignOutOpen(true);
  };

  const handleCloseSignOut = () => {
    setIsSignOutOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    localStorage.removeItem('userName');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('userName');
    setIsAuthenticated(false);
    setCartCount(0);
    toast.success('Đã đăng xuất thành công!');
    setIsSignOutOpen(false);
  };

  return (
    <header className={`w-full pb-2 ${showbg ? ' bg-orange-500' : 'bg-transparent'} fixed top-0 left-0 z-10 transition-all`}>
      <div className="max-w-screen-xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <Link to={'/'}>
            <img src={''} alt="Logo" className="w-32" />
          </Link>
        </div>

        {/* Navigation links */}
        <div className="hidden md:flex space-x-8">
          <Link to={'/'}>
            <div className="text-black text-xl hover:text-gray-300">Trang chủ</div>
          </Link>
          <Link to={'/can-cau'}>
            <div className="text-black text-xl hover:text-gray-300">Cần câu</div>
          </Link>
          <Link to='/do-cau'>
            <div className="text-black text-xl hover:text-gray-300">Đồ câu</div>
          </Link>
          <Link to='/phu-kien'>
            <div className="text-black text-xl hover:text-gray-300">Phụ kiện</div>
          </Link>
        </div>

        {/* Search bar */}
        <Search />

        {/* Cart and Login */}
        <div className="flex items-center space-x-4">
          {/* Cart */}
          <Link to="/cart">
            <div className="relative mr-6">
              <span className="text-black text-xl hover:text-red-600"><FontAwesomeIcon icon={faShoppingCart} size="xl" /></span>
              {isAuthenticated && cartCount > 0 && (
                <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
          </Link>

          {/* Check login status */}
          {localStorage.getItem('token') ? (
            <div className="flex items-center">
              <img
                className="w-10 h-10 rounded-full cursor-pointer"
                src="https://avatars.githubusercontent.com/u/91184625?v=4"
                alt="User Avatar"
                onClick={handleOpenSignOut}
              />
              <SignOut
                isOpen={isSignOutOpen}
                onClose={handleCloseSignOut}
                onLogout={handleLogout}
              />
            </div>
          ) : (
            <div className="hidden md:block">
              <Link to='/sign-in'>
                <button className="bg-black text-white py-2 px-4 rounded-md hover:bg-red-500 transition duration-300">
                  Sign in
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;