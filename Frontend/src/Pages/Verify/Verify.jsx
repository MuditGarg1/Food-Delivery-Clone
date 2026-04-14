import React, { useContext, useEffect, useState } from 'react';
import './Verify.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';

const Verify = () => {
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");
  const cod = searchParams.get("cod");
  const { url } = useContext(StoreContext);
  const navigate = useNavigate();

  const [message, setMessage] = useState("Verifying your payment...");

  const verifyPayment = async () => {
    // If it's pure Cash On Delivery, bypass Stripe Verification entirely!
    if (cod === 'true' && success === 'true') {
        setMessage("Order Placed Successfully! Your delivery is being prioritized.");
        setTimeout(() => {
            navigate("/myorders");
        }, 3000);
        return;
    }

    // Stripe Flow Verification
    try {
      const response = await axios.post(url + "/api/order/verify", { success, orderId });
      if (response.data.success) {
        setMessage("Payment successful! Redirecting to tracking dashboard...");
        setTimeout(() => {
            navigate("/myorders");
        }, 1500);
      } else {
        setMessage("Payment failed. Navigating back to safety.");
        setTimeout(() => {
            navigate("/");
        }, 2000);
      }
    } catch (error) {
      console.error(error);
      setMessage("Error verifying payment.");
    }
  };

  useEffect(() => {
    verifyPayment();
  }, []);

  return (
    <div className='verify'>
      <div className="spinner"></div>
      <h2 style={{marginTop: "20px", color: "tomato"}}>{message}</h2>
    </div>
  );
};

export default Verify;
