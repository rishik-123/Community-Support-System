const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('../config/db');

const app = express();

// ✅ Middleware FIRST
app.use(cors());
app.use(express.json());

// ✅ Connect MongoDB
connectDB();

// ✅ Routes
app.use('/api/donor', require('../routes/donorroutes'));
app.use('/api/receipt', require('../routes/receiptroutes'));
app.use('/api/admin', require('../routes/adminroutes'));
app.use('/api/import', require('../routes/importroutes'));

// ✅ Test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// ✅ IMPORTANT FOR RENDER (do NOT hardcode port)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});