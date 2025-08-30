import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "./auth-provider";
import { QueryProvider } from "./query-provider";

type ProvidersProps = {
  children: React.ReactNode;
};

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <QueryProvider>
      {/* <AuthProvider> */}
        {children}
        {/* </AuthProvider> */}
      <Toaster />
    </QueryProvider>
  );
};
