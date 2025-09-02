import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, X } from "lucide-react";
import React from "react";

interface ErrorEschoolAlertProps {
  eschoolsError?: any;
  createEschoolError?: any;
  updateEschoolError?: any;
  deleteEschoolError?: any;
}

const ErrorEschoolAlert: React.FC<ErrorEschoolAlertProps> = ({
  eschoolsError,
  createEschoolError,
  updateEschoolError,
  deleteEschoolError,
}) => {
  const hasErrors = eschoolsError || createEschoolError || updateEschoolError || deleteEschoolError;

  if (!hasErrors) return null;

  return (
    <div className="px-4 lg:px-6">
      <Alert variant="destructive" className="flex items-start gap-2">
        <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="space-y-1">
            {eschoolsError && <div>Eschools: {eschoolsError.message}</div>}
            {createEschoolError && <div>Create Eschool: {createEschoolError.message}</div>}
            {updateEschoolError && <div>Update Eschool: {updateEschoolError.message}</div>}
            {deleteEschoolError && <div>Delete Eschool: {deleteEschoolError.message}</div>}
          </AlertDescription>
        </div>
        <button 
          className="text-muted-foreground hover:text-foreground"
          onClick={() => window.location.reload()}
        >
          <X className="h-4 w-4" />
        </button>
      </Alert>
    </div>
  );
};

export default ErrorEschoolAlert;