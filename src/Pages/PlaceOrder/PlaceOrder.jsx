import React, { useContext } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../Context/StoreContext'

const PlaceOrder = () => {
  const { getTotalCartAmount } = useContext(StoreContext);
  const subTotal = getTotalCartAmount();
  const deliveryFee = subTotal === 0 ? 0 : 2;
  const total = subTotal + deliveryFee;

  return (
    <form className='place-order'>
      <div className='place-order-left'>
        <p className="title">Delivery Information</p>
        <div className='multi-fields'>
          <input type="text" placeholder='First name'/>
          <input type="text" placeholder='Last name' />
        </div>
        <input type="email" placeholder='Email address'/>
        <input type="text" placeholder='Street' />
        <div className='multi-fields'>
          <input type="text" placeholder='City'/>
          <input type="text" placeholder='State' />
        </div>
        <div className='multi-fields'>
          <input type="text" placeholder='Pin Code'/>
          <input type="text" placeholder='Country' />
        </div>
        <input type="text" placeholder='Phone'/>
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Sub-Total</p>
              <p>${subTotal}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>${deliveryFee}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>${total}</b>
            </div>
          </div>
          <button type="submit">PROCEED TO PAYMENT</button>
        </div>
      </div>
    </form>
  );
}

export default PlaceOrder;
