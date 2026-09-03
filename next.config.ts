import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // www.sayt.uz → sayt.uz. Ikkala manzil ham ochilaversa, Google uni
      // ikkita boshqa-boshqa sayt deb hisoblaydi va ballni ikkiga bo'ladi.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www\\.(?<domain>.*)" }],
        destination: "https://:domain/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
