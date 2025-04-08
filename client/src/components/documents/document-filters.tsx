import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Area, DocumentType } from "@shared/schema";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

interface DocumentFiltersProps {
  onFilterChange: (filters: {
    status: string;
    areaId: string;
    search: string;
  }) => void;
}

export default function DocumentFilters({ onFilterChange }: DocumentFiltersProps) {
  const [status, setStatus] = useState<string>("all");
  const [areaId, setAreaId] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  // Fetch areas for the area filter
  const { data: areas } = useQuery<Area[]>({
    queryKey: ["/api/areas"],
  });

  // Update parent component with filter changes
  useEffect(() => {
    onFilterChange({ status, areaId, search });
  }, [status, areaId, search, onFilterChange]);

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-2">
            <Label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">
              Status
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="area-filter" className="block text-sm font-medium text-gray-700">
              Area
            </Label>
            <Select value={areaId} onValueChange={setAreaId}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select area" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Areas</SelectItem>
                  {areas?.map((area) => (
                    <SelectItem key={area.id} value={area.id.toString()}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="search-documents" className="block text-sm font-medium text-gray-700">
              Search
            </Label>
            <div className="mt-1 relative rounded-md">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="search-documents"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                placeholder="Search documents..."
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
