
// This file is no longer needed.
// The logic has been moved to the parent layout at src/app/(app)/layout.tsx
// to conditionally render the sidebar.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
