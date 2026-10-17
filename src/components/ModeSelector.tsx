import { useState } from "react";
import { Monitor, Users, Presentation, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface ModeSelectorProps {
  currentMode: string;
}

export const ModeSelector = ({ currentMode }: ModeSelectorProps) => {
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();

  const modes = [
    {
      id: "presenter",
      label: "Presenter Mode",
      icon: Monitor,
      description: "Full controls, timer, and notes",
    },
    {
      id: "participant",
      label: "Participant Mode",
      icon: Users,
      description: "Follow along and interact",
    },
    {
      id: "present",
      label: "Presentation Mode",
      icon: Presentation,
      description: "Clean fullscreen view",
    },
  ];

  const copyLink = (mode: string) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const hash = window.location.hash;
    const url = `${baseUrl}?mode=${mode}${hash}`;
    
    navigator.clipboard.writeText(url);
    setCopied(mode);
    setTimeout(() => setCopied(null), 2000);
    
    toast({
      title: "Link copied!",
      description: `${mode.charAt(0).toUpperCase() + mode.slice(1)} mode link copied to clipboard`,
    });
  };

  const getCurrentModeData = () => {
    return modes.find((m) => m.id === currentMode) || modes[0];
  };

  const currentModeData = getCurrentModeData();
  const Icon = currentModeData.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Icon className="h-4 w-4" />
          {currentModeData.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Viewing Mode</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {modes.map((mode) => {
          const ModeIcon = mode.icon;
          return (
            <DropdownMenuItem
              key={mode.id}
              className="flex items-start gap-3 py-3 cursor-pointer"
              onClick={() => copyLink(mode.id)}
            >
              <ModeIcon className="h-4 w-4 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium">{mode.label}</div>
                <div className="text-xs text-muted-foreground">
                  {mode.description}
                </div>
              </div>
              {copied === mode.id ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
              )}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <div className="px-2 py-2 text-xs text-muted-foreground">
          Click any mode to copy its link and share with participants
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
