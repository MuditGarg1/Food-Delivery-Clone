import React, { useContext, useState } from 'react'
import './Cart.css'
import { StoreContext } from '../../Context/StoreContext'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Cart = () => {
  const { cartItems, foodList, removeFromCart, getTotalCartAmount, getCartSubTotal, url, appliedCoupon, setAppliedCoupon } = useContext(StoreContext);
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState([]);

  const applyPromoCode = async () => {
      const firstCartItemId = Object.keys(cartItems).find(id => cartItems[id] > 0);
      if (!firstCartItemId) return toast.error("Cart is empty");

      const itemInfo = foodList.find(f => f._id === firstCartItemId);
      if (!itemInfo || !itemInfo.shopId) return toast.error("Coupons can only be applied to items from participating registered shops.");

      try {
          const res = await axios.post(`${url}/api/coupon/apply`, { code: promoCode, shopId: itemInfo.shopId });
          if (res.data.success) {
              setAppliedCoupon(res.data.data);
              toast.success("Coupon Applied! 🎉");
          } else {
              toast.error(res.data.message);
          }
      } catch (err) {
          console.error(err);
      }
  };

  React.useEffect(() => {
    const fetchCartCoupons = async () => {
      const activeItemIds = Object.keys(cartItems).filter(id => cartItems[id] > 0);
      if (activeItemIds.length === 0) return setAvailableCoupons([]);

      const firstItem = foodList.find(f => f._id === activeItemIds[0]);
      if (firstItem && firstItem.shopId) {
        try {
          const res = await axios.get(`${url}/api/coupon/shop/${firstItem.shopId}`);
          if (res.data.success) {
            setAvailableCoupons(res.data.data.filter(c => c.isActive && new Date(c.expiryDate) > new Date()));
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    fetchCartCoupons();
  }, [cartItems, foodList, url]);

  return (
    <div className='cart'>
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {foodList.map((item) => {
          if (cartItems[item._id] > 0) {
            return (
              <div key={item._id}>
                <div className='cart-items-title cart-items-item'>
                  <img src={item.image && item.image.includes('http') ? item.image : `${url}/images/${item.image}`} alt="" />
                  <p>{item.name}</p>
                  <p>₹{item.price}</p>
                  <p>{cartItems[item._id]}</p>
                  <p>₹{item.price * cartItems[item._id]}</p>
                  <p onClick={() => removeFromCart(item._id)} className='cross'>x</p>
                </div>
                <hr />
              </div>
            )
          }
          return null; // ✅ Make sure nothing is returned if not in cart
        })}
      </div>

      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Sub-Total</p>
              <p>₹{getCartSubTotal()}</p>
            </div>
            {appliedCoupon && (
              <>
                <hr />
                <div className="cart-total-details discount-row">
                  <p>Discount ({appliedCoupon.code})</p>
                  <p>-₹{(getCartSubTotal() - getTotalCartAmount()).toFixed(2)}</p>
                </div>
              </>
            )}
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>₹{getCartSubTotal() === 0 ? 0 : 2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>₹{getCartSubTotal() === 0 ? 0 : getTotalCartAmount() + 2}</b>
            </div>
          </div>
          <button onClick={() => navigate('/order')}>PROCEED TO CHECKOUT</button>
        </div>

        <div className="cart-promocode">
          <div>
            <p>If you have a promocode enter it here</p>
            <div className="cart-promocode-input">
              <input type="text" placeholder='promo-code' value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
              <button onClick={applyPromoCode}>Submit</button>
            </div>
            {appliedCoupon && <p style={{color: "green", marginTop: "10px"}}>Applied code {appliedCoupon.code} - {appliedCoupon.discountPercentage}% off!</p>}
            
            {availableCoupons.length > 0 && !appliedCoupon && (
              <div style={{ marginTop: '20px' }}>
                <p>Available Coupons:</p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                  {availableCoupons.map((c, idx) => (
                    <span 
                      key={idx} 
                      onClick={() => setPromoCode(c.code)}
                      style={{ border: '1px dashed tomato', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', color: 'tomato', fontWeight: 'bold' }}
                    >
                      {c.code} ({c.discountPercentage}%)
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
