import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,


  // Uncomment for static build ('out' folder will be generated)  when using `npm run build`
  // output: "export",
  // images: {
  //   unoptimized: true,
  // },
  // basePath: "/typst-online-editor-static", // Use the name you want your static repo to be named
  // assetPrefix: "/typst-online-editor-static",
};

export default nextConfig;
