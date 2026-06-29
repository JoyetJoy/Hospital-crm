import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
// Layouts
import MainLayout from './components/layout/MainLayout';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import HospitalsList from './pages/hospitals/HospitalsList';
import HospitalProfile from './pages/hospitals/HospitalProfile';
import VisitsList from './pages/visits/VisitsList';
import FollowupsList from './pages/followups/FollowupsList';
import QuotationsList from './pages/quotations/QuotationsList';
import CreateQuotation from './pages/quotations/CreateQuotation';
import ProductsList from './pages/products/ProductsList';
import ExecutivesList from './pages/executives/ExecutivesList';
const PrivateRoute = ({
  children
}) => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};
const App = () => {
  return <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          <Route path="hospitals" element={<HospitalsList />} />
          <Route path="hospitals/:id" element={<HospitalProfile />} />
          
          <Route path="visits" element={<VisitsList />} />
          
          <Route path="followups" element={<FollowupsList />} />
          
          <Route path="quotations" element={<QuotationsList />} />
          <Route path="quotations/create" element={<CreateQuotation />} />
          
          <Route path="products" element={<ProductsList />} />
          
          <Route path="executives" element={<ExecutivesList />} />
        </Route>
      </Routes>
    </Router>;
};
export default App;