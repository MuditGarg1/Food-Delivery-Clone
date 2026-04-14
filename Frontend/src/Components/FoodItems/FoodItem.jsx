import React, { useContext } from 'react';
import './FoodItem.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../Context/StoreContext';

const FoodItem = ({ id, name, price, description, image, isAvailable = true, ratingCount = 0, ratingSum = 0 }) => {
  const { cartItems, addToCart, removeFromCart } = useContext(StoreContext);

  return (
    <div className={`food-item ${!isAvailable ? 'food-unavailable' : ''}`}>
      <div className="food-item-image-container">
        <img className='food-item-image' src={image} alt="" />
        {!isAvailable ? (
            <div className="unavailable-overlay">Currently not available</div>
        ) : !cartItems[id]
          ? (
            <img
              className='add'
              onClick={() => addToCart(id)}
              src={assets.add_icon_white}
              alt=""
            />
          ) : (
            <div className='food-item-counter'>
              <img
                onClick={() => removeFromCart(id)}
                src={assets.remove_icon_red}
                alt=""
              />
              <p>{cartItems[id]}</p>
              <img
                onClick={() => addToCart(id)}
                src={assets.add_icon_green}
                alt=""
              />
            </div>
          )}
      </div>
      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
          <span style={{color: "#fbc02d", fontWeight: "bold", fontSize: "14px"}}>
              ★ {ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : "New"} 
              <span style={{fontSize: "11px", color: "gray", marginLeft: "4px"}}>
                  {ratingCount > 0 ? `(${ratingCount})` : ""}
              </span>
          </span>
        </div>
        <p className="food-item-description">{description}</p>
        <p className="food-item-price">₹{price}</p>
      </div>
    </div>
  );
};

export default FoodItem;
