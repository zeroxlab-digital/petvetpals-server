import { Schema, model, InferSchemaType } from 'mongoose';

const conversationSchema = new Schema({
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
    messages: [
        {
            type: Schema.Types.ObjectId,
            ref: "Message",
            required: true
        }
    ]
}, { timestamps: true });

type IConversation = InferSchemaType<typeof conversationSchema>;

export const Conversation = model<IConversation>('Conversation', conversationSchema);