import "./keynote.css";
import sponsorSlideImage from "@/assets/pnw-drupal-sponsors-2026.jpg";
import { usePresentationMode } from "@/contexts/PresentationModeContext";
import { JoinQRCard } from "./JoinQRCard";

export const KeynoteTitleScreen = () => {
  const { presenterName, presenterCompany } = usePresentationMode();
  return (
    <main aria-label="AI for All Minds — title" className="keynote-stage flex-1 min-h-0">
      <h1 className="keynote-headline">AI for All Minds</h1>
      <p className="keynote-label">{presenterName} · {presenterCompany}</p>
    </main>
  );
};

export const KeynoteSponsorScreen = () => (
  <main
    aria-label="Thank you to our sponsors"
    className="flex-1 min-h-0 h-full w-full qr-paper flex items-center justify-center overflow-hidden"
  >
    <img
      src={sponsorSlideImage}
      alt="Thank you to our sponsors — official PNW Drupal Summit 2026 artwork: Acquia; Slalom; Diffy; Tag1 Consulting; ImageX; MindSing Creative Works; Affinity Bridge; Morrison Multimedia Inc.; Sandstorm Design; Blue Drop Labs; Woolwich Web Works; Tugboat."
      className="h-full w-full object-contain"
      loading="eager"
      draggable={false}
    />
  </main>
);
