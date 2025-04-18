"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function JsonFormatter() {
  const router = useRouter();

  // Redirect to homepage
  useEffect(() => {
    router.push("/");
  }, [router]);

  // Return an empty div while redirecting
  return <div></div>;
}
