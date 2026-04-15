const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admincontroller');
const auth = require('../middleware/auth');

router.post('/login-pin', adminController.loginWithPin);
router.get('/pins', auth, adminController.getPins);
router.post('/pins', auth, adminController.createPin);
router.delete('/pins/:id', auth, adminController.deletePin);
router.get('/stats', auth, adminController.getDashboardStats);
router.get('/export', auth, adminController.exportDonationsCSV);

module.exports = router;