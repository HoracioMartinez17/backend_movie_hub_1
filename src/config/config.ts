import dotenv from "dotenv";

// Type definitions for configuration
type TConfig = {
    [key: string]: EnvironmentConfig;
}

type EnvironmentConfig = {
    app: appConfig;
    auth0: auth0Config;
    cloudinary: cloudinaryConfig;

}

type appConfig = {
    PORT: string | number; // Port on which the application will run
    ORIGIN: string | undefined
}

type auth0Config = {
    client_origin: string | undefined;
    audience:  string | undefined;
    issuer:  string | undefined;
}

type cloudinaryConfig = {
    cloud_name: string | undefined;
    api_key: string | undefined;
    api_secret: string | undefined;
}

// Load environment variables based on the mode (development or production)
if (process.env.NODE_ENV === "production") {
    dotenv.config({ path: ".env.production" });
} else {
    dotenv.config({ path: '.env.development' });
}

// Get the current execution mode (default is development)
const ENV = process.env.NODE_ENV ?? 'development';

// Configuration for different environments (development and production)
const CONFIG: TConfig = {
    development: {
        app: {
            PORT: process.env.PORT || 4001,
            ORIGIN: process.env.APP_ORIGIN
        },
        auth0: {
            client_origin: process.env.APP_ORIGIN,
            audience: process.env.AUTH0_AUDIENCE,
            issuer: process.env.AUTH0_ISSUER
        },
        cloudinary: {
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        }
    },
    production: {
        app: {
            PORT: process.env.PORT || 4001,
            ORIGIN: process.env.APP_ORIGIN
        },
        auth0: {
            client_origin: process.env.APP_ORIGIN,
            audience: process.env.AUTH0_AUDIENCE,
            issuer: process.env.AUTH0_ISSUER
        },
        cloudinary: {
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        }
    }
}

// Export the configuration for the current mode (development or production)
export default CONFIG[ENV];
