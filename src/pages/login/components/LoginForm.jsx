import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Mock credentials for different user roles
  const mockCredentials = {
    manager: { email: "manager@firelynx.com", password: "manager123" },
    designer: { email: "designer@firelynx.com", password: "designer123" },
    client: { email: "client@firelynx.com", password: "client123" }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData?.password) {
      newErrors.password = "Password is required";
    } else if (formData?.password?.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check credentials and determine role
      let userRole = null;
      let isValidCredentials = false;

      Object.entries(mockCredentials)?.forEach(([role, credentials]) => {
        if (formData?.email === credentials?.email && formData?.password === credentials?.password) {
          userRole = role;
          isValidCredentials = true;
        }
      });

      if (!isValidCredentials) {
        setErrors({
          general: `Invalid credentials. Use: manager@firelynx.com/manager123, designer@firelynx.com/designer123, or client@firelynx.com/client123`
        });
        setIsLoading(false);
        return;
      }

      // Store user session
      localStorage.setItem('userRole', userRole);
      localStorage.setItem('userEmail', formData?.email);
      localStorage.setItem('isAuthenticated', 'true');

      // Navigate based on role
      switch (userRole) {
        case 'manager': navigate('/manager-dashboard');
          break;
        case 'designer': navigate('/manager-dashboard'); // Designer uses same dashboard with different permissions
          break;
        case 'client': navigate('/client-portal');
          break;
        default:
          navigate('/manager-dashboard');
      }

    } catch (error) {
      setErrors({
        general: "An error occurred during login. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // In a real app, this would navigate to forgot password page
    alert("Password reset functionality would be implemented here. For demo, use the provided credentials.");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Error Message */}
      {errors?.general && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Icon name="AlertCircle" size={16} className="text-error flex-shrink-0" />
            <p className="text-sm text-error">{errors?.general}</p>
          </div>
        </div>
      )}
      {/* Email Field */}
      <Input
        label="Email Address"
        type="email"
        name="email"
        placeholder="Enter your email address"
        value={formData?.email}
        onChange={handleInputChange}
        error={errors?.email}
        required
        disabled={isLoading}
        className="w-full"
      />
      {/* Password Field */}
      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Enter your password"
          value={formData?.password}
          onChange={handleInputChange}
          error={errors?.password}
          required
          disabled={isLoading}
          className="w-full"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-9 text-text-secondary hover:text-primary transition-smooth"
          disabled={isLoading}
        >
          <Icon name={showPassword ? "EyeOff" : "Eye"} size={16} />
        </button>
      </div>
      {/* Sign In Button */}
      <Button
        type="submit"
        variant="default"
        size="lg"
        loading={isLoading}
        disabled={isLoading}
        fullWidth
        className="mt-8"
      >
        {isLoading ? "Signing In..." : "Sign In"}
      </Button>
      {/* Forgot Password Link */}
      <div className="text-center">
        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-sm text-accent hover:text-accent/80 transition-smooth"
          disabled={isLoading}
        >
          Forgot your password?
        </button>
      </div>
      {/* Demo Credentials Info */}
      <div className="bg-muted rounded-lg p-4 mt-6">
        <h4 className="text-sm font-medium text-primary mb-2">Demo Credentials:</h4>
        <div className="space-y-1 text-xs text-text-secondary">
          <p><strong>Manager:</strong> manager@firelynx.com / manager123</p>
          <p><strong>Designer:</strong> designer@firelynx.com / designer123</p>
          <p><strong>Client:</strong> client@firelynx.com / client123</p>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;