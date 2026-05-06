/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['mariadb', '@prisma/adapter-mariadb']
};

export default nextConfig;
