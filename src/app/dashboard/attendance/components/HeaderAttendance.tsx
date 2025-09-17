"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
 

const HeaderAttendance: React.FC = ({

}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Attendance Management
          </h1>
          <p className="text-muted-foreground">
            Track and manage student attendance records
          </p>
        </div>
       
      </div>
    </div>
  );
};

export default HeaderAttendance;
