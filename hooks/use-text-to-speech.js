import { useState, useCallback, useEffect } from "react";
import { useAccessibility } from "@/components/accessibility-provider";
import { toast } from "sonner";

export function useTextToSpeech() {
  const { speechSpeed, preferredVoiceLanguage } = useAccessibility();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);

  const [voices, setVoices] = useState([]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }

    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback((text) => {
    if (!supported || typeof window === "undefined") return;

    window.speechSynthesis.cancel(); // Cancel any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechSpeed || 1.0;

    // Try to find a voice that matches the preferred language (e.g. "en" or "hi")
    let voice = voices.find((v) => v.lang.startsWith(preferredVoiceLanguage));
    
    // Fallback if not found
    if (!voice && voices.length > 0) {
      voice = voices.find((v) => v.default) || voices[0];
      if (preferredVoiceLanguage !== "en") {
         toast.info(`Preferred voice language (${preferredVoiceLanguage}) not available. Using default.`);
      }
    }

    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error("Speech synthesis error", e);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [speechSpeed, preferredVoiceLanguage, supported]);

  const cancel = useCallback(() => {
    if (!supported || typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [supported]);

  return { speak, cancel, isSpeaking, supported };
}
