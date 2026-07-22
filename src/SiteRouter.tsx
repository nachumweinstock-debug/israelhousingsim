import { BrowserRouter, Route, Routes } from "react-router-dom";
import SimulatorApp from "./SimulatorApp";
import { BlogIndexRoute, BlogPostRoute } from "./blog/BlogRoutes";

/**
 * Single top-level Router for the whole site, so the blog and the wizard
 * share one browser history rather than each mounting its own. SimulatorApp
 * still owns its internal <Routes> for every /simulator/* step (absolute
 * path matching works regardless of nesting depth), including its own
 * catch-all redirect to /simulator/welcome for anything else, which is why
 * the wildcard route below hands off to it last.
 */
export default function SiteRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/blog" element={<BlogIndexRoute />} />
        <Route path="/blog/:slug" element={<BlogPostRoute />} />
        <Route path="/*" element={<SimulatorApp />} />
      </Routes>
    </BrowserRouter>
  );
}
