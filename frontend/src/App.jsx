import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import 'datatables.net';
import 'datatables.net-bs5';
import Navbar from './components/Navbar/Navbar';
import Home from './components/Home/Home';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import LoginPopup from './components/LoginPopup/LoginPopup';
import { SnackbarProvider } from 'notistack'; // Import SnackbarProvider
import Contactus from './components/Contactus/Contactus';

function App() {
  const [showLogin, setShowlogin] = useState(false);
  
  return (
    <SnackbarProvider
    maxSnack={3}
    anchorOrigin={{
      vertical: 'top',    
      horizontal: 'center' 
    }}
  >
      {showLogin && <LoginPopup setShowlogin={setShowlogin} />}
      <div className='app'>
        <Navbar setShowlogin={setShowlogin} />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path="/dashboard" setShowlogin={setShowlogin} element={<Dashboard />} />
          <Route path="/contact" setShowlogin={setShowlogin} element={<Contactus />} />
        </Routes>
      </div>
    </SnackbarProvider>
  );
}

export default App;
