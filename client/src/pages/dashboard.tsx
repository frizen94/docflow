import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import StatsCard from "@/components/dashboard/stats-card";
import RecentActivity from "@/components/dashboard/recent-activity";
import UpcomingDeadlines from "@/components/dashboard/upcoming-deadlines";
import { FileSignature, CheckCircle, Clock, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalDocuments: number;
  completedDocuments: number;
  approachingDeadline: number;
  totalUsers: number;
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          // Loading skeletons for stats cards
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="flex items-center">
                <div className="rounded-md p-3 bg-gray-100">
                  <Skeleton className="h-6 w-6" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </div>
              <div className="mt-6">
                <Skeleton className="h-4 w-32" />
              </div>
            </Card>
          ))
        ) : (
          <>
            <StatsCard
              title="Total Documents"
              value={stats?.totalDocuments || 0}
              icon={FileSignature}
              color="primary"
              linkText="View all documents"
              linkHref="/documents"
            />
            <StatsCard
              title="Completed Documents"
              value={stats?.completedDocuments || 0}
              icon={CheckCircle}
              color="success"
              linkText="View completed"
              linkHref="/documents?status=Completed"
            />
            <StatsCard
              title="Deadline Approaching"
              value={stats?.approachingDeadline || 0}
              icon={Clock}
              color="warning"
              linkText="View urgent"
              linkHref="/documents?urgent=true"
            />
            <StatsCard
              title="Total Users"
              value={stats?.totalUsers || 0}
              icon={Users}
              color="secondary"
              linkText="View all users"
              linkHref="/users"
            />
          </>
        )}
      </div>

      {/* Recent Activity and Upcoming Deadlines */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentActivity />
        <UpcomingDeadlines />
      </div>
    </div>
  );
}
