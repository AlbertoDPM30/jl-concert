"use client";

import ProtectedRoute from "./components/ProtectedRoute";

function HomeContent() {
  return (
    <main className="flex min-h-screen w-screen flex-col items-center justify-center bg-white dark:bg-amber-200 sm:items-center">
      <div className="bg-white dark:bg-green-200 w-full h-full "></div>
    </main>
  );
}

export default function Home() {
  return (
    // <ProtectedRoute> envolverá todo el contenido de la página.
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}
