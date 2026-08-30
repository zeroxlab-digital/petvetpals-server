import { Schema, model, Types } from 'mongoose';

interface IPushSubscription {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
    user?: Types.ObjectId;
}

const pushSubscriptionSchema = new Schema<IPushSubscription>({
    endpoint: { type: String, required: true, unique: true },
    keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true },
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Optional: only if your user is logged in
    },
}, { timestamps: true });

export const PushSubscription = model<IPushSubscription>('PushSubscription', pushSubscriptionSchema);