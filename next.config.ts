import path from "path"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Pin Turbopack to this app directory. A stray lockfile in the parent
  // `doc-edit/` folder was making Next infer the wrong workspace root and
  // break the React Client Manifest (global-error.js lookup).
  turbopack: {
    root: path.join(__dirname),
  },
}

export default nextConfig
