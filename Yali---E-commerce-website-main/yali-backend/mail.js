const nodemailer = require('nodemailer');
require('dotenv').config();

function getTransporter() {
  const isConfigured = 
    process.env.SMTP_USER && 
    process.env.SMTP_USER !== 'your_email@gmail.com' &&
    process.env.SMTP_PASS && 
    process.env.SMTP_PASS !== 'your_app_password';

  if (!isConfigured) {
    // Return a mock object that logs emails to console rather than throwing errors
    return {
      sendMail: async (mailOptions) => {
        console.log('\n--- SMTP EMAIL DISPATCH SIMULATOR ---');
        console.log(`To:      ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`Content: \n${mailOptions.text || '(HTML Content Sent - Preview below)'}`);
        if (mailOptions.html) {
          // Log a clean text preview of the HTML body
          const cleanText = mailOptions.html
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          console.log(`HTML Text Preview: ${cleanText.substring(0, 400)}...`);
        }
        console.log('-------------------------------------\n');
        return { messageId: 'mock-msg-' + Date.now() };
      }
    };
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

const transporter = getTransporter();

// 1. Send Order Confirmation receipt to Customer
async function sendOrderConfirmation(customerEmail, order) {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="background: linear-gradient(to right, #0066cc, #10b981); color: white; padding: 15px; text-align: center; border-radius: 6px; margin-top: 0;">YALI Order Confirmation</h2>
      <p>Hi <strong>${order.customerName}</strong>,</p>
      <p>Thank you for shopping at YALI. Your order has been placed successfully and is being reviewed.</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Order ID:</strong> ${order.orderId}</p>
        <p style="margin: 0;"><strong>Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
        <p style="margin: 0;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        <p style="margin: 0;"><strong>Shipping Address:</strong> ${order.address}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 8px; text-align: left;">Item</th>
            <th style="padding: 8px; text-align: center;">Qty</th>
            <th style="padding: 8px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="margin-top: 20px; text-align: right; line-height: 1.6;">
        <p style="margin: 2px 0;">Subtotal: $${order.subtotal.toFixed(2)}</p>
        ${order.discount > 0 ? `<p style="margin: 2px 0; color: #10b981;">Discount: -$${order.discount.toFixed(2)}</p>` : ''}
        <p style="margin: 2px 0;">Tax (10%): $${order.tax.toFixed(2)}</p>
        <p style="margin: 2px 0;">Shipping: ${order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}</p>
        <h3 style="margin: 5px 0; color: #0066cc;">Total: $${order.total.toFixed(2)}</h3>
      </div>

      <p style="margin-top: 30px; text-align: center; color: #777; font-size: 12px;">This is an automated receipt from YALI. Thank you for your business!</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"YALI Storefront" <${process.env.SMTP_USER || 'yali@noreply.com'}>`,
      to: customerEmail,
      subject: `Your YALI Purchase Receipt - ${order.orderId}`,
      html
    });
    console.log(`Order confirmation email sent to ${customerEmail}`);
  } catch (error) {
    console.error(`Failed to send order confirmation email to ${customerEmail}:`, error.message);
  }
}

// 2. Notify Vendor of Assigned Fulfillment
async function sendVendorNotification(vendorEmail, vendorName, order) {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="background-color: #8b5cf6; color: white; padding: 15px; text-align: center; border-radius: 6px; margin-top: 0;">YALI Order Assignment</h2>
      <p>Hello <strong>${vendorName}</strong>,</p>
      <p>An order has been assigned to you by the administrator for fulfillment.</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Order ID:</strong> ${order.orderId}</p>
        <p style="margin: 0;"><strong>Customer Name:</strong> ${order.customerName}</p>
        <p style="margin: 0;"><strong>Shipping Destination:</strong> ${order.address}</p>
      </div>

      <h3>Items to Fulfill:</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 8px; text-align: left;">Item</th>
            <th style="padding: 8px; text-align: center;">Quantity</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <p style="margin-top: 25px;">Please log in to your YALI Vendor Dashboard to dispatch the items and update the tracking number.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"YALI Administration" <${process.env.SMTP_USER || 'admin@yali.com'}>`,
      to: vendorEmail,
      subject: `ACTION REQUIRED: Order Fulfillment Assignment - ${order.orderId}`,
      html
    });
    console.log(`Vendor assignment email sent to ${vendorEmail}`);
  } catch (error) {
    console.error(`Failed to send vendor assignment email to ${vendorEmail}:`, error.message);
  }
}

// 3. Notify Customer of Status & Tracking Updates
async function sendStatusUpdateNotification(customerEmail, order) {
  let statusText = '';
  let statusColor = '#0066cc';
  let trackingHtml = '';

  switch (order.status) {
    case 'Confirmed':
      statusText = 'Your order has been confirmed by our seller and is being prepared.';
      break;
    case 'Shipped':
      statusText = 'Great news! Your order has been shipped and is on its way.';
      statusColor = '#10b981';
      if (order.trackingNumber) {
        trackingHtml = `
          <div style="background-color: #e0f2fe; border: 1px solid #bae6fd; padding: 12px; border-radius: 6px; margin: 15px 0; color: #0369a1;">
            <strong>Tracking Number:</strong> ${order.trackingNumber}
          </div>
        `;
      }
      break;
    case 'Out for Delivery':
      statusText = 'Your package is out for delivery with our local courier partner. Keep your phone nearby!';
      statusColor = '#f59e0b';
      break;
    case 'Delivered':
      statusText = 'Delivered! Your package was successfully handed over to the recipient.';
      statusColor = '#10b981';
      break;
    case 'Cancelled':
      statusText = 'Your order has been cancelled. If any payment was made via wallet, it has been refunded.';
      statusColor = '#ef4444';
      break;
    case 'Returned':
      statusText = 'An item return has been logged for this order.';
      statusColor = '#6b7280';
      break;
    default:
      statusText = `Your order status has been updated to: ${order.status}`;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="background-color: ${statusColor}; color: white; padding: 15px; text-align: center; border-radius: 6px; margin-top: 0;">Order Status Update</h2>
      <p>Hi <strong>${order.customerName}</strong>,</p>
      <p>There is an update regarding your YALI Order <strong style="color: #0066cc;">${order.orderId}</strong>.</p>
      
      <div style="border-left: 4px solid ${statusColor}; padding-left: 15px; margin: 20px 0; font-size: 16px;">
        <strong>New Status: ${order.status}</strong>
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #555;">${statusText}</p>
      </div>

      ${trackingHtml}

      <p>You can view full invoice details and track shipping live by logging into the YALI storefront portal.</p>
      <p style="margin-top: 30px; text-align: center; color: #777; font-size: 12px;">Thank you for choosing YALI!</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"YALI Storefront" <${process.env.SMTP_USER || 'yali@noreply.com'}>`,
      to: customerEmail,
      subject: `Shipping Update: Order ${order.orderId} is ${order.status}`,
      html
    });
    console.log(`Status update email sent to ${customerEmail} (Status: ${order.status})`);
  } catch (error) {
    console.error(`Failed to send status update email to ${customerEmail}:`, error.message);
  }
}

module.exports = {
  sendOrderConfirmation,
  sendVendorNotification,
  sendStatusUpdateNotification
};
