import { BrowserRouter, Route, Routes } from "react-router-dom";
import SimulatorApp from "./SimulatorApp";
import { BlogIndexRoute, BlogPostRoute, HeBlogIndexRoute, HeBlogPostRoute } from "./blog/BlogRoutes";

/**
 * Single top-level Router for the whole site, so the blog and the wizard
 * share one browser history rather than each mounting its own. SimulatorApp
 * still owns its internal <Routes> for every /simulator/* step (absolute
 * path matching works regardless of nesting depth), including its own
 * catch-all redirect to /simulator/welcome for anything else, which is why
 * the wildcard route below hands off to it last.
 *
 * Hebrew blog posts live under a /he/blog prefix rather than following the
 * wizard's pattern of one URL with a client-side language toggle: hreflang
 * only works between two distinct, independently crawlable URLs, and the
 * entire point of this blog is Hebrew organic search visibility, which a
 * single JS-toggled URL can't deliver. The wizard is a tool with nothing to
 * rank, the blog is content meant to rank, different jobs, different
 * routing shape.
 */
export default function SiteRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/blog" element={<BlogIndexRoute />} />
        <Route path="/blog/:slug" element={<BlogPostRoute />} />
        <Route path="/he/blog" element={<HeBlogIndexRoute />} />
        <Route path="/he/blog/:slug" element={<HeBlogPostRoute />} />
        <Route path="/*" element={<SimulatorApp />} />
      </Routes>
    </BrowserRouter>
  );
}
