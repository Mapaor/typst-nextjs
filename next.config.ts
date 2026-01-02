import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,


  // Uncomment for static build ('out' folder will be generated)  when using `npm run build`
  // output: "export",
  // images: {
  //   unoptimized: true,
  // },
  // basePath: "/typst-online-editor",
  // assetPrefix: "/typst-online-editor/",
};

export default nextConfig;
