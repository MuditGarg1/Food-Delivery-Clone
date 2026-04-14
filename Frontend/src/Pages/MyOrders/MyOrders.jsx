import React, { useContext, useEffect, useState } from 'react';
import './MyOrders.css';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const MyOrders = () => {
    const { url, token } = useContext(StoreContext);
    const [data, setData] = useState([]);
    
    // Rating Modal State
    const [ratingOrderId, setRatingOrderId] = useState(null);
    const [shopRating, setShopRating] = useState(5);
    const [deliveryRating, setDeliveryRating] = useState(5);
    const [foodRatings, setFoodRatings] = useState({}); // { itemId: rating }

    const fetchOrders = async () => {
        try {
            const response = await axios.post(`${url}/api/order/userorders`, {}, { headers: { token } });
            if (response.data.success) {
                setData(response.data.data.reverse()); // Show newest first
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchOrders();
        }
    }, [token]);

    const openRatingModal = (order) => {
        setRatingOrderId(order._id);
        const initialFoodRatings = {};
        order.items.forEach(item => {
            initialFoodRatings[item._id] = 5;
        });
        setFoodRatings(initialFoodRatings);
        setShopRating(5);
        setDeliveryRating(5);
    };

    const submitRating = async () => {
        const formattedFoodRatings = Object.keys(foodRatings).map(id => ({ id, rating: foodRatings[id] }));
        
        try {
            const res = await axios.post(`${url}/api/order/rate`, {
                orderId: ratingOrderId,
                shopRating,
                deliveryPartnerRating: deliveryRating,
                foodRatings: formattedFoodRatings
            }, { headers: { token } });

            if (res.data.success) {
                toast.success("Thank you! Ratings submitted. ⭐");
                setRatingOrderId(null);
                fetchOrders();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error submitting ratings.");
        }
    };

    const handleFoodRatingChange = (id, val) => {
        setFoodRatings(prev => ({...prev, [id]: val}));
    };

    const cancelOrder = (orderId) => {
        toast((t) => (
            <span>
                Cancel this order?
                <div style={{marginTop: '8px', display: 'flex', gap: '8px'}}>
                    <button style={{background:'#e53e3e',color:'white',border:'none',padding:'4px 10px',borderRadius:'4px',cursor:'pointer'}} onClick={async () => {
                        toast.dismiss(t.id);
                        try {
                            const res = await axios.post(`${url}/api/order/cancel`, { orderId }, { headers: { token } });
                            if (res.data.success) { toast.success('Order cancelled!'); fetchOrders(); }
                            else toast.error(res.data.message);
                        } catch { toast.error('Error cancelling order.'); }
                    }}>Yes, Cancel</button>
                    <button style={{background:'#eee',border:'none',padding:'4px 10px',borderRadius:'4px',cursor:'pointer'}} onClick={() => toast.dismiss(t.id)}>No</button>
                </div>
            </span>
        ), { duration: Infinity });
    };

    if (data.length === 0) {
        return <div className="my-orders"><p style={{textAlign:'center', marginTop:'50px'}}>No orders found.</p></div>;
    }

    return (
        <div className='my-orders'>
            <h2>My Orders</h2>
            <div className="container">
                {data.map((order, index) => {
                    return (
                        <div key={index} className='my-orders-order'>
                            <p className="order-items">
                                {order.items.map((item, index) => {
                                    if (index === order.items.length - 1) {
                                        return item.name + " x " + item.quantity;
                                    } else {
                                        return item.name + " x " + item.quantity + ", ";
                                    }
                                })}
                            </p>
                            <p>₹{order.amount}.00</p>
                            <p>Items: {order.items.length}</p>
                            <p><span>&#x25cf;</span> <b>{order.status}</b></p>
                            <button onClick={fetchOrders} className='btn-track'>Track Order</button>
                            
                            {/* Cancel button — only available before the shop starts preparing */}
                            {order.status === 'Food Processing' && (
                                <button onClick={() => cancelOrder(order._id)} className='btn-cancel-order'>Cancel Order</button>
                            )}
                            
                            {/* Allow rating only after the delivery is fully completed */}
                            {order.status === 'Delivered' && !order.isRated && (
                                <button onClick={() => openRatingModal(order)} className='btn-rate'>Rate Order</button>
                            )}
                            {order.isRated && <p className="rated-tag">✅ Rated</p>}
                        </div>
                    )
                })}
            </div>

            {/* Rating Modal Interface */}
            {ratingOrderId && (
                <div className="rating-modal-overlay">
                    <div className="rating-modal">
                        <h3>Rate Your Order Experience</h3>
                        
                        <div className="rating-section">
                            <label>Restaurant Rating ({shopRating}/5):</label>
                            <input type="range" min="1" max="5" value={shopRating} onChange={(e) => setShopRating(e.target.value)} />
                        </div>
                        
                        <div className="rating-section">
                            <label>Delivery Partner Rating ({deliveryRating}/5):</label>
                            <input type="range" min="1" max="5" value={deliveryRating} onChange={(e) => setDeliveryRating(e.target.value)} />
                        </div>

                        <h4>Rate Food Items:</h4>
                        {data.find(o => o._id === ratingOrderId)?.items.map((item, i) => (
                            <div key={i} className="rating-section food-rating">
                                <span>{item.name}</span>
                                <div>
                                    <input type="range" min="1" max="5" value={foodRatings[item._id] || 5} onChange={(e) => handleFoodRatingChange(item._id, e.target.value)} />
                                    <span style={{marginLeft: '10px'}}>{foodRatings[item._id] || 5}/5</span>
                                </div>
                            </div>
                        ))}

                        <div className="rating-modal-actions">
                            <button onClick={() => setRatingOrderId(null)} className="btn-cancel">Cancel</button>
                            <button onClick={submitRating} className="btn-submit">Submit Rating</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MyOrders;
