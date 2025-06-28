import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import RecipeDetail from './pages/RecipeDetail';
import CreatorProfile from './pages/CreatorProfile';
import BoltBadge from './components/BoltBadge';
import DashboardHome from './components/dashboard/DashboardHome';
import DashboardAnalytics from './components/dashboard/DashboardAnalytics';
import DashboardSaved from './components/dashboard/DashboardSaved';
import DashboardHistory from './components/dashboard/DashboardHistory';
import DashboardCategories from './components/dashboard/DashboardCategories';
import DashboardFollowings from './components/dashboard/DashboardFollowings';
import DashboardFollowers from './components/dashboard/DashboardFollowers';
import DashboardPublished from './components/dashboard/DashboardPublished';
import DashboardVetting from './components/dashboard/DashboardVetting';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="analytics" element={<DashboardAnalytics />} />
              <Route path="saved" element={<DashboardSaved />} />
              <Route path="history" element={<DashboardHistory />} />
              <Route path="categories" element={<DashboardCategories />} />
              <Route path="followings" element={<DashboardFollowings />} />
              <Route path="followers" element={<DashboardFollowers />} />
              <Route path="published" element={<DashboardPublished />} />
              <Route path="vetting" element={<DashboardVetting />} />
            </Route>
            <Route path="/recipes/:slug" element={<RecipeDetail />} />
            <Route path="/creators/:creatorId" element={<CreatorProfile />} />
          </Routes>
          
          {/* Built on Bolt Badge */}
          <BoltBadge />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;