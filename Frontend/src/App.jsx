import React, { useState } from 'react'
import Navbar from './Components/NavBar/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './Pages/Home/Home'
import Cart from './Pages/Cart/Cart'
import PlaceOrder from './Pages/PlaceOrder/PlaceOrder'
import Footer from './Components/Footer/Footer'
import LoginPopup from './Components/LoginPopup/LoginPopup'
import ShopMenu from './Pages/ShopMenu/ShopMenu'
import AdminDashboard from './Pages/AdminDashboard/AdminDashboard'
import OwnerDashboard from './Pages/OwnerDashboard/OwnerDashboard'
import MyOrders from './Pages/MyOrders/MyOrders'
import Verify from './Pages/Verify/Verify'
import { Toaster } from 'react-hot-toast'

const App = () => {

  const [showLogin, setShowLogin] = useState(false);
  return (
    <>
    <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
    {showLogin?<LoginPopup setShowLogin={setShowLogin}/>:<></>}
    <div className='app'>
      <Navbar setShowLogin={setShowLogin}/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/Cart' element={<Cart/>}/>
        <Route path='/order' element={<PlaceOrder/>}/>
        <Route path='/verify' element={<Verify/>}/>
        <Route path='/shop/:id' element={<ShopMenu/>}/>
        <Route path='/admin' element={<AdminDashboard/>}/>
        <Route path='/owner' element={<OwnerDashboard/>}/>
        <Route path='/myorders' element={<MyOrders/>}/>
      </Routes>
    </div>
    <Footer/></>
    
  )
}

export default App
