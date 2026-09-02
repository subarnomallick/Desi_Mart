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
