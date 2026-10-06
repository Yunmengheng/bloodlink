import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * The template enabled `cacheComponents: true` (Next 16's partial
   * prerendering). It is turned off here deliberately.
   *
   * Every page in this app is dynamic by nature: the root layout reads the
   * language cookie, the header reads the session, and each page reads live
   * request data scoped to the signed-in user by RLS. Under cacheComponents
   * each of those reads must sit inside its own Suspense boundary, which would
   * mean restructuring layouts around a caching win this app cannot collect.
   *
   * Turn it back on if the public feed is ever split into a cached shell with
   * streamed-in personal data.
   */
  cacheComponents: false,
};

export default nextConfig;
