import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { toast } from 'react-toastify';

function SignInLayout() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  if (token) {
    navigate('/');
  }

  const initValue = {
    userName: '',
    email: '',
    password: '',
  };
  const initLoginValue = {
    email: '',
    password: '',
  };
  const [registerForm, setRegisterForm] = useState(false);
  const [formRegisterValue, setFormRegisterValue] = useState(initValue);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formLoginValue, setFormLoginValue] = useState(initLoginValue);

  const handleShowRegister = () => {
    setRegisterForm(true);
  };
  const handleShowSignUp = () => {
    setRegisterForm(false);
  };
  const handleChangeRegister = (event) => {
    const { value, name } = event.target;
    setFormRegisterValue({
      ...formRegisterValue,
      [name]: value,
    });
  };
  const handleChangeConfirmPassword = (event) => {
    setConfirmPassword(event.target.value);
  };
  const handleChangeLogin = (event) => {
    const { value, name } = event.target;
    setFormLoginValue({
      ...formLoginValue,
      [name]: value,
    });
  };

  const handleSubmitRegister = async (event) => {
    event.preventDefault();
    if (formRegisterValue.password !== confirmPassword) {
      toast.error('Mật khẩu và xác nhận mật khẩu không khớp!');
      return;
    }
    try {
      console.log('Gọi API đăng ký:', 'http://localhost:3001/v1/auth/register');
      const response = await axios.post('http://localhost:3001/v1/auth/register', formRegisterValue);
      const { user, token } = response.data;
      if (!user._id || typeof user._id !== 'string' || user._id.trim() === '') {
        throw new Error('ID người dùng không hợp lệ từ server');
      }
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user._id);
      localStorage.setItem('email', user.email);
      localStorage.setItem('userName', user.userName);
      toast.success('Đăng ký thành công!');
      navigate('/');
    } catch (error) {
      console.error('Lỗi đăng ký:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Lỗi khi đăng ký. Vui lòng thử lại!');
    }
  };

  const handleSubmitLogin = async (event) => {
    event.preventDefault();
    try {
      console.log('Gọi API đăng nhập:', 'http://localhost:3001/v1/auth/login');
      const response = await axios.post('http://localhost:3001/v1/auth/login', formLoginValue);
      const { user, token } = response.data;
      if (!user._id || typeof user._id !== 'string' || user._id.trim() === '') {
        throw new Error('ID người dùng không hợp lệ từ server');
      }
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user._id);
      localStorage.setItem('email', user.email);
      localStorage.setItem('userName', user.userName);
      toast.success('Đăng nhập thành công!');
      navigate('/');
    } catch (error) {
      console.error('Lỗi đăng nhập:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Lỗi khi đăng nhập. Vui lòng thử lại!');
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const response = await axios.post('http://localhost:3001/v1/auth/google-login', {
        token: credentialResponse.credential,
      });
      const { user, token } = response.data;
      if (!user._id || typeof user._id !== 'string' || user._id.trim() === '') {
        throw new Error('ID người dùng không hợp lệ từ server');
      }
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user._id);
      localStorage.setItem('email', user.email);
      localStorage.setItem('userName', user.userName);
      toast.success('Đăng nhập Google thành công!');
      navigate('/');
    } catch (error) {
      console.error('Lỗi đăng nhập Google:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Đăng nhập Google thất bại. Vui lòng thử lại!');
    }
  };

  if (registerForm) {
    return (
      <section className="modal-wrapper relative w-full h-screen">
        <div className="content-wrapper absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center min-w-96 h-auto border-solid border-2 rounded-lg py-5">
          <h2 className="header-text w-full h-auto flex justify-center text-xl pt-4 select-none">Đăng Kí</h2>
          <p className="sub-text w-full h-auto flex justify-center mt-3 text-sm opacity-50 select-none">
            Nhập thông tin của bạn!
          </p>
          <form onSubmit={handleSubmitRegister}>
            <div className="input flex flex-col justify-center items-center w-full h-auto my-7">
              <input
                className="user-name w-full h-auto size-4 pt-2 pr-16 pb-2 pl-5 my-2 border border-solid border-slate-300 rounded"
                placeholder="Tên người dùng"
                name="userName"
                type="text"
                value={formRegisterValue.userName}
                onChange={handleChangeRegister}
              />
              <input
                className="email w-full h-auto size-4 pt-2 pr-16 pb-2 pl-5 my-2 border border-solid border-slate-300 rounded"
                placeholder="Email"
                name="email"
                type="email"
                value={formRegisterValue.email}
                onChange={handleChangeRegister}
              />
              <input
                className="password w-full h-auto size-4 pt-2 pr-16 pb-2 pl-5 my-2 border border-solid border-slate-300 rounded"
                placeholder="Mật khẩu"
                name="password"
                type="password"
                value={formRegisterValue.password}
                onChange={handleChangeRegister}
              />
              <input
                className="password w-full h-auto size-4 pt-2 pr-16 pb-2 pl-5 my-2 border border-solid border-slate-300 rounded"
                placeholder="Nhập lại mật khẩu"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={handleChangeConfirmPassword}
              />
            </div>
            <button
              className="login-button transition delay-100 w-full text-white px-5 py-2 my-0 mx-auto border border-solid border-slate-300 rounded cursor-pointer hover:bg-red-500 hover:text-black"
              type="submit"
            >
              Đăng kí
            </button>
          </form>
          <div className="list flex h-auto my-3 items-center text-left">
            <span>
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => {
                  toast.error('Đăng nhập Google thất bại. Vui lòng thử lại!');
                }}
              />
            </span>
          </div>
          <div className="check-text flex pb-5">
            <p className="select-none">Đã có tài khoản?</p>
            <p
              className="register-text transition delay-100 font-medium pl-1 cursor-pointer hover:text-black"
              onClick={handleShowSignUp}
            >
              Đăng nhập
            </p>
          </div>
        </div>
      </section>
    );
  } else {
    return (
      <section className="modal-wrapper relative w-full h-screen">
        <div className="content-wrapper absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center w-96 h-auto border-solid border-2 rounded-lg py-5">
          <h2 className="header-text w-full h-auto flex justify-center text-xl pt-4 select-none">Đăng nhập</h2>
          <p className="sub-text w-full h-auto flex justify-center mt-3 text-sm opacity-50 select-none">
            Nhập tài khoản và mật khẩu của bạn!
          </p>
          <form onSubmit={handleSubmitLogin}>
            <div className="input flex flex-col justify-center items-center w-full h-auto my-7">
              <input
                className="email w-full h-auto size-4 pt-2 pr-16 pb-2 pl-5 my-2 border border-solid border-slate-300 rounded"
                placeholder="Email"
                name="email"
                type="email"
                value={formLoginValue.email}
                onChange={handleChangeLogin}
              />
              <input
                className="password w-full h-auto size-4 pt-2 pr-16 pb-2 pl-5 my-2 border border-solid border-slate-300 rounded"
                placeholder="Mật khẩu"
                name="password"
                type="password"
                value={formLoginValue.password}
                onChange={handleChangeLogin}
              />
            </div>
            <button
              className="login-button transition delay-100 w-full text-white px-5 py-2 my-0 mx-auto border border-solid border-slate-300 rounded cursor-pointer hover:bg-red-500 hover:text-black"
              type="submit"
            >
              Đăng nhập
            </button>
          </form>
          <a href="#!" className="sub-text w-full h-auto flex justify-center mt-3 text-sm opacity-50 select-none">
            Quên mật khẩu?
          </a>
          <div className="list flex h-auto my-3 items-center text-left">
            <div>
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => {
                  toast.error('Đăng nhập Google thất bại. Vui lòng thử lại!');
                }}
              />
            </div>
          </div>
          <div className="check-text flex pb-5">
            <p className="select-none">Chưa có tài khoản?</p>
            <p
              className="register-text transition delay-100 font-medium pl-1 cursor-pointer hover:text-black"
              onClick={handleShowRegister}
            >
              Đăng kí
            </p>
          </div>
        </div>
      </section>
    );
  }
}

export default SignInLayout;