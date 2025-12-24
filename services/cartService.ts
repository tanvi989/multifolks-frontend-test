import axios from '../api/axiosConfig';

export const cartService = {
    getCart: async () => {
        const response = await axios.get('/cart');
        return response.data;
    },

    addToCart: async (productId: string, quantity: number, product_details?: any) => {
        const response = await axios.post('/cart', { productId, quantity, product_details });
        return response.data;
    },

    updateCartItem: async (productId: string, quantity: number) => {
        const response = await axios.post('/cart', { productId, quantity });
        return response.data;
    },

    removeFromCart: async (productId: string) => {
        const response = await axios.delete(`/cart/${productId}`);
        return response.data;
    },

    clearCart: async () => {
        const response = await axios.delete('/cart');
        return response.data;
    }
};
