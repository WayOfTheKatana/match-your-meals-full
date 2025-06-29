import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './hooks/useToast';
import { Toaster } from './components/ui/toaster';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import RecipeDetail from './pages/RecipeDetail';
import CreatorProfile from './pages/CreatorProfile';
import ExploreRecipes from './pages/ExploreRecipes';
import RecipeBoardDetail from './pages/RecipeBoardDetail';
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
import DashboardBoards from './components/dashboard/DashboardBoards';
import DashboardRecent from './components/dashboard/DashboardRecent';
import DashboardRecommended from './components/dashboard/DashboardRecommended';
import ConsumerDashboardLayout from './components/dashboard/ConsumerDashboardLayout';
import CreatorDashboardLayout from './components/dashboard/CreatorDashboardLayout';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="min-h-screen">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/explore-recipes" element={<ExploreRecipes />} />
              {/* Redirect /dashboard to /dashboard/consumer */}
              <Route path="/dashboard" element={<Navigate to="/dashboard/consumer" replace />} />
              {/* Consumer Dashboard */}
              <Route 
                path="/dashboard/consumer" 
                element={
                  <ProtectedRoute>
                    <ConsumerDashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardHome />} />
                <Route path="saved" element={<DashboardSaved />} />
                <Route path="boards" element={<DashboardBoards />} />
                <Route path="recent" element={<DashboardRecent />} />
                <Route path="recommended" element={<DashboardRecommended />} />
                <Route path="categories" element={<DashboardCategories />} />
                <Route path="history" element={<DashboardHistory />} />
                <Route path="followings" element={<DashboardFollowings />} />
                <Route path="help" element={<div>Help & Support (Consumer)</div>} />
              </Route>
              {/* Creator Dashboard */}
              <Route 
                path="/dashboard/creator" 
                element={
                  <ProtectedRoute>
                    <CreatorDashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardHome />} />
                <Route path="published" element={<DashboardPublished />} />
                <Route path="followers" element={<DashboardFollowers />} />
                <Route path="vetting" element={<DashboardVetting />} />
                <Route path="analytics" element={<DashboardAnalytics />} />
                <Route path="revenue" element={<div>Revenue (Creator)</div>} />
                <Route path="help" element={<div>Help & Support (Creator)</div>} />
              </Route>
              {/* Recipe Board Detail Route - Public Access */}
              <Route path="/creators/board/:boardSlug" element={<RecipeBoardDetail />} />
              <Route path="/recipes/:slug" element={<RecipeDetail />} />
              <Route path="/creators/:creatorId" element={<CreatorProfile />} />
            </Routes>
            
            {/* Built on Bolt Badge */}
            <BoltBadge />
            
            {/* Toast notifications */}
            <Toaster />
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;