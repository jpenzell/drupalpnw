import { QRCodeSVG } from "qrcode.react";
import { getPublicOrigin } from "@/lib/publicUrl";
import { useSession } from "@/contexts/SessionContext";

interface JoinQRCardProps {
  /** QR edge in px. Default 280 (full slide). Use ~160 beside a headline. */
  size?: number;
}

/** Scan-to-join card: QR + join code. Renders nothing until a live session is running. */
export const JoinQRCard = ({ size = 280 }: JoinQRCardProps) => {
  const { session } = useSession();
  if (!session) return null;
  return (
    <div className="flex flex-col items-center gap-4 p-6 rounded-3xl border-2 border-border bg-card">
      <p className="slide-chrome uppercase tracking-widest font-semibold text-secondary">Scan to join</p>
      <div className="bg-white p-3 rounded-2xl">
        <QRCodeSVG value={`${getPublicOrigin()}/?join=${session.code}`} size={size} level="M" />
      </div>
      <p className="text-4xl font-mono font-bold tracking-widest text-primary">{session.code}</p>
    </div>
  );
};
