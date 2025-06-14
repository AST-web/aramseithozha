// server.js
require('dotenv').config(); // .env கோப்பில் உள்ள மாறிகளை ஏற்றுவதற்கு

const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors'); // CORS கையாளுவதற்கு
const crypto = require('crypto'); // கட்டண சரிபார்ப்புக்கு

const app = express();
const PORT = process.env.PORT || 5000;

// மிடில்வேர் (Middleware)
// CORS: உங்கள் ஃபிரண்ட்எண்ட் சர்வர் வேறு டொமைனில் இருந்தால், அதை இங்கு குறிப்பிடலாம்.
// உதாரணத்திற்கு: origin: 'http://localhost:3000' (உங்கள் ஃபிரண்ட்எண்ட் இயங்கும் இடம்)
app.use(cors());
app.use(express.json());

// Razorpay Instance ஐ துவக்குதல்
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ரூட் எண்ட்பாயிண்ட் (சர்வர் இயங்குகிறதா என சரிபார்க்க)
app.get('/', (req, res) => {
    res.send('Razorpay Node.js Backend is running!');
});

// ஆர்டரை உருவாக்கும் API எண்ட்பாயிண்ட்
app.post('/api/create-order', async (req, res) => {
    try {
        const { amount, name, email, comment } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Amount is required and must be positive.' });
        }

        const options = {
            amount: Math.round(amount * 100), // Razorpay requires amount in paisa (e.g., ₹100 = 10000 paisa)
            currency: 'INR',
            receipt: `receipt_order_${Date.now()}`, // தனித்துவமான ரசீது ID
            notes: {
                name: name,
                email: email,
                comment: comment || 'No comment provided'
            }
        };

        const order = await razorpayInstance.orders.create(options);

        res.status(200).json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key_id: process.env.RAZORPAY_KEY_ID, // ஃபிரண்ட்எண்டிற்கு Key ID ஐ அனுப்புதல்
            message: 'Order created successfully'
        });

    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ message: 'Failed to create order', error: error.message });
    }
});

// கட்டணத்தைச் சரிபார்க்கும் API எண்ட்பாயிண்ட்
app.post('/api/payment-verify', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Razorpay இலிருந்து பெறப்பட்ட கையொப்பத்தை உருவாக்குதல்
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
        const generatedSignature = hmac.digest('hex');

        if (generatedSignature === razorpay_signature) {
            // கையொப்பம் பொருந்தினால், கட்டணம் வெற்றிகரமானது மற்றும் நம்பகமானது
            console.log('Payment successful and signature verified.');
            // இங்கு நீங்கள் தரவுத்தளத்தில் கட்டண நிலையை (payment status) புதுப்பிக்கலாம்
            res.status(200).json({ message: 'Payment successfully verified', verified: true });
        } else {
            // கையொப்பம் பொருந்தவில்லை என்றால், அது போலியான கோரிக்கையாக இருக்கலாம்
            console.error('Payment verification failed: Invalid signature.');
            res.status(400).json({ message: 'Payment verification failed: Invalid signature', verified: false });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Error verifying payment', error: error.message });
    }
});

// சர்வர் துவங்குதல்
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access backend at http://localhost:${PORT}`);
});