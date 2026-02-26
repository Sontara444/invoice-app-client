import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import InvoiceListPage from './pages/InvoiceListPage';
import InvoiceDetailsPage from './pages/InvoiceDetailsPage';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<InvoiceListPage />} />
            <Route path="/invoices/:id" element={<InvoiceDetailsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
