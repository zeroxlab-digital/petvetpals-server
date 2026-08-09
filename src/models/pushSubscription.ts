import { Schema, model, InferSchemaType } from 'mongoose';

const pushSubscriptionSchema = new Schema({
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

type IPushSubscriptionSchema = InferSchemaType<typeof pushSubscriptionSchema>

export const PushSubscription = model<IPushSubscriptionSchema>('PushSubscription', pushSubscriptionSchema);