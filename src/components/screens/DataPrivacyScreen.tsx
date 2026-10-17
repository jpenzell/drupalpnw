import { Lock, CheckCircle, Shield } from "lucide-react";

export const DataPrivacyScreen = () => {
  return (
    <div className="flex-1 flex flex-col justify-center space-y-8 animate-slide-in">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
          Data Privacy: Stay in Control
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto">
          What to share, what NOT to share
        </p>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Microsoft Copilot Emphasis */}
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-2 border-blue-500/30 rounded-2xl p-8 shadow-lg">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Enterprise AI Tools
              </h2>
              <p className="text-muted-foreground text-lg italic">Secure, approved platforms</p>
            </div>
          </div>
          <p className="text-foreground text-xl mb-6 leading-relaxed">
            Enterprise AI tools like Microsoft Copilot are integrated with your organization's Microsoft 365 environment. 
            They have data protection, compliance controls, and enterprise security built in.
          </p>
          <div className="bg-background/60 p-6 rounded-xl border border-blue-500/20">
            <p className="text-blue-600 font-semibold text-lg mb-3">✓ What this means for you:</p>
            <ul className="space-y-2 text-foreground text-lg">
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>Your data stays within your organization's Microsoft environment</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>Conversations aren't used to train public AI models</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>IT can monitor and manage access</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>Complies with your organization's security policies</span>
              </li>
            </ul>
          </div>
          <p className="text-primary font-semibold text-xl mt-6">
            → Use approved enterprise tools for work tasks. Avoid free consumer AI tools (ChatGPT, Claude) for business data.
          </p>
        </div>

        {/* What to Share / Not Share */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-green-500/10 border-2 border-green-500/30 rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-green-600 mb-6 flex items-center gap-2">
              <CheckCircle className="h-7 w-7" />
              ✓ Safe to Share
            </h3>
            <ul className="space-y-4 text-foreground text-lg">
              <li className="flex gap-3">
                <span className="text-green-600 font-bold">•</span>
                <span>De-identified scenarios</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-600 font-bold">•</span>
                <span>Aggregated data</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-600 font-bold">•</span>
                <span>Public information</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-600 font-bold">•</span>
                <span>Drafting templates</span>
              </li>
            </ul>
          </div>

          <div className="bg-destructive/10 border-2 border-destructive/30 rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-destructive mb-6 flex items-center gap-2">
              <Lock className="h-7 w-7" />
              ✗ NEVER Share
            </h3>
            <ul className="space-y-4 text-foreground text-lg">
              <li className="flex gap-3">
                <span className="text-destructive font-bold">•</span>
                <span><strong>PHI/PII:</strong> Patient names, SSNs</span>
              </li>
              <li className="flex gap-3">
                <span className="text-destructive font-bold">•</span>
                <span><strong>Employee data:</strong> Salaries, reviews</span>
              </li>
              <li className="flex gap-3">
                <span className="text-destructive font-bold">•</span>
                <span><strong>Proprietary info:</strong> Trade secrets</span>
              </li>
              <li className="flex gap-3">
                <span className="text-destructive font-bold">•</span>
                <span><strong>Legal matters:</strong> Active litigation</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-accent/10 border-2 border-accent/20 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-accent mb-4">
            💡 Rule of Thumb
          </h3>
          <p className="text-foreground text-xl leading-relaxed">
            If you wouldn't post it on the company intranet for everyone to see, don't share it with AI—even Microsoft Copilot. 
            When in doubt, anonymize or ask your manager.
          </p>
        </div>
      </div>
    </div>
  );
};
