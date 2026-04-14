import React, { useContext, useEffect, useState } from 'react'
import './ShopMenu.css'
import { useParams } from 'react-router-dom'
import { StoreContext } from '../../Context/StoreContext'
import FoodItem from '../../Components/FoodItems/FoodItem'
import axios from 'axios'

const ShopMenu = () => {
    const { id } = useParams();
    const { shopList, url } = useContext(StoreContext);
    const [shop, setShop] = useState(null);
    const [shopMenuFoods, setShopMenuFoods] = useState([]);
    const [coupons, setCoupons] = useState([]);

    useEffect(() => {
        const currentShop = shopList.find(s => s._id === id);
        if (currentShop) {
            setShop(currentShop);
        }

        const fetchShopMenu = async () => {
            try {
                const response = await axios.get(`${url}/api/food/shop/${id}`);
                if (response.data.success) {
                    setShopMenuFoods(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching shop menu:", error);
            }
        };

        const fetchCoupons = async () => {
            try {
                const response = await axios.get(`${url}/api/coupon/shop/${id}`);
                if (response.data.success) {
                    setCoupons(response.data.data.filter(c => c.isActive && new Date(c.expiryDate) > new Date()));
                }
            } catch (error) {
                console.error("Error fetching shop coupons:", error);
            }
        };

        fetchShopMenu();
        fetchCoupons();
    }, [id, shopList, url]);

    if (!shop) {
        return <div className="shop-menu-loading">Loading shop...</div>
    }

    return (
        <div className='shop-menu'>
            <div className="shop-header">
                <img src={`${url}/images/${shop.image}`} alt={shop.name} className="shop-header-img" />
                <div className="shop-header-info">
                    <h2>{shop.name}</h2>
                    <p className="shop-desc">{shop.description}</p>
                    <p className="shop-address">{shop.address}</p>
                </div>
            </div>

            {coupons.length > 0 && (
                <div style={{ background: '#fff0ed', padding: '15px 25px', borderRadius: '8px', border: '1px dashed tomato', marginTop: '20px', color: 'tomato' }}>
                    <h4 style={{ margin: '0 0 10px 0' }}>🔥 Available Offers</h4>
                    {coupons.map((c, i) => (
                        <p key={i} style={{ margin: 0, fontWeight: '500' }}>Use code <strong style={{color: '#333'}}>{c.code}</strong> to get {c.discountPercentage}% off your entire order!</p>
                    ))}
                </div>
            )}

            <div className="shop-food-display">
                <h3>Menu items</h3>
                
                {shopMenuFoods.length > 0 && (
                    <div className="category-nav">
                        {[...new Set(shopMenuFoods.map(item => item.category))].map((category, index) => (
                            <button 
                                key={index} 
                                className="category-nav-btn"
                                onClick={() => {
                                    const element = document.getElementById(`category-${category}`);
                                    if (element) {
                                        element.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }}
                            >
                                {category} ({shopMenuFoods.filter(i => i.category === category).length})
                            </button>
                        ))}
                    </div>
                )}

                {shopMenuFoods.length === 0 ? <p>No items added yet.</p> : 
                    [...new Set(shopMenuFoods.map(item => item.category))].map((category, index) => (
                        <div key={index} className="category-section" id={`category-${category}`}>
                            <h4 className="category-title">{category}</h4>
                            <div className="food-display-list">
                                {shopMenuFoods.filter((item) => item.category === category).map((item, idx) => {
                                    return <FoodItem 
                                        key={idx} 
                                        id={item._id} 
                                        name={item.name} 
                                        description={item.description} 
                                        price={item.price} 
                                        isAvailable={item.isAvailable}
                                        ratingCount={item.ratingCount || 0}
                                        ratingSum={item.ratingSum || 0}
                                        image={item.image.includes('http') ? item.image : `${url}/images/${item.image}`} 
                                    />
                                })}
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default ShopMenu
