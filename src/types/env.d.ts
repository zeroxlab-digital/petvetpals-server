declare namespace NodeJS {
    interface ProcesEnv {
        PORT: string;
        MONGODB_URI: string;
        CLOUDINARY_NAME: string;
        CLOUDINARY_API_KEY: string;
        CLOUDINARY_SECRET_KEY: string;
        JWT_SECRET_KEY: string;
        CRON_SECRET: string;
        TOGETHER_API_KEY: string;

        GOOGLE_CLIENT_ID: string;
        GOOGLE_CLIENT_SECRET: string;

        VAPID_PUBLIC_KEY: string;
        VAPID_PRIVATE_KEY: string;

        // NODE_ENV: 'development' | 'production' | 'test';
    }
}