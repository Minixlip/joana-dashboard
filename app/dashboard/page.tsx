// app/dashboard/page.tsx
import React from 'react';

export default function DashboardHomePage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-primary-text">Welcome to the Dashboard</h1>
      <p className="text-primary-text/80 mt-2">Select an option from the sidebar to manage your content.</p>
      {/* More content will go here */}
    </div>
  );
}