/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Empty turbopack config to explicitly opt-in to Turbopack
    // Turbopack handles WalletConnect dependencies automatically
    turbopack: {},
};

export default nextConfig;
