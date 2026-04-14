import React, { useState, useEffect, useContext } from 'react'
import './OwnerDashboard.css'
import { StoreContext } from '../../Context/StoreContext'
import axios from 'axios'
import { assets } from '../../assets/assets'
import LocationPicker from '../../Components/LocationPicker/LocationPicker'
import toast from 'react-hot-toast'

const OwnerDashboard = () => {
    const { url, token, role } = useContext(StoreContext);
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ownerFoods, setOwnerFoods] = useState([]);
    const [ownerOrders, setOwnerOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' or 'orders'

    const fetchOwnerFoods = async (shopId) => {
        try {
            const res = await axios.get(`${url}/api/food/shop/${shopId}`);
            if (res.data.success) {
                setOwnerFoods(res.data.data);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const fetchOwnerOrders = async () => {
        try {
            const res = await axios.get(`${url}/api/order/shoporders`, { headers: { token } });
            if (res.data.success) {
                setOwnerOrders(res.data.data);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const updateOrderStatus = async (event, orderId) => {
        try {
            const res = await axios.post(`${url}/api/order/status`, { orderId, status: event.target.value }, { headers: { token } });
            if (res.data.success) {
                fetchOwnerOrders();
            }
        } catch (error) {
            console.error(error);
        }
    }

    // Form states
    const [shopData, setShopData] = useState({ name: '', description: '', address: '' });
    const [shopImage, setShopImage] = useState(false);
    const [shopLocation, setShopLocation] = useState(null);
    
    // Food state
    const [foodData, setFoodData] = useState({ name: '', description: '', price: '', category: 'Salad' });
    const [foodImage, setFoodImage] = useState(false);

    // Coupon state
    const [couponData, setCouponData] = useState({ code: '', discountPercentage: '', expiryDate: '' });

    const fetchOwnerShop = async () => {
        try {
            const res = await axios.get(`${url}/api/shop/owner`, { headers: { token } });
            if (res.data.success && res.data.data) {
                setShop(res.data.data);
                fetchOwnerFoods(res.data.data._id);
                fetchOwnerOrders();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (token && role === 'shop_owner') {
            fetchOwnerShop();
        } else {
            setLoading(false);
        }
    }, [token, role]);

    const onShopSubmit = async (e) => {
        e.preventDefault();
        if (!shopLocation) {
            alert("Please select your shop's location on the map.");
            return;
        }

        const formData = new FormData();
        formData.append("name", shopData.name);
        formData.append("description", shopData.description);
        formData.append("address", shopData.address);
        formData.append("image", shopImage);
        formData.append("latitude", shopLocation.lat);
        formData.append("longitude", shopLocation.lng);

        try {
            const res = await axios.post(`${url}/api/shop/create`, formData, { headers: { token } });
            if (res.data.success) {
                toast.success("Shop application submitted! Awaiting admin approval.");
                fetchOwnerShop();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const onFoodSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", foodData.name);
        formData.append("description", foodData.description);
        formData.append("price", Number(foodData.price));
        formData.append("category", foodData.category);
        formData.append("image", foodImage);

        try {
            const res = await axios.post(`${url}/api/food/add`, formData, { headers: { token } });
            if (res.data.success) {
                toast.success("Food item added successfully!");
                setFoodData({ name: '', description: '', price: '', category: 'Salad' });
                setFoodImage(false);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const onCouponSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${url}/api/coupon/create`, couponData, { headers: { token } });
            if (res.data.success) {
                toast.success("Coupon created!");
                setCouponData({ code: '', discountPercentage: '', expiryDate: '' });
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const deleteShop = async () => {
        toast((t) => (
            <span>
                Delete your shop and ALL its items? This cannot be undone.
                <div style={{marginTop: '8px', display: 'flex', gap: '8px'}}>
                    <button style={{background:'#e53e3e',color:'white',border:'none',padding:'4px 10px',borderRadius:'4px',cursor:'pointer'}} onClick={async () => {
                        toast.dismiss(t.id);
                        try {
                            const res = await axios.post(`${url}/api/shop/remove`, { shopId: shop._id }, { headers: { token } });
                            if (res.data.success) { toast.success('Shop deleted.'); setShop(null); }
                            else toast.error(res.data.message);
                        } catch { toast.error('Error deleting shop.'); }
                    }}>Yes, Delete</button>
                    <button style={{background:'#eee',border:'none',padding:'4px 10px',borderRadius:'4px',cursor:'pointer'}} onClick={() => toast.dismiss(t.id)}>Cancel</button>
                </div>
            </span>
        ), { duration: Infinity });
    }

    const updateFoodStatus = async (id) => {
        const price = document.getElementById(`price-${id}`).value;
        const isAvailable = document.getElementById(`avail-${id}`).checked;
        try {
            const res = await axios.put(`${url}/api/food/update`, { id, price, isAvailable }, { headers: { token } });
            if (res.data.success) {
                toast.success("Food updated!");
                fetchOwnerFoods(shop._id);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error updating food.");
        }
    }

    const removeFoodItem = async (id) => {
        toast((t) => (
            <span>
                Delete this food item?
                <div style={{marginTop: '8px', display: 'flex', gap: '8px'}}>
                    <button style={{background:'#e53e3e',color:'white',border:'none',padding:'4px 10px',borderRadius:'4px',cursor:'pointer'}} onClick={async () => {
                        toast.dismiss(t.id);
                        try {
                            const res = await axios.delete(`${url}/api/food/remove`, { data: { id }, headers: { token } });
                            if (res.data.success) { toast.success('Food removed!'); fetchOwnerFoods(shop._id); }
                            else toast.error(res.data.message);
                        } catch { toast.error('Error removing food.'); }
                    }}>Yes</button>
                    <button style={{background:'#eee',border:'none',padding:'4px 10px',borderRadius:'4px',cursor:'pointer'}} onClick={() => toast.dismiss(t.id)}>No</button>
                </div>
            </span>
        ), { duration: Infinity });
    }

    if (role !== 'shop_owner') {
        return (
            <div className='owner-dash unauthorized-banner'>
                <h1>Partner with Us!</h1>
                <p>To add your shop and start selling, you need a Shop Owner account.</p>
                <div className='instructions'>
                    <ol>
                        <li>Click <b>Sign In</b> at the top right of the page.</li>
                        <li>Select <b>Click Here</b> to Create a new Account.</li>
                        <li>Choose <b>Shop Owner</b> from the role dropdown menu.</li>
                    </ol>
                </div>
            </div>
        )
    }

    if (loading) return <div className='owner-dash'>Loading...</div>

    if (!shop) {
        return (
            <div className='owner-dash'>
                <h2>Register Your Shop</h2>
                <form className='owner-form' onSubmit={onShopSubmit}>
                    <div className="form-group flex-col">
                        <p>Upload Shop Image</p>
                        <label htmlFor="shopImage">
                            <img src={shopImage ? URL.createObjectURL(shopImage) : assets.upload_area} alt="" />
                        </label>
                        <input onChange={(e) => setShopImage(e.target.files[0])} type="file" id="shopImage" hidden required />
                    </div>
                    <div className="form-group flex-col">
                        <p>Shop Name</p>
                        <input type="text" value={shopData.name} onChange={(e) => setShopData({...shopData, name: e.target.value})} required placeholder="Enter shop name" />
                    </div>
                    <div className="form-group flex-col">
                        <p>Description</p>
                        <textarea value={shopData.description} onChange={(e) => setShopData({...shopData, description: e.target.value})} required placeholder="Write a description..."></textarea>
                    </div>
                    <div className="form-group flex-col">
                        <p>Address</p>
                        <input type="text" value={shopData.address} onChange={(e) => setShopData({...shopData, address: e.target.value})} required placeholder="Enter shop address" />
                    </div>
                    <div className="form-group flex-col" style={{zIndex: 0}}>
                        <p>Pin Exact Location</p>
                        <LocationPicker position={shopLocation} setPosition={setShopLocation} />
                        {!shopLocation && <span style={{color:'tomato', fontSize:'12px'}}>* Click the map to drop a pin</span>}
                    </div>
                    <button type='submit' className='submit-btn' style={{marginTop: '10px'}}>Submit Application</button>
                </form>
            </div>
        )
    }

    if (shop.status === 'pending') {
        return (
            <div className='owner-dash'>
                <h2>Your shop '{shop.name}' is pending approval from an Admin.</h2>
                <p>Please check back later.</p>
            </div>
        )
    }

    if (shop.status === 'rejected') {
        return (
            <div className='owner-dash'>
                <h2>Your shop '{shop.name}' application was rejected.</h2>
                <p>Please contact support for more details.</p>
            </div>
        )
    }

    // Approved Shop View
    return (
        <div className='owner-dash'>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px'}}>
                <h2>Dashboard: {shop.name}</h2>
                <div style={{display: 'flex', gap: '10px'}}>
                    <button onClick={() => setActiveTab('inventory')} style={{padding: '10px 20px', backgroundColor: activeTab === 'inventory' ? 'tomato' : '#f0f0f0', color: activeTab === 'inventory' ? 'white' : 'black', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'}}>Inventory</button>
                    <button onClick={() => setActiveTab('orders')} style={{padding: '10px 20px', backgroundColor: activeTab === 'orders' ? 'tomato' : '#f0f0f0', color: activeTab === 'orders' ? 'white' : 'black', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'}}>Live Orders</button>
                    <button onClick={deleteShop} style={{padding: '10px 20px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'}}>Delete Shop</button>
                </div>
            </div>
            
            {activeTab === 'inventory' ? (
                <>
                <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h3>Add New Food Item</h3>
                    <form className='owner-form' onSubmit={onFoodSubmit}>
                        <div className="form-group flex-col">
                            <p>Upload Image</p>
                            <label htmlFor="foodImage">
                                <img src={foodImage ? URL.createObjectURL(foodImage) : assets.upload_area} alt="" />
                            </label>
                            <input onChange={(e) => setFoodImage(e.target.files[0])} type="file" id="foodImage" hidden required />
                        </div>
                        <div className="form-group flex-col">
                            <p>Product Name</p>
                            <input type="text" value={foodData.name} onChange={(e) => setFoodData({...foodData, name: e.target.value})} required placeholder="Type here" />
                        </div>
                        <div className="form-group flex-col">
                            <p>Product Description</p>
                            <textarea value={foodData.description} onChange={(e) => setFoodData({...foodData, description: e.target.value})} required placeholder="Write content here" rows="3"></textarea>
                        </div>
                        <div className="form-row">
                            <div className="form-group flex-col">
                                <p>Product Category</p>
                                <select value={foodData.category} onChange={(e) => setFoodData({...foodData, category: e.target.value})}>
                                    <option value="Salad">Salad</option>
                                    <option value="Rolls">Rolls</option>
                                    <option value="Deserts">Deserts</option>
                                    <option value="Sandwich">Sandwich</option>
                                    <option value="Cake">Cake</option>
                                    <option value="Pure Veg">Pure Veg</option>
                                    <option value="Pasta">Pasta</option>
                                    <option value="Noodles">Noodles</option>
                                </select>
                            </div>
                            <div className="form-group flex-col">
                                <p>Product Price</p>
                                <input type="Number" value={foodData.price} onChange={(e) => setFoodData({...foodData, price: e.target.value})} required placeholder="₹200" />
                            </div>
                        </div>
                        <button type='submit' className='submit-btn'>Add Food</button>
                    </form>
                </div>

                <div className="dashboard-card">
                    <h3>Create Coupon</h3>
                    <form className='owner-form' onSubmit={onCouponSubmit}>
                        <div className="form-group flex-col">
                            <p>Coupon Code</p>
                            <input type="text" value={couponData.code} onChange={(e) => setCouponData({...couponData, code: e.target.value})} required placeholder="e.g. WELCOME10" />
                        </div>
                        <div className="form-group flex-col">
                            <p>Discount %</p>
                            <input type="number" min="1" max="100" value={couponData.discountPercentage} onChange={(e) => setCouponData({...couponData, discountPercentage: e.target.value})} required placeholder="e.g. 15" />
                        </div>
                        <div className="form-group flex-col">
                            <p>Expiry Date</p>
                            <input type="date" value={couponData.expiryDate} onChange={(e) => setCouponData({...couponData, expiryDate: e.target.value})} required />
                        </div>
                        <button type='submit' className='submit-btn'>Add Coupon</button>
                    </form>
                </div>
            </div>

            <div className="dashboard-card full-width-card" style={{marginTop: '20px'}}>
                <h3>Manage Menu Items</h3>
                <div className="manage-food-list">
                    {ownerFoods.length === 0 ? <p>No items found.</p> : (
                        <div style={{overflowX: 'auto'}}>
                            <table className="food-table">
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Name</th>
                                        <th>Price (₹)</th>
                                        <th>Available</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ownerFoods.map((item) => (
                                        <tr key={item._id}>
                                            <td><img src={`${url}/images/${item.image}`} alt={item.name} className="food-table-img"/></td>
                                            <td>{item.name}</td>
                                            <td>
                                                <input type="number" 
                                                    defaultValue={item.price} 
                                                    id={`price-${item._id}`} 
                                                    className="food-table-input" />
                                            </td>
                                            <td>
                                                <input type="checkbox" 
                                                    defaultChecked={item.isAvailable !== false}
                                                    id={`avail-${item._id}`} className="food-table-check"/>
                                            </td>
                                            <td>
                                                <button onClick={() => updateFoodStatus(item._id)} className="btn-update">Save</button>
                                                <button onClick={() => removeFoodItem(item._id)} className="btn-delete">Drop</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            </>
            ) : (
                <div className="dashboard-card full-width-card" style={{marginTop: '20px'}}>
                    <h3>Incoming Orders ({ownerOrders.length})</h3>
                    {ownerOrders.length === 0 ? <p>Waiting for customers...</p> : (
                        <div className="orders-list">
                            {ownerOrders.map((order, index) => (
                                <div key={index} style={{border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '15px'}}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px'}}>
                                        <div>
                                            <p style={{margin: '0 0 5px 0', fontWeight: 'bold'}}>Customer: {order.address.firstName} {order.address.lastName}</p>
                                            <p style={{margin: '0', fontSize: '14px', color: '#555'}}>{order.address.street}, {order.address.city}</p>
                                        </div>
                                        <div style={{textAlign: 'right'}}>
                                            <p style={{margin: '0 0 5px 0', fontWeight: 'bold', color: 'tomato'}}>₹{order.amount}</p>
                                            <p style={{margin: '0', fontSize: '14px', color: '#555'}}>{order.items.length} Items</p>
                                        </div>
                                    </div>
                                    <hr style={{margin: '10px 0', border: '0', borderTop: '1px dashed #ccc'}} />
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
                                        <p style={{margin: '0', fontSize: '14px', fontWeight: '500'}}>
                                            {order.items.map((it, i) => i === order.items.length - 1 ? `${it.name} x ${it.quantity}` : `${it.name} x ${it.quantity}, `)}
                                        </p>
                                        <select onChange={(e) => updateOrderStatus(e, order._id)} value={order.status} style={{padding: '8px', borderRadius: '4px', border: '1px solid tomato', outline: 'none', cursor: 'pointer', fontWeight: 'bold'}}>
                                            <option value="Food Processing">Food Processing</option>
                                            <option value="Preparing">Preparing Order</option>
                                            <option value="Ready for Delivery">Ready for Delivery</option>
                                            <option value="Out for Delivery">Out for Delivery</option>
                                            <option value="Delivered">Delivered</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default OwnerDashboard
