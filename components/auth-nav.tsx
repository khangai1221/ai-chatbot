"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthNav() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/check");
      setIsAuthenticated(response.ok);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      setIsAuthenticated(false);
      window.location.href = "/admin/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return null; // Don't show anything while loading
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center space-x-4">
        <Link
          href="/"
          className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105"
        >
          Home
        </Link>
        <Link
          href="/admin/characters"
          className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105"
        >
          Admin
        </Link>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 transition-all duration-300 hover:scale-105"
        >
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <Link
        href="/"
        className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105"
      >
        Home
      </Link>
      <Link
        href="/admin/login"
        className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105"
      >
        Admin
      </Link>
    </div>
  );
}
