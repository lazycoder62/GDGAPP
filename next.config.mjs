/** @type {import('next').NextConfig} */

import dotenv from "dotenv";
dotenv.config();
const nextConfig = {
  env: {
    TOGETHER_API_KEY: process.env.TOGETHER_API_KEY,
    HELICONE_API_KEY: process.env.HELICONE_API_KEY,
    SERPER_API_KEY: process.env.SERPER_API_KEY,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    COHERE_API_KEY: process.env.COHERE_API_KEY,
    TAVILY_API_KEY: process.env.TAVILY_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    ALPHA_VANTAGE_API_KEY: process.env.ALPHA_VANTAGE_API_KEY,
    POLYGON_API_KEY: process.env.POLYGON_API_KEY,
    FINNHUB_API_KEY: process.env.FINNHUB_API_KEY,
    NEWSAPI_API_KEY: process.env.NEWSAPI_API_KEY,
    WOLFRAM_ALPHA_APPID: process.env.WOLFRAM_ALPHA_APPID,
    FINANCE_API_KEY: process.env.FINANCE_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GDRIVE_FOLDER_OBJECT_ID: process.env.GDRIVE_FOLDER_OBJECT_ID,
    UNSTRUCTURED_API_KEY: process.env.UNSTRUCTURED_API_KEY,
    GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS
},

  reactStrictMode: false, // Disable React Strict Mode
  images: {
    remotePatterns: [
      {
        hostname: 'www.google.com',
      },
    ],
  },
};

export default nextConfig;
