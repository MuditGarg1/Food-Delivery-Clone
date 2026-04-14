import React, { useState, useEffect, useContext } from 'react'
import './AdminDashboard.css'
import { StoreContext } from '../../Context/StoreContext'
import axios from 'axios'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
    const { url, token, role } = useContext(StoreContext);
    const [shops, setShops] = useState([]);

    const fetchAllShops = async () => {
        try {
            const response = await axios.get(`${url}/api/shop/admin/list`, {
                headers: { token }
            });
            if (response.data.success) {
                setShops(response.data.data);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        if (token && role === 'admin') {
            fetchAllShops();
        }
    }, [token, role]);

    const updateStatus = async (shopId, status) => {
        try {
            const res = await axios.post(`${url}/api/shop/admin/status`, { shopId, status }, {
                headers: { token }
            });
            if (res.data.success) {
                toast.success(`Shop ${status}!`);
                fetchAllShops();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const deleteShop = async (shopId) => {
        toast((t) => (
            <span>
                Delete this shop and ALL its items? This cannot be undone.
                <div style={{marginTop: '8px', display: 'flex', gap: '8px'}}>
                    <button style={{background:'#e53e3e',color:'white',border:'none',padding:'4px 10px',borderRadius:'4px',cursor:'pointer'}} onClick={async () => {
                        toast.dismiss(t.id);
                        try {
                            const res = await axios.post(`${url}/api/shop/remove`, { shopId }, { headers: { token } });
                            if (res.data.success) { toast.success('Shop deleted!'); fetchAllShops(); }
                            else toast.error(res.data.message);
                        } catch { toast.error('Error deleting shop.'); }
                    }}>Yes, Delete</button>
                    <button style={{background:'#eee',border:'none',padding:'4px 10px',borderRadius:'4px',cursor:'pointer'}} onClick={() => toast.dismiss(t.id)}>Cancel</button>
                </div>
            </span>
        ), { duration: Infinity });
    }

    if (role !== 'admin') {
        return <div className='admin-dashboard'><h1>Unauthorized. Admins only.</h1></div>
    }

    return (
        <div className='admin-dashboard'>
            <h2>Admin Control Panel</h2>
            <div className="admin-shop-list">
                <h3>All Registered Shops</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Shop Name</th>
                            <th>Address</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shops.map((shop, index) => (
                            <tr key={index}>
                                <td>{shop.name}</td>
                                <td>{shop.address}</td>
                                <td><span className={`status-${shop.status}`}>{shop.status}</span></td>
                                <td>
                                    {shop.status === 'pending' && (
                                        <>
                                            <button className='btn-approve' onClick={() => updateStatus(shop._id, 'approved')}>Approve</button>
                                            <button className='btn-reject' onClick={() => updateStatus(shop._id, 'rejected')}>Reject</button>
                                        </>
                                    )}
                                    <button className='btn-reject' style={{marginLeft: shop.status === 'pending' ? '10px' : '0'}} onClick={() => deleteShop(shop._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default AdminDashboard
