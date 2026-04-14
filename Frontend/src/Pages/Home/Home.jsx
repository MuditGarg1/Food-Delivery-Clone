import React from 'react'
import './Home.css' 
import Header from '../../Components/Header/Header'
import ShopDisplay from '../../Components/ShopDisplay/ShopDisplay'
import AppDownload from '../../Components/AppDownload/AppDownload'
const Home = () => {

  return (
    <div>
      <Header/>
      <ShopDisplay />
      <AppDownload />
    </div>
  )
}

export default Home
