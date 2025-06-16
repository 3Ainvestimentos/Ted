"use client";

import { InitiativeCard } from "@/components/dashboard/initiative-card";
import { ProjectStatusChart } from "@/components/dashboard/project-status-chart";
import { MOCK_INITIATIVES } from "@/lib/constants";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default function DashboardPage() {
  const { userRole } = useAuth(); // Example of using role

  // Filter initiatives based on role or show all
  const initiativesToShow = MOCK_INITIATIVES; // .slice(0, 3); // Show a subset for dashboard

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-semibold tracking-tight">Dashboard</h1>
        { (userRole === 'PMO' || userRole === 'Leader') && (
          <Button asChild>
            <Link href="/initiatives/new"> {/* Placeholder for new initiative form */}
              <PlusCircle className="mr-2 h-4 w-4" /> Create Initiative
            </Link>
          </Button>
        )}
      </div>

      <section>
        <ProjectStatusChart initiatives={MOCK_INITIATIVES} />
      </section>

      <section>
        <h2 className="text-2xl font-headline font-semibold tracking-tight mb-4">Key Initiatives</h2>
        {initiativesToShow.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {initiativesToShow.map((initiative) => (
              <InitiativeCard key={initiative.id} initiative={initiative} showDetailsLink={false} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No key initiatives to display.</p>
        )}
      </section>
      
      {/* Placeholder for additional insights or sections */}
      <section>
          <h2 className="text-2xl font-headline font-semibold tracking-tight mb-4">Recent Activity</h2>
          <div className="p-6 bg-card border rounded-lg shadow-sm">
            <p className="text-muted-foreground">Activity feed coming soon...</p>
            {/* Example placeholder items */}
            <ul className="mt-4 space-y-2 text-sm">
                <li><span className="font-medium">Alice Wonderland</span> updated <span className="text-primary">Digital Transformation Q4</span> status to 'On Track'.</li>
                <li><span className="font-medium">Bob The Builder</span> added a comment to <span className="text-primary">New Market Expansion</span>.</li>
            </ul>
          </div>
      </section>
    </div>
  );
}
