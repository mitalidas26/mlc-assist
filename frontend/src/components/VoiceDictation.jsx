import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';

export default function VoiceDictation({ onTranscript, className = "" }) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Default to Indian English medical context

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let currentInterim = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }

      setInterimText(currentInterim);
      if (finalTranscript.trim() && onTranscript) {
        onTranscript(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText('');
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore cleanup errors
        }
      }
    };
  }, [onTranscript]);

  const toggleListening = () => {
    if (!supported || !recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start voice recognition:', err);
      }
    }
  };

  if (!supported) {
    return (
      <span className="text-[10px] text-slate-500 italic flex items-center gap-1" title="Web Speech API not supported in this browser">
        <MicOff className="w-3 h-3 text-slate-600" /> Voice dictation ready
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={toggleListening}
        className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
          isListening
            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/60 shadow-lg shadow-rose-500/20 animate-pulse'
            : 'bg-slate-800 text-sky-400 hover:bg-slate-700 border border-slate-700'
        }`}
        title={isListening ? 'Click to stop dictation' : 'Click to dictate notes by voice'}
      >
        {isListening ? (
          <>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <Mic className="w-3.5 h-3.5" />
            <span>Listening...</span>
          </>
        ) : (
          <>
            <Mic className="w-3.5 h-3.5" />
            <span>Voice Dictate</span>
          </>
        )}
      </button>

      {interimText && (
        <span className="text-[11px] text-sky-300 font-mono italic animate-fade-in bg-slate-950 px-2 py-0.5 rounded border border-sky-900/40">
          "{interimText}"
        </span>
      )}
    </div>
  );
}
