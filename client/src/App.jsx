import React, { useContext, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import FriendsPage from './pages/FriendsPage'
import Header from './components/Header'
import { Toaster } from 'react-hot-toast'
import { AuthContext } from '../context/AuthContext'

const App = () => {
  const { authUser } = useContext(AuthContext);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleMenuToggle = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <div className="bg-[url('./assets/bgImage.svg')] bg-contain min-h-screen">
      <Toaster/>
      {authUser && <Header onMenuToggle={handleMenuToggle} showMobileMenu={showMobileMenu} />}
      <div className={authUser ? "h-[calc(100vh-64px)]" : "h-screen"}>
        <Routes>
          <Route path='/' element={authUser ? <HomePage/> : <Navigate to="/login"/>} />
          <Route path='/login' element={!authUser ? <LoginPage/> : <Navigate to="/" />} />
          <Route path='/profile' element={authUser ? <ProfilePage/> : <Navigate to="/login"/> } />
          <Route path='/friends' element={authUser ? <FriendsPage/> : <Navigate to="/login"/> } />
        </Routes>
      </div>
    </div>
  )
}

export default App;