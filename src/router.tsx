// TanStack Router setup. The app is a single screen at "/", but the route's
// search params (validated by `validateBrewSearch`) hold the entire brew state,
// making it the single source of truth — shareable and refresh-safe.
import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import Playground from "./components/playground/Playground";
import { validateBrewSearch } from "./lib/brew-search";

const rootRoute = createRootRoute({ component: Outlet });

export const playgroundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: validateBrewSearch,
  component: Playground,
});

const routeTree = rootRoute.addChildren([playgroundRoute]);

export const router = createRouter({
  routeTree,
  // Keep tidy URLs and don't scroll on every knob tweak.
  defaultPreload: false,
  scrollRestoration: false,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
