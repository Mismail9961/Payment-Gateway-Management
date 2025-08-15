import mongoose from "mongoose";

const coursePurchaseSchema = new mongoose.Schema({
    // References to the course and user
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Payment details
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, uppercase: true, default: 'USD' },
    status: { 
        type: String, 
        enum: ['pending', 'completed', 'failed', 'refunded'], 
        default: 'pending' 
    },
    paymentMethod: { type: String, required: true },
    paymentId: { type: String, required: true },

    // Refund info (optional)
    refundId: String,
    refundAmount: { type: Number, min: 0 },
    refundReason: String,

    // Extra metadata (e.g., promo codes)
    metadata: { type: Map, of: String }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Speed up queries
coursePurchaseSchema.index({ user: 1, course: 1 });
coursePurchaseSchema.index({ status: 1 });
coursePurchaseSchema.index({ createdAt: -1 });

// Computed property — is this purchase refundable?
coursePurchaseSchema.virtual('isRefundable').get(function() {
    if (this.status !== 'completed') return false;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return this.createdAt > thirtyDaysAgo;
});

// Method — process refund
coursePurchaseSchema.methods.processRefund = async function(reason, amount) {
    this.status = 'refunded';
    this.refundReason = reason;
    this.refundAmount = amount || this.amount;
    return this.save();
};

export const CoursePurchase = mongoose.model('CoursePurchase', coursePurchaseSchema);
