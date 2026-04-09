import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import DashboardRecepcionista from './pages/DashboardRecepcionista';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard/recepcionista" element={<DashboardRecepcionista />} />
      </Routes>
    </Router>
  );
}

export default App;
