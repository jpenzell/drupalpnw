import { QRCodeSVG } from "qrcode.react";
import { useSession } from "@/contexts/SessionContext";
import { Users, Copy, Check, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getPublicOrigin } from "@/lib/publicUrl";

export const SessionQRCode = () => {
  const { session, participantCount, isPresenter } = useSession();
  const [copied, setCopied] = useState(false);

  if (!session || !isPresenter) return null;

  const joinUrl = `${getPublicOrigin()}${window.location.pathname}?join=${session.code}`;

  const copyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <QrCode className="h-4 w-4" />
          <span className="hidden sm:inline">{session.code}</span>
          <span className="flex items-center gap-1 text-primary">
            <Users className="h-3 w-3" />
            {participantCount}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-center">Join the Presentation</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-6 py-4 w-full">
          <div className="bg-white p-4 rounded-xl shadow-md mx-auto">
            <QRCodeSVG value={joinUrl} size={200} level="M" />
          </div>
          
          <div className="text-center space-y-2 w-full">
            <p className="text-muted-foreground">Scan the QR code or enter code:</p>
            <p className="text-4xl font-mono font-bold tracking-widest text-primary">
              {session.code}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full max-w-sm mx-auto">
            <code className="flex-1 bg-muted px-3 py-2 rounded text-sm truncate">
              {joinUrl}
            </code>
            <Button variant="outline" size="icon" onClick={copyLink}>
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-muted-foreground w-full">
            <Users className="h-4 w-4" />
            <span>{participantCount} participant{participantCount !== 1 ? "s" : ""} connected</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
