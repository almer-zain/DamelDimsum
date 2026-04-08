const snap = require('../../../config/midtrans.config');
const { ApiError } = require('../../../utils/ApiError');
const crypto = require('crypto');

exports.processCheckout = async (cart, customerInfo) => {
  // 1. GENERATE UNIQUE ORDER ID (The "Token" for WhatsApp)
  // Format: DML-Timestamp-Random
  const uniqueId = `DML-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

  // 2. CALCULATE TOTAL (Server-side calculation to prevent hacking)
  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const totalWithFee = total + 1000; // Adding service fee

  // 3. PREPARE MIDTRANS PARAMETERS
  const parameter = {
    transaction_details: {
      order_id: uniqueId,
      gross_amount: totalWithFee,
    },
    item_details: [
      ...cart.map(item => ({
        id: `PROD-${item.id}`,
        price: item.price,
        quantity: item.qty,
        name: item.name
      })),
      { id: 'FEE-01', price: 1000, quantity: 1, name: 'Biaya Layanan' }
    ],
    customer_details: {
      first_name: customerInfo.name,
      phone: customerInfo.whatsapp,
      billing_address: {
        address: customerInfo.address,
        city: "Unknown", // You can expand this if needed
      }
    },
    // Optional: Limit payment methods to match your UI
    enabled_payments: ["gopay", "qris", "bca_va", "bni_va", "bri_va", "mandiri_clickpay"]
  };

  try {
    // 4. REQUEST SNAP TOKEN
    const transaction = await snap.createTransaction(parameter);
    
    // 5. RETURN EVERYTHING NEEDED
    return {
      orderId: uniqueId, // This is what you send to WhatsApp
      snapToken: transaction.token,
      redirectUrl: transaction.redirect_url,
      totalAmount: totalWithFee
    };
  } catch (error) {
    console.error("Midtrans Error:", error.message);
    throw new ApiError(500, "Gagal memproses pembayaran");
  }
};


exports.createSnapToken = async (cart, customerInfo) => {
  // 1. Generate a truly unique Order ID
  const orderToken = `DML-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

  // 2. Calculate Totals strictly
  const itemTotal = cart.reduce((acc, item) => acc + (Number(item.price) * Number(item.qty)), 0);
  const serviceFee = 1000;
  const grossAmount = itemTotal + serviceFee;

  // 3. CLEAN DATA: Midtrans will REJECT if you send extra fields like 'images' or 'category'
  const items = cart.map(item => ({
    id: String(item.id),
    price: Number(item.price),
    quantity: Number(item.qty),
    name: item.name.substring(0, 50) // Midtrans has a character limit
  }));

  // Add the service fee as an item so the total matches perfectly
  items.push({
    id: 'FEE01',
    price: serviceFee,
    quantity: 1,
    name: 'Biaya Layanan'
  });

  const parameter = {
    transaction_details: {
      order_id: orderToken,
      gross_amount: grossAmount,
    },
    item_details: items,
    customer_details: {
      first_name: customerInfo.name,
      phone: customerInfo.whatsapp,
      // Midtrans Sandbox often REQUIRES an email field to work
      email: customerInfo.email || "customer@mail.com", 
      billing_address: {
        address: customerInfo.address,
        city: customerInfo.city,
      }
    }
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    return {
      token: transaction.token,
      orderId: orderToken,
      total: grossAmount
    };
  } catch (error) {
    // --- THE DEBUGGER ---
    // This logs the ACTUAL reason Midtrans rejected your request
    console.error("MIDTRANS REJECTION ERROR:", error.message);
    if (error.ApiResponse) {
        console.error("MIDTRANS DETAIL:", error.ApiResponse.error_messages);
    }
    
    // Throw the real error message so you can see it in the browser
    throw new ApiError(500, `Midtrans Error: ${error.message}`);
  }
};

exports.verifyWebhook = async (statusResponse) => {
  const { order_id, status_code, gross_amount, signature_key } = statusResponse;
  
  // 1. REGENERATE SIGNATURE (Big Tech Security)
  // Logic: SHA512(order_id + status_code + gross_amount + ServerKey)
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const hash = crypto.createHash('sha512')
    .update(order_id + status_code + gross_amount + serverKey)
    .digest('hex');

  if (hash !== signature_key) {
    throw new Error("Invalid Signature: Request source unverified.");
  }

  // 2. PROCESS STATUS ASYNCHRONOUSLY
  const transactionStatus = statusResponse.transaction_status;
  const fraudStatus = statusResponse.fraud_status;

  let message = `Order: ${order_id} | Status: ${transactionStatus}`;

  if (transactionStatus == 'capture') {
    if (fraudStatus == 'challenge') {
      return { status: 'challenge', message: `${message} (Action Required)` };
    } else if (fraudStatus == 'accept') {
      return { status: 'success', message: `${message} (Verified)` };
    }
  } else if (transactionStatus == 'settlement') {
    return { status: 'success', message: `${message} (Paid)` };
  } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
    return { status: 'failure', message: `${message} (Closed)` };
  } else if (transactionStatus == 'pending') {
    return { status: 'pending', message: `${message} (Waiting)` };
  }

  return { status: 'unknown', message };
};  