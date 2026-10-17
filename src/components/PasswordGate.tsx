import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";

const SESSION_KEY = "presentation_auth_token";

interface PasswordGateProps {
  children: React.ReactNode;
}

export const PasswordGate = ({ children }: PasswordGateProps) => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { authReady } = useSession();

  useEffect(() => {
    if (!authReady) return;
    // Check if already authenticated in this session
    const token = sessionStorage.getItem(SESSION_KEY);
    if (token && token.length === 36) { // UUID format check
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, [authReady]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      toast.error("Please enter a password");
      return;
    }

    if (password.length > 100) {
      toast.error("Password too long");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke("verify-password", {
        body: { password: password.trim() },
      });

      if (error) {
        console.error("Verification error:", error);
        toast.error("Failed to verify password");
        setPassword("");
        return;
      }

      if (data?.valid && data?.token) {
        sessionStorage.setItem(SESSION_KEY, data.token);
        setIsAuthenticated(true);
        toast.success("Access granted");
      } else {
        toast.error("Incorrect password");
        setPassword("");
      }
    } catch (error) {
      console.error("Error verifying password:", error);
      toast.error("Failed to verify password");
      setPassword("");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Protected Presentation</CardTitle>
            <CardDescription>
              Please enter the password to access this presentation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-center"
                  autoFocus
                  maxLength={100}
                  disabled={isSubmitting}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Verifying..." : "Access Presentation"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
