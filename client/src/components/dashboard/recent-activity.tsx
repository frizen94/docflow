import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { DocumentTracking } from "@shared/schema";

interface RecentActivityProps {
  limit?: number;
}

export default function RecentActivity({ limit = 3 }: RecentActivityProps) {
  const { data: activities, isLoading } = useQuery<DocumentTracking[]>({
    queryKey: ["/api/recent-activities/5"],
  });

  return (
    <Card>
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-medium text-gray-900">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ul className="divide-y divide-gray-200">
          {isLoading ? (
            // Loading state
            Array.from({ length: limit }).map((_, index) => (
              <li key={index} className="py-4">
                <div className="flex space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </li>
            ))
          ) : activities && activities.length > 0 ? (
            activities.slice(0, limit).map((activity) => (
              <li key={activity.id} className="py-4">
                <div className="flex space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                    {activity.id % 3 === 0 ? "JD" : activity.id % 2 === 0 ? "SJ" : "MW"}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">
                        {activity.id % 3 === 0
                          ? "John Doe"
                          : activity.id % 2 === 0
                          ? "Sarah Johnson"
                          : "Michael Wilson"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {format(new Date(activity.createdAt), "h'h' ago")}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {activity.description || "Processed document"}{" "}
                      <span className="font-medium text-gray-900">
                        Document #{activity.documentId}
                      </span>{" "}
                      from Area #{activity.fromAreaId} to Area #{activity.toAreaId}
                    </p>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="py-4 text-center text-gray-500">No recent activities</li>
          )}
        </ul>
      </CardContent>
      <CardFooter className="bg-gray-50 p-4 rounded-b-lg">
        <div className="text-sm">
          <Link href="/documents">
            <a className="font-medium text-primary-600 hover:text-primary-500">
              View all activity
            </a>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
