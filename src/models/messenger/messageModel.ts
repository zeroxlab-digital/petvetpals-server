import { Schema, model, InferSchemaType } from 'mongoose';

const messageSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    vet: {
        type: Schema.Types.ObjectId,
        ref: "Vet",
        required: true
    },
    senderType: {
        type: String,
        enum: ["user", "vet"],
        required: true
    },
    message: {
        type: String,
        required: true
    }
}, { timestamps: true })

type IMessage = InferSchemaType<typeof messageSchema>;

export const Message = model<IMessage>('Message', messageSchema);