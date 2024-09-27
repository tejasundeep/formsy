import Razorpay from 'razorpay';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { amount, currency, receipt } = req.body;

        try {
            const razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID, // Use your key id from Razorpay dashboard
                key_secret: process.env.RAZORPAY_KEY_SECRET, // Use your secret from Razorpay dashboard
            });

            const options = {
                amount: amount * 100, // Amount in the smallest currency unit (e.g., paise for INR)
                currency: currency || 'INR',
                receipt: receipt || 'receipt#1',
            };

            const order = await razorpay.orders.create(options);
            res.status(200).json(order);
        } catch (error) {
            res.status(500).json({ error: 'Error creating payment order', details: error });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
