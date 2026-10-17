import { Network } from "lucide-react";

export const DeepLearningScreen = () => {
  return (
    <div className="flex-1 flex flex-col justify-center space-y-8 animate-slide-in">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
          The AI Story: Level 3
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-light">
          Deep Learning & Neural Networks — Inspired by the brain
        </p>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-l-4 border-l-purple-500 rounded-2xl p-8 shadow-lg">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
              <Network className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Deep Learning & Neural Networks (2010s→)
              </h2>
              <p className="text-muted-foreground text-lg italic">Layers upon layers of learning</p>
            </div>
          </div>
          <p className="text-foreground text-xl mb-6 leading-relaxed">
            <strong>The leap:</strong> Neural networks mimic how neurons connect in the brain—layers of interconnected nodes. 
            "Deep" means many layers (10, 50, 100+). With enough data and computing power, they learn incredibly complex patterns.
          </p>
          <p className="text-primary font-semibold text-lg">
            → First layer learns edges, second learns shapes, third learns objects. Hierarchical learning.
          </p>
        </div>

        <div className="bg-accent/10 border border-accent/20 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-accent mb-3">The 2012 ImageNet Breakthrough</h3>
          <p className="text-foreground text-lg leading-relaxed">
            A deep neural network called AlexNet crushed the competition in image recognition, 
            cutting error rates nearly in half. This moment proved deep learning worked at scale. 
            Every tech giant pivoted to neural networks overnight.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-background/60 p-6 rounded-xl border-2 border-purple-500/20 shadow-md">
            <p className="text-sm font-semibold text-purple-600 mb-3">Image Recognition</p>
            <p className="text-foreground text-lg mb-3 leading-relaxed">
              Your phone identifies faces, pets, landmarks
            </p>
            <p className="text-muted-foreground text-sm">
              Learns: edges → textures → shapes → objects
            </p>
          </div>

          <div className="bg-background/60 p-6 rounded-xl border-2 border-purple-500/20 shadow-md">
            <p className="text-sm font-semibold text-purple-600 mb-3">Voice Assistants</p>
            <p className="text-foreground text-lg mb-3 leading-relaxed">
              Siri, Alexa, Google Assistant
            </p>
            <p className="text-muted-foreground text-sm">
              Sound waves → phonemes → words → meaning
            </p>
          </div>

          <div className="bg-background/60 p-6 rounded-xl border-2 border-purple-500/20 shadow-md">
            <p className="text-sm font-semibold text-purple-600 mb-3">Self-Driving Cars</p>
            <p className="text-foreground text-lg mb-3 leading-relaxed">
              Tesla, Waymo perception systems
            </p>
            <p className="text-muted-foreground text-sm">
              Identifies pedestrians, traffic, lanes in real-time
            </p>
          </div>
        </div>

        <div className="bg-primary/10 border-2 border-primary/30 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-primary mb-4">
            What Made Deep Learning Possible?
          </h3>
          <div className="space-y-4 text-foreground text-lg">
            <div className="flex gap-3">
              <span className="text-2xl">💾</span>
              <div>
                <p className="font-semibold mb-1">Big Data</p>
                <p className="text-muted-foreground">Billions of images, hours of speech, petabytes of text available online</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="font-semibold mb-1">Computing Power (GPUs)</p>
                <p className="text-muted-foreground">Graphics processors train networks 100x faster than CPUs</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">🧠</span>
              <div>
                <p className="font-semibold mb-1">Better Algorithms</p>
                <p className="text-muted-foreground">Techniques like backpropagation, dropout, batch normalization</p>
              </div>
            </div>
          </div>
          <p className="text-primary font-semibold text-lg mt-6">
            → Now apply these same techniques to <em>language itself</em>, and you get...
          </p>
        </div>
      </div>
    </div>
  );
};
