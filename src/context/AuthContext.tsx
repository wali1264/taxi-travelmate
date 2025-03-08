
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, User } from '../utils/types';
import { authAPI } from '../utils/api';

// Define the initial auth state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
};

// Define action types
type AuthAction = 
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; user: User }
  | { type: 'AUTH_FAILURE'; error: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'UPDATE_USER'; user: User }
  | { type: 'CLEAR_ERROR' };

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.user,
        error: null
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.error
      };
    case 'AUTH_LOGOUT':
      return {
        ...initialState
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.user
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Create the Auth context
interface AuthContextType extends AuthState {
  sendVerificationCode: (phoneNumber: string) => Promise<{ success: boolean, message: string }>;
  verifyCode: (phoneNumber: string, code: string) => Promise<boolean>;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData) as User;
          dispatch({ type: 'AUTH_SUCCESS', user });
        } catch (err) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
        }
      }
    };
    
    checkAuth();
  }, []);

  // Send verification code
  const sendVerificationCode = async (phoneNumber: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authAPI.sendVerificationCode(phoneNumber);
      return response;
    } catch (err) {
      dispatch({ type: 'AUTH_FAILURE', error: 'Failed to send verification code' });
      return { success: false, message: 'Failed to send verification code' };
    }
  };

  // Verify code
  const verifyCode = async (phoneNumber: string, code: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authAPI.verifyCode(phoneNumber, code);
      if (response.success && response.user && response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userData', JSON.stringify(response.user));
        dispatch({ type: 'AUTH_SUCCESS', user: response.user });
        return true;
      } else {
        dispatch({ type: 'AUTH_FAILURE', error: response.message || 'Verification failed' });
        return false;
      }
    } catch (err) {
      dispatch({ type: 'AUTH_FAILURE', error: 'Verification failed' });
      return false;
    }
  };

  // Update profile
  const updateProfile = async (userData: Partial<User>) => {
    try {
      const response = await authAPI.updateProfile(userData);
      if (response.success && response.user) {
        dispatch({ type: 'UPDATE_USER', user: response.user });
        localStorage.setItem('userData', JSON.stringify(response.user));
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    sendVerificationCode,
    verifyCode,
    updateProfile,
    logout,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using Auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
