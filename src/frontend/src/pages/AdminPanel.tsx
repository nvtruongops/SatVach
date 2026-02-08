import { Component, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useAuth } from "../context/AuthContext";
import AdminLayout from "../layouts/AdminLayout";

const AdminPanel: Component<{ children?: any }> = (props) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  onMount(() => {
    if (!isLoading() && (!user() || user()?.role !== "admin")) {
      navigate("/login");
    }
  });

  return <AdminLayout>{props.children}</AdminLayout>;
};

export default AdminPanel;
