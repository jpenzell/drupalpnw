import { useState, useEffect } from "react";
import { useSession } from "@/contexts/SessionContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Users, Smartphone } from "lucide-react";

interface JoinSessionScreenProps {
  initialCode?: string;
  onJoined: () => void;
}

export const JoinSessionScreen = ({ initialCode, onJoined }: JoinSessionScreenProps) => {
  const [code, setCode] = useState(initialCode?.toUpperCase() || "");
  const { joinSession, isLoading, error, session } = useSession();

  // Auto-join if initial code provided
  useEffect(() => {
    if (initialCode && !session) {
      joinSession(initialCode).then((success) => {
        if (success) onJoined();
      });
    }
  }, [initialCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 4) return;

    const success = await joinSession(code);
    if (success) {
      onJoined();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Smartphone className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Join Presentation</h1>
          <p className="text-muted-foreground">
            Enter the 4-character code shown on screen
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="XXXX"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))}
            className="text-center text-3xl font-mono tracking-[0.5em] h-16 uppercase"
            maxLength={4}
            autoFocus
          />

          {error && (
            <p className="text-destructive text-sm text-center">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-lg"
            disabled={code.length !== 4 || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <Users className="mr-2 h-5 w-5" />
                Join Session
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Look for the QR code or join code on the presenter's screen
        </p>
      </div>
    </div>
  );
};
