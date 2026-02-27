import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import InvoiceListPage from './pages/InvoiceListPage';
import InvoiceCreatePage from './pages/InvoiceCreatePage';
import InvoiceDetailsPage from './pages/InvoiceDetailsPage';
import DashboardPage from './pages/DashboardPage';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="flex min-h-screen bg-background relative">
                  {/* Mobile Header */}
                  <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-border flex items-center px-4 z-40">
                    <button
                      onClick={() => setIsMobileMenuOpen(true)}
                      className="p-2 -ml-2 text-text-main hover:bg-gray-100 rounded-lg"
                    >
                      <Menu size={24} />
                    </button>
                    <div className="ml-3 font-bold text-lg text-text-main flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rotate-45 rounded-sm"></div>
                      </div>
                      Invoice App
                    </div>
                  </div>

                  <Sidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />

                  <main className="flex-1 w-full overflow-x-hidden pt-16 md:pt-0">
                    <Routes>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/invoices" element={<InvoiceListPage />} />
                      <Route path="/invoices/new" element={<InvoiceCreatePage />} />
                      <Route path="/invoices/:id" element={<InvoiceDetailsPage />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
