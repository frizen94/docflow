import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format, differenceInDays } from "date-fns";
import { Document } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function UpcomingDeadlines() {
  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents/deadline/3"],
  });

  // Function to get appropriate badge color based on days remaining
  const getBadgeColor = (deadline: Date) => {
    const daysRemaining = differenceInDays(new Date(deadline), new Date());
    if (daysRemaining <= 0) return "bg-danger-100 text-danger-800";
    if (daysRemaining <= 1) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  // Function to get appropriate badge text based on days remaining
  const getBadgeText = (deadline: Date) => {
    const daysRemaining = differenceInDays(new Date(deadline), new Date());
    if (daysRemaining <= 0) return "Today";
    if (daysRemaining === 1) return "Tomorrow";
    return `${daysRemaining} days`;
  };

  return (
    <Card>
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-medium text-gray-900">Upcoming Deadlines</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ul className="divide-y divide-gray-200">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="py-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-md" />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </li>
            ))
          ) : documents && documents.length > 0 ? (
            documents.map((doc, index) => (
              <li key={doc.id} className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-gray-100 text-gray-700">
                      <span className="text-xl font-semibold">{index + 1}</span>
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {doc.subject}
                    </p>
                    <p className="text-sm text-gray-500">Area ID: {doc.currentAreaId}</p>
                  </div>
                  <div>
                    {doc.deadline && (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColor(
                          new Date(doc.deadline)
                        )}`}
                      >
                        {getBadgeText(new Date(doc.deadline))}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="py-4 text-center text-gray-500">No upcoming deadlines</li>
          )}
        </ul>
      </CardContent>
      <CardFooter className="bg-gray-50 p-4 rounded-b-lg">
        <div className="text-sm">
          <Link href="/documents">
            <a className="font-medium text-primary-600 hover:text-primary-500">
              View all deadlines
            </a>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
