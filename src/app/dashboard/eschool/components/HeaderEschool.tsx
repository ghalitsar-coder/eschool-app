"use client";
import React from "react";
import { Plus, Building, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";

interface HeaderEschoolProps {
  setShowCreateDialog: (show: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const HeaderEschool: React.FC<HeaderEschoolProps> = ({ 
  setShowCreateDialog,
  searchTerm,
  setSearchTerm
}) => {
  const { user } = useAuth();

  return (
    <div className="px-4 lg:px-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Building className="h-8 w-8 text-primary" />
            Eschool Management
          </h1>
          <p className="text-muted-foreground">
            Manage your school's extracurricular activities
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search eschools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <div className="flex gap-2">
            {user?.role === "staff" && (
              <Button onClick={() => setShowCreateDialog(true)} className="whitespace-nowrap">
                <Plus className="h-4 w-4 mr-2" />
                Create Eschool
              </Button>
            )}
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderEschool;