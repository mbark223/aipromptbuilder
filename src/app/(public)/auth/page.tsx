import { Suspense } from "react";
import { AuthPageContent } from "./auth-page-content";

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <AuthPageContent />
    </Suspense>
  );
}
