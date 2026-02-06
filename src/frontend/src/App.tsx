import type { Component } from "solid-js";
import { Router, Route } from "@solidjs/router";
import { lazy } from "solid-js";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const Explore = lazy(() => import("./pages/Explore"));
const About = lazy(() => import("./pages/About"));
const Contribute = lazy(() => import("./pages/Contribute"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));

const App: Component = () => {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/explore" component={Explore} />
      <Route path="/about" component={About} />
      <Route path="/contribute" component={Contribute} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
    </Router>
  );
};

export default App;
