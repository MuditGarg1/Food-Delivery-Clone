import React, { useContext, useState } from 'react'
import './ShopDisplay.css'
import { StoreContext } from '../../Context/StoreContext'
import { useNavigate } from 'react-router-dom'

const ShopDisplay = () => {
    const { shopList, url } = useContext(StoreContext)
    const navigate = useNavigate()
    const [search, setSearch] = useState('')

    const filteredShops = shopList.filter(shop =>
        shop.name.toLowerCase().includes(search.toLowerCase()) ||
        (shop.description && shop.description.toLowerCase().includes(search.toLowerCase()))
    )

    return (
        <div className='shop-display' id='shop-display'>
            <h2>Top restaurants near you</h2>
            <div className="shop-search-bar">
                <input
                    type="text"
                    placeholder="🔍 Search restaurants..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="shop-search-input"
                />
                {search && <button className="shop-search-clear" onClick={() => setSearch('')}>✕</button>}
            </div>
            {filteredShops.length === 0 ? (
                <p className="shop-empty-msg">{search ? `No restaurants match "${search}"` : 'No available restaurants right now. Check back later!'}</p>
            ) : (
                <div className="shop-display-list">
                    {filteredShops.map((shop, index) => {
                        return (
                            <div key={index} className='shop-item' onClick={() => navigate(`/shop/${shop._id}`)}>
                                <div className="shop-item-img-container">
                                    <img className='shop-item-image' src={`${url}/images/${shop.image}`} alt={shop.name} />
                                </div>
                                <div className="shop-item-info">
                                    <div className="shop-item-name-rating">
                                        <p>{shop.name}</p>
                                        <span style={{color: "#fbc02d", fontWeight: "bold"}}>
                                            ★ {shop.ratingCount > 0 ? (shop.ratingSum / shop.ratingCount).toFixed(1) : "New"} 
                                            <span style={{fontSize: "12px", color: "gray", marginLeft: "4px"}}>
                                                {shop.ratingCount > 0 ? `(${shop.ratingCount})` : ""}
                                            </span>
                                        </span>
                                    </div>
                                    <p className="shop-item-desc">{shop.description}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default ShopDisplay
