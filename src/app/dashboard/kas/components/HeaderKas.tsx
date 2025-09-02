"use client";
import React from "react";

import { Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useKasManagement } from "@/hooks/use-kas";

const HeaderKas = (props) => {
  const {  setShowExportDialog } = props;
  const {isExporting } = useKasManagement();
  return (
    <div className="px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cash Management</h1>
          <p className="text-muted-foreground">
            Track income, expenses, and manage your organization&apos;s finances
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExportDialog(true)}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeaderKas;
