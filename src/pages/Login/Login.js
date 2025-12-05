import React, { useState, useEffect, useCallback, useRef } from 'react';
import { authAPI, generateCaptchaAPI } from '../../services/api';
import './Login.css';
import userIcon from "../../assets/user.svg";
import eyeIcon from "../../assets/eye.png";
import { HiOutlineArrowRight } from "react-icons/hi2";
import { VscRefresh } from "react-icons/vsc";

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    captchaInput: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [captchaData, setCaptchaData] = useState({
    captchaImage: '',
    captchaId: ''
  });
  const [captchaLoading, setCaptchaLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const fetchCaptcha = useCallback(async () => {
    setCaptchaLoading(true);
    setError('');
    try {
      const response = await generateCaptchaAPI.getCaptchaImage();

      setCaptchaData({
        captchaId: response.id,
        captchaImage: response.image
      });

      setFormData(prev => ({ ...prev, captchaInput: '' }));
    } catch (err) {
      console.error('Failed to fetch CAPTCHA:', err);
    } finally {
      setCaptchaLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCaptcha();
  }, [fetchCaptcha]);


  const handleRefreshClick = async () => {
    const currentCaptchaId = captchaData.captchaId;

    setError('');

    if (currentCaptchaId) {
      try {
        setCaptchaLoading(true);
        const response = await generateCaptchaAPI.getCaptchaImageByRefresh(currentCaptchaId);

        setCaptchaData({
          captchaId: response.id,
          captchaImage: response.image
        });
        setFormData(prev => ({ ...prev, captchaInput: '' }));
      } catch (err) {
        console.error('Failed to refresh CAPTCHA:', err);
        setError('Failed to refresh CAPTCHA. Please try again.');
      } finally {
        setCaptchaLoading(false);
      }
    } else {
      fetchCaptcha();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      setError('Please enter your Employee ID');
      return;
    }

    if (!formData.password.trim()) {
      setError('Please enter your password');
      return;
    }

    if (!formData.captchaInput.trim() || !captchaData.captchaId) {
      setError('Please enter the CAPTCHA text and ensure the image is loaded.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await generateCaptchaAPI.validateCaptcha(
        captchaData.captchaId,
        formData.captchaInput.trim()
      );

      const data = await authAPI.login({
        username: formData.username.trim(),
        password: formData.password.trim(),
        captchaId: captchaData.captchaId,
        captcha: formData.captchaInput.trim(),
        token: "",
        browser: "Chrome",
        version: "120.0",
        device: "Windows 10 Laptop",
        platform: "Windows"
      });

      if (!data.accessToken) {
        throw new Error('Invalid response from server. Please try again.');
      }

      console.log('Login successful, passing data to AuthContext');

      if (onLogin) {
        onLogin(data);
      }

    } catch (err) {
      console.error('Login error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        request: err.request,
        config: err.config
      });

      // Handle API errors
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        const url = err.config?.url || '';

        // 🚨 Check 1: If the error came from the CAPTCHA validation endpoint (400 or 401 response)
        if (url.includes('/identity/captcha/validate')) {
          setError('Invalid CAPTCHA entered. Please try again.');
          fetchCaptcha(); // Refresh CAPTCHA and clear the input
        }
        // Check 2: If the error came from the login attempt (credentials wrong)
        else if (status === 401) {
          setError('Invalid credentials. Please check your Employee ID and password.');
          fetchCaptcha(); // Refresh CAPTCHA on failed login attempt
        } else if (status >= 500) {
          setError(`Server Error (${status}): ${data?.message || 'Server is experiencing issues.'}`);
        } else {
          setError(data?.message || `Request failed with status ${status}.`);
        }
      } else if (err.request) {
        // Network error
        console.error('Network error details:', err.request);
        setError('Network error. Please check your internet connection and try again.');
      } else {
        // Other error
        console.error('Other error:', err.message);
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container container-fluid vh-100">
      <div className="row h-100 g-0">
        <div className="login-left col-md-6 d-none d-md-flex">
          <div className="login-left-content">
            <div className="bank-logo-section">
            </div>
           
          </div>
        </div>

         <div className="login-right col-md-6  d-flex align-items-center justify-content-center">
          <div className="login-form-container card border-0" style={{ width: '100%' }}>
            <div className="card-body">
              <h2 className="login-title text-center mb-4 fw-bold text-dark">Employee Login</h2>

              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group position-relative bg-darks bg-opacity-10 rounded">
                  <div className="input-group border p-3 rounded">

                    <input
                      type="text"
                      name="username"
                      placeholder="Enter the Employee ID"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="form-control border-start-0 shadow-none ps-0 border-0 bg-transparent"
                      required
                    />
                    <span className="form-icon"><img src={userIcon} width="20" height="20" alt="user" /></span>
                  </div>
                </div>

                <div className="form-group mb-3 position-relative bg-darks bg-opacity-10 rounded">
                  <div className="input-group border p-3 rounded">

                    <input
                      type="password"
                      name="password"
                      placeholder="Enter Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="form-control border-start-0 shadow-none ps-0  border-0"
                      required
                    />
                    <span className="form-icon"><img src={eyeIcon} width="20" height="20" alt="user" /></span>
                  </div>
                </div>

                <div className="form-group mb-3">
                  <div className="d-flex align-items-center gap-3">

                    {/* CAPTCHA Image & Refresh */}
                    <div
                      className="captcha-image-box border rounded p-2 d-flex align-items-center justify-content-between"
                      style={{ height: '60px', minWidth: '150px', maxWidth: '50%' }}
                    >
                      {captchaLoading ? (
                        <span className="text-muted small">Loading...</span>
                      ) : captchaData.captchaImage ? (
                        <img
                          src={captchaData.captchaImage}
                          alt="CAPTCHA"
                          className="img-fluid"
                          style={{ height: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <span className="text-danger small">No CAPTCHA</span>
                      )}
                      <button
                        type="button"
                        className="btn btn-sm btn-light p-1 ms-2"
                        onClick={handleRefreshClick}
                        disabled={captchaLoading}
                        title="Refresh CAPTCHA"
                      >
                        <VscRefresh size={20} />
                      </button>
                    </div>

                    {/* CAPTCHA Input */}
                    <div className="flex-grow-1 bg-darks bg-opacity-10 rounded">
                      <div className="input-group border p-3 rounded">
                        <input
                          type="text"
                          name="captchaInput"
                          placeholder="Enter CAPTCHA"
                          value={formData.captchaInput}
                          onChange={handleInputChange}
                          className="form-control shadow-none ps-0 border-0 bg-transparent"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="alert alert-danger py-2 mb-3" role="alert">
                    <small>{error}</small>
                  </div>
                )}

                <div className="d-flex justify-content-end">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg fw-semibold px-5 py-3"
                    disabled={loading || captchaLoading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Logging in...
                      </>
                    ) : (
                      <span className='d-inline-flex align-items-center gap-2'>Login Now <HiOutlineArrowRight size={20} /></span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;