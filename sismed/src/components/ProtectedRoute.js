import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext.js';

const ProtectedRoute = ({ element, ...rest }) => {
  const { isAuthenticated } = useAuth();

  return (
    <Route
      {...rest}
      element={isAuthenticated ? element : <Navigate to="/login" replace={true} />}
    />
  );
};

export default ProtectedRoute;