import React, { useContext, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../Context/StoreContext'
import axios from 'axios'
import toast from 'react-hot-toast'

const PlaceOrder = () => {
  const { getTotalCartAmount, getCartSubTotal, token, foodList, cartItems, url, appliedCoupon } = useContext(StoreContext);
  const cartSubTotal = getCartSubTotal();
  const discountedSubTotal = getTotalCartAmount();
  const deliveryFee = cartSubTotal === 0 ? 0 : 2;
  const total = discountedSubTotal + deliveryFee;

  const [data, setData] = useState({
    firstName: "", lastName: "", email: "", street: "", city: "", state: "", zipCode: "", country: "", phone: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("Stripe");

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData(prev => ({ ...prev, [name]: value }));
  }

  const placeOrder = async (event) => {
    event.preventDefault();
    let orderItems = [];
    foodList.forEach((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = { ...item, quantity: cartItems[item._id] };
        orderItems.push(itemInfo);
      }
    });

    const firstCartItemId = Object.keys(cartItems).find(id => cartItems[id] > 0);
    const itemInfo = foodList.find(f => f._id === firstCartItemId);
    const shopId = itemInfo ? itemInfo.shopId : null;

    let discountAmount = 0;
    if (appliedCoupon) {
       discountAmount = cartSubTotal - discountedSubTotal;
    }

    let orderData = {
      address: data,
      items: orderItems,
      amount: total,
      shopId,
      couponApplied: appliedCoupon ? appliedCoupon.code : null,
      discountAmount,
      paymentMethod
    };

    try {
      let response = await axios.post(url + "/api/order/place", orderData, { headers: { token } });
      if (response.data.success) {
        if(response.data.cod_success) {
           window.location.replace(`/verify?success=true&cod=true&orderId=${response.data.orderId}`);
        } else {
           window.location.replace(response.data.session_url);
        }
      } else {
        toast.error("Error placing order: " + response.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error placing order. Please try again.");
    }
  }

  return (
    <form onSubmit={placeOrder} className='place-order'>
      <div className='place-order-left'>
        <p className="title">Delivery Information</p>
        <div className='multi-fields'>
          <input name='firstName' onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First name' required/>
          <input name='lastName' onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last name' required/>
        </div>
        <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email address' required/>
        <input name='street' onChange={onChangeHandler} value={data.street} type="text" placeholder='Street' required/>
        <div className='multi-fields'>
          <input name='city' onChange={onChangeHandler} value={data.city} type="text" placeholder='City' required/>
          <input name='state' onChange={onChangeHandler} value={data.state} type="text" placeholder='State' required/>
        </div>
        <div className='multi-fields'>
          <input name='zipCode' onChange={onChangeHandler} value={data.zipCode} type="text" placeholder='Pin Code' required/>
          <input name='country' onChange={onChangeHandler} value={data.country} type="text" placeholder='Country' required/>
        </div>
        <input name='phone' onChange={onChangeHandler} value={data.phone} type="text" placeholder='Phone' required/>
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Sub-Total</p>
              <p>₹{cartSubTotal.toFixed(2)}</p>
            </div>
            {appliedCoupon && (
              <>
                <hr />
                <div className="cart-total-details discount-row">
                  <p>Discount ({appliedCoupon.code})</p>
                  <p>-₹{(cartSubTotal - discountedSubTotal).toFixed(2)}</p>
                </div>
              </>
            )}
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>₹{deliveryFee.toFixed(2)}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>₹{total.toFixed(2)}</b>
            </div>
            
            <div style={{marginTop: "20px"}}>
               <h3>Payment Option</h3>
               <div style={{display: "flex", gap: "20px", marginTop: "10px"}}>
                  <label style={{display: "flex", alignItems: "center", gap: "8px", cursor: "pointer"}}>
                     <input type="radio" name="payment" value="Stripe" checked={paymentMethod === 'Stripe'} onChange={() => setPaymentMethod('Stripe')} />
                     Stripe (Card / Online)
                  </label>
                  <label style={{display: "flex", alignItems: "center", gap: "8px", cursor: "pointer"}}>
                     <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                     Cash on Delivery
                  </label>
               </div>
            </div>
          </div>
          <button type="submit" style={{marginTop: "20px"}}>PLACE ORDER</button>
        </div>
      </div>
    </form>
  );
}

export default PlaceOrder;
