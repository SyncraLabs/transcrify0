import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["ffmpeg-static", "@distube/ytdl-core"],
};

export default nextConfig;
