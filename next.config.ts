import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep our AGENTS.md brief; don't overwrite with Next defaults
  // @ts-expect-error agentRules is supported by Next 16 tooling
  agentRules: false,
};

export default nextConfig;
