import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password_hash: {
      type: String,
      required: [true, 'Password hash is required']
    },
    role: {
      type: String,
      enum: ['farmer', 'customer', 'admin'],
      required: [true, 'Role is required'],
      default: 'customer'
    },
    address: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    payout_details: {
      upi_id: { type: String, default: '' },
      account_number: { type: String, default: '' },
      ifsc_code: { type: String, default: '' },
      bank_name: { type: String, default: '' },
      account_holder_name: { type: String, default: '' }
    }
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

const User = mongoose.model('User', userSchema);
export default User;
