import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "wouter";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: "primary" | "success" | "warning" | "secondary";
  linkText: string;
  linkHref: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  linkText,
  linkHref,
}: StatsCardProps) {
  // Define color classes based on the color prop
  const colorClasses = {
    primary: {
      bg: "bg-primary-100",
      text: "text-primary-600",
      link: "text-primary-600 hover:text-primary-500",
    },
    success: {
      bg: "bg-success-100",
      text: "text-success-600",
      link: "text-success-600 hover:text-success-500",
    },
    warning: {
      bg: "bg-danger-100",
      text: "text-danger-600",
      link: "text-danger-600 hover:text-danger-500",
    },
    secondary: {
      bg: "bg-secondary-100",
      text: "text-secondary-600",
      link: "text-secondary-600 hover:text-secondary-500",
    },
  };

  const classes = colorClasses[color];

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${classes.bg} rounded-md p-3`}>
            <Icon className={`h-6 w-6 ${classes.text}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-semibold text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 p-4">
        <div className="text-sm">
          <Link href={linkHref}>
            <a className={`font-medium ${classes.link}`}>{linkText}</a>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
