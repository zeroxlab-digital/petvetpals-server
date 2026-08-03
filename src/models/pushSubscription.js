import mongoose from 'mongoose';

const pushSubscriptionSchema = mongoose.Schema({
    endpoint: { type: String, required: true, unique: true },
    keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true },
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Optional: only if your user is logged in
        required: false,
    },
}, { timestamps: true });

export const PushSubscription = mongoose.model("PushSubscription", pushSubscriptionSchema);