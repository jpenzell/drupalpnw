import { useCallback, useEffect, useRef, useState } from "react";

// Web Speech API types (not in TS lib by default)
interface SpeechRecognitionResultItem {
  transcript: string;
}
interface SpeechRecognitionResult {
  isFinal: boolean;
  0: SpeechRecognitionResultItem;
}
interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

const getCtor = (): SpeechRecognitionCtor | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

export interface LiveCaptions {
  supported: boolean;
  enabled: boolean;
  listening: boolean;
  /** Current caption line: finalized tail + in-progress words. */
  text: string;
  error: string | null;
  toggle: () => void;
}

/**
 * Live closed captions from the presenter's microphone using the browser's
 * built-in speech recognition (Chrome/Edge). Continuous, auto-restarts after
 * the service's periodic silence cutoff, keeps only the last phrase so the
 * caption bar never overflows.
 */
export const useLiveCaptions = (): LiveCaptions => {
  const [supported] = useState(() => getCtor() !== null);
  const [enabled, setEnabled] = useState(false);
  const [listening, setListening] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const wantOnRef = useRef(false);

  const stop = useCallback(() => {
    wantOnRef.current = false;
    setEnabled(false);
    setListening(false);
    setText("");
    const rec = recRef.current;
    recRef.current = null;
    if (rec) {
      rec.onresult = null;
      rec.onend = null;
      rec.onerror = null;
      try {
        rec.stop();
      } catch {
        /* already stopped */
      }
    }
  }, []);

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor) return;
    stop();
    wantOnRef.current = true;
    setEnabled(true);
    setError(null);

    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    recRef.current = rec;

    rec.onresult = (event) => {
      let line = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        line += event.results[i][0].transcript;
      }
      const trimmed = line.trim();
      if (!trimmed) return;
      // Keep the caption to the last ~14 words so it always fits one line.
      const words = trimmed.split(/\s+/);
      setText(words.length > 14 ? words.slice(-14).join(" ") : trimmed);
    };

    rec.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setError("Microphone access was blocked — allow the mic and try again.");
        stop();
      } else if (event.error === "audio-capture") {
        setError("No microphone found.");
        stop();
      }
      // "no-speech" / "network" are transient; onend restarts if still wanted.
    };

    rec.onend = () => {
      setListening(false);
      // The service stops after a stretch of silence — restart while enabled.
      if (wantOnRef.current && recRef.current === rec) {
        try {
          rec.start();
          setListening(true);
        } catch {
          /* restart raced a stop */
        }
      }
    };

    try {
      rec.start();
      setListening(true);
    } catch {
      setError("Couldn't start speech recognition.");
      stop();
    }
  }, [stop]);

  const toggle = useCallback(() => {
    if (wantOnRef.current) stop();
    else start();
  }, [start, stop]);

  useEffect(() => () => stop(), [stop]);

  return { supported, enabled, listening, text, error, toggle };
};
