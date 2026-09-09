import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  product_name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  farmer_id: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  farmer_name: {
    type: String,
    default: ''
  }
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    customer_name: {
      type: String,
      required: true
    },
    total_amount: {
      type: Number,
      required: true,
      min: 0
    },
    payment_status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    payment_method: {
      type: String,
      default: 'upi'
    },
    payment_gateway: {
      type: String,
      default: 'cashfree'
    },
    upi_txn_id: {
      type: String,
      default: null
    },
    utr_number: {
      type: String,
      default: null
    },
    cashfree_order_id: {
      type: String,
      default: null
    },
    razorpay_order_id: {
      type: String,
      default: null
    },
    razorpay_payment_id: {
      type: String,
      default: null
    },
    razorpay_signature: {
      type: String,
      default: null
    },
    admin_gross_amount: {
      type: Number,
      default: 0
    },
    admin_commission_amount: {
      type: Number,
      default: 0
    },
    farmer_splits: [
      {
        farmer_id: { type: mongoose.Schema.Types.Mixed },
        farmer_name: { type: String, default: '' },
        items_amount: { type: Number, default: 0 },
        commission_rate: { type: Number, default: 5 },
        commission_amount: { type: Number, default: 0 },
        net_payout: { type: Number, default: 0 },
        payout_status: { type: String, enum: ['pending', 'processing', 'settled'], default: 'pending' },
        payout_ref: { type: String, default: null },
        payout_notes: { type: String, default: '' },
        settled_at: { type: Date, default: null }
      }
    ],
    items: [orderItemSchema]
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      }
    }
  }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
