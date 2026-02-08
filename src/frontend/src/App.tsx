import type { Component } from "solid-js";
import { Router, Route } from "@solidjs/router";
import { lazy } from "solid-js";
import { Toaster } from "solid-toast";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const Explore = lazy(() => import("./pages/Explore"));
const About = lazy(() => import("./pages/About"));
const Contribute = lazy(() => import("./pages/Contribute"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const VerifyAccount = lazy(() => import("./pages/VerifyAccount"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const Profile = lazy(() => import("./pages/Profile"));
const Contact = lazy(() => import("./pages/Contact"));
const NewPost = lazy(() => import("./pages/NewPost"));

const App: Component = () => {
  return (
    <>
      <Toaster position="top-right" gutter={8} />
      <Router>
        <Route path="/" component={Home} />
        <Route path="/explore" component={Explore} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/contribute" component={Contribute} />
        <Route path="/new-post" component={NewPost} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/verify" component={VerifyAccount} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/profile" component={Profile} />
        <Route path="/admin" component={AdminPanel}>
          <Route
            path="/"
            component={lazy(() => import("./pages/admin/Dashboard"))}
          />
          <Route
            path="/locations"
            component={lazy(() => import("./pages/admin/Locations"))}
          />
          <Route
            path="/users"
            component={lazy(() => import("./pages/admin/Users"))}
          />
          <Route
            path="/messages"
            component={lazy(() => import("./pages/admin/Messages"))}
          />
          <Route
            path="/settings"
            component={lazy(() => import("./pages/admin/Settings"))}
          />
        </Route>
      </Router>
    </>
  );
};

export default App;
