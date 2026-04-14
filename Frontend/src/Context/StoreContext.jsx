import { createContext, useEffect, useState } from "react";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const url = "http://localhost:4000";
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");
  const [role, setRole] = useState("customer");
  const [shopList, setShopList] = useState([]);
  const [foodList, setFoodList] = useState([]);
  const [currentShop, setCurrentShop] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Fetch approved shops spatially mapped
  const fetchShops = async (lat, lng) => {
    try {
      let queryUrl = `${url}/api/shop/list`;
      if (lat && lng) queryUrl += `?lat=${lat}&lng=${lng}`;
      
      const response = await fetch(queryUrl);
      const result = await response.json();
      if (result.success) {
        setShopList(result.data);
      }
    } catch (error) {
      console.error("Error fetching shops:", error);
    }
  };

  // Fetch all foods globally
  const fetchFoodList = async () => {
    try {
      const response = await fetch(`${url}/api/food/list`);
      const result = await response.json();
      if (result.success) {
        setFoodList(result.data);
      }
    } catch (error) {
      console.error("Error fetching global foods:", error);
    }
  };

  // Load state from localStorage on mount
  useEffect(() => {
    if (localStorage.getItem("token")) {
      setToken(localStorage.getItem("token"));
    }
    if (localStorage.getItem("role")) {
      setRole(localStorage.getItem("role"));
    }
    
    // Initialize Geofencing
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
           fetchShops(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
           console.warn("Location permission denied. Global shops fetched.");
           fetchShops();
        }
      );
    } else {
        fetchShops();
    }

    fetchFoodList();
  }, []);

  const addToCart = (itemId) => {
    const itemInfo = foodList.find(f => f._id === itemId);
    if (!itemInfo) return;

    const activeItemIds = Object.keys(cartItems).filter(id => cartItems[id] > 0);
    if (activeItemIds.length > 0) {
        const firstActiveItem = foodList.find(f => f._id === activeItemIds[0]);
        if (firstActiveItem && firstActiveItem.shopId && itemInfo.shopId) {
            if (firstActiveItem.shopId.toString() !== itemInfo.shopId.toString()) {
                if (window.confirm("You can only order from one shop at a time. Clear your cart and start a new order from this shop?")) {
                    setCartItems({ [itemId]: 1 });
                    setAppliedCoupon(null);
                }
                return;
            }
        }
    }

    if (!cartItems[itemId]) {
      setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    }
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      const newCart = { ...prev };
      if (newCart[itemId] > 0) newCart[itemId] -= 1;
      if (newCart[itemId] === 0) delete newCart[itemId];
      return newCart;
    });
  };

  const getCartSubTotal = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = foodList.find((product) => product._id === item);
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };

  const getTotalCartAmount = () => {
    let totalAmount = getCartSubTotal();
    let discountAmount = 0;
    if (appliedCoupon) {
        discountAmount = (totalAmount * appliedCoupon.discountPercentage) / 100;
    }
    return totalAmount - discountAmount > 0 ? totalAmount - discountAmount : 0;
  };

  const contextValue = {
    url,
    token, setToken,
    role, setRole,
    shopList, setShopList,
    foodList, setFoodList,
    currentShop, setCurrentShop,
    appliedCoupon, setAppliedCoupon,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getCartSubTotal,
    getTotalCartAmount,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
