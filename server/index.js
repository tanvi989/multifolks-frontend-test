// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { User, CartItem, Order, Prescription } = require('./models');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB successfully'))
.catch((err) => console.error('MongoDB connection error:', err));

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// ============ AUTH ROUTES ============

// Register
app.post('/api/register', async (req, res) => {
  const { email, password, firstName, lastName, phone } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password_hash: hashed,
      firstName,
      lastName,
      phone
    });
    
    await user.save();
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      token
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
  
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone
      },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get User Profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password_hash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update User Profile
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  const { firstName, lastName, phone } = req.body;
  
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { firstName, lastName, phone, updated_at: Date.now() },
      { new: true }
    ).select('-password_hash');
    
    res.json(user);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ CART ROUTES ============

// Get Cart
app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const cartItems = await CartItem.find({ user_id: req.user.userId });
    res.json(cartItems);
  } catch (err) {
    console.error('Cart fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add/Update Cart Item
app.post('/api/cart', authenticateToken, async (req, res) => {
  const { productId, quantity, product_details } = req.body;
  if (!productId || typeof quantity !== 'number') {
    return res.status(400).json({ message: 'Invalid payload' });
  }
  
  try {
    // Check if item already exists in cart
    let cartItem = await CartItem.findOne({
      user_id: req.user.userId,
      product_id: productId
    });
    
    if (cartItem) {
      // Update existing item
      cartItem.quantity = quantity;
      cartItem.product_details = product_details || cartItem.product_details;
      cartItem.updated_at = Date.now();
      await cartItem.save();
    } else {
      // Create new cart item
      cartItem = new CartItem({
        user_id: req.user.userId,
        product_id: productId,
        quantity,
        product_details
      });
      await cartItem.save();
    }
    
    res.json({ message: 'Cart updated', item: cartItem });
  } catch (err) {
    console.error('Cart update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove Cart Item
app.delete('/api/cart/:productId', authenticateToken, async (req, res) => {
  try {
    await CartItem.deleteOne({
      user_id: req.user.userId,
      product_id: req.params.productId
    });
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    console.error('Cart delete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear Cart
app.delete('/api/cart', authenticateToken, async (req, res) => {
  try {
    await CartItem.deleteMany({ user_id: req.user.userId });
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    console.error('Cart clear error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ ORDER ROUTES ============

// Create Order
app.post('/api/orders', authenticateToken, async (req, res) => {
  const { items, shipping_address, billing_address, total_amount, payment_method } = req.body;
  
  if (!items || !items.length || !total_amount) {
    return res.status(400).json({ message: 'Invalid order data' });
  }
  
  try {
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const order = new Order({
      user_id: req.user.userId,
      order_number: orderNumber,
      items,
      shipping_address,
      billing_address,
      total_amount,
      payment_method
    });
    
    await order.save();
    
    // Clear cart after order
    await CartItem.deleteMany({ user_id: req.user.userId });
    
    res.status(201).json({ message: 'Order created successfully', order });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get User Orders
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user.userId }).sort({ created_at: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Orders fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Single Order
app.get('/api/orders/:orderId', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user_id: req.user.userId
    });
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error('Order fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ PRESCRIPTION ROUTES ============

// Save Prescription
app.post('/api/prescriptions', authenticateToken, async (req, res) => {
  const { prescription_name, right_eye, left_eye, pupillary_distance, prescription_file_url } = req.body;
  
  try {
    const prescription = new Prescription({
      user_id: req.user.userId,
      prescription_name,
      right_eye,
      left_eye,
      pupillary_distance,
      prescription_file_url
    });
    
    await prescription.save();
    res.status(201).json({ message: 'Prescription saved', prescription });
  } catch (err) {
    console.error('Prescription save error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get User Prescriptions
app.get('/api/prescriptions', authenticateToken, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      user_id: req.user.userId,
      is_active: true
    }).sort({ created_at: -1 });
    
    res.json(prescriptions);
  } catch (err) {
    console.error('Prescriptions fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Single Prescription
app.get('/api/prescriptions/:prescriptionId', authenticateToken, async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.prescriptionId,
      user_id: req.user.userId
    });
    
    if (!prescription) return res.status(404).json({ message: 'Prescription not found' });
    res.json(prescription);
  } catch (err) {
    console.error('Prescription fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Prescription
app.delete('/api/prescriptions/:prescriptionId', authenticateToken, async (req, res) => {
  try {
    await Prescription.findOneAndUpdate(
      { _id: req.params.prescriptionId, user_id: req.user.userId },
      { is_active: false, updated_at: Date.now() }
    );
    
    res.json({ message: 'Prescription deleted' });
  } catch (err) {
    console.error('Prescription delete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ HEALTH CHECK ============

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// ============ START SERVER ============

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📊 Database: MongoDB`);
  console.log(`🔗 Connection: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});
