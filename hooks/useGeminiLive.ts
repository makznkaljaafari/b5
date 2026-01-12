
import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage, Blob } from '@google/genai';
import { SYSTEM_INSTRUCTION, aiTools } from '../services/geminiService';
import { useIsMounted } from './useIsMounted';
import { logger } from '../services/loggerService';

// Audio Helpers
const encode = (bytes: Uint8Array) => {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
};

const decode = (base64: string) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
};

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const buffer = ctx.createBuffer(1, dataInt16.length, sampleRate);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
  return buffer;
}

export const useGeminiLive = (onToolCall: (fc: any) => void) => {
  const [isActive, setIsActive] = useState(false);
  const [statusText, setStatusText] = useState('جاهز لسماعك...');
  const isComponentMounted = useIsMounted();
  
  const sessionPromise = useRef<Promise<any> | null>(null);
  const nextStartTime = useRef(0);
  const audioContexts = useRef<{ input: AudioContext | null, output: AudioContext | null }>({ input: null, output: null });
  const mediaStream = useRef<MediaStream | null>(null);
  const audioSources = useRef<Set<AudioBufferSourceNode>>(new Set());
  const abortControllerRef = useRef<AbortController | null>(null); // New AbortController for live session

  const playAudio = useCallback(async (base64Audio: string) => {
    const ctx = audioContexts.current.output;
    if (!ctx || !isComponentMounted()) return;
    try {
      const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000);
      nextStartTime.current = Math.max(nextStartTime.current, ctx.currentTime);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => audioSources.current.delete(source);
      
      if (abortControllerRef.current?.signal.aborted) { // Check if session was aborted before playing audio
        logger.warn("Audio playback skipped because session was aborted.");
        return;
      }
      source.start(nextStartTime.current);
      nextStartTime.current += audioBuffer.duration;
      audioSources.current.add(source);
    } catch (e) { 
      logger.error("Audio playback error:", e); 
    }
  }, [isComponentMounted]);

  const stop = useCallback(async () => {
    logger.info("Stopping Gemini Live session...");
    mediaStream.current?.getTracks().forEach(t => t.stop());
    mediaStream.current = null; // Clear media stream reference

    audioContexts.current.input?.close().catch(e => logger.error("Error closing input audio context:", e));
    audioContexts.current.output?.close().catch(e => logger.error("Error closing output audio context:", e));
    audioContexts.current = { input: null, output: null }; // Clear contexts
    
    // Abort any pending fetch requests associated with this session
    if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
        abortControllerRef.current.abort("Gemini Live session stopped.");
    }
    abortControllerRef.current = null; // Clear controller reference

    if (sessionPromise.current) {
        const session = await sessionPromise.current;
        session?.close();
        sessionPromise.current = null;
    }
    audioSources.current.forEach(s => { try { s.stop(); } catch(e){ logger.warn("Error stopping audio source on cleanup:", e); } });
    audioSources.current.clear();
    
    nextStartTime.current = 0;
    if (isComponentMounted()) {
        setIsActive(false);
        setStatusText('جاهز لسماعك...');
    }
  }, [isComponentMounted]);

  const start = useCallback(async () => {
    if (!isComponentMounted()) return; // Ensure component is mounted before starting
    if (abortControllerRef.current) { // If a session is already active or in process, stop it first.
      logger.warn("Attempted to start Gemini Live while already active. Stopping existing session.");
      await stop();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      setIsActive(true);
      setStatusText('جاري الاتصال...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStream.current = stream;

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContexts.current = { input: inputCtx, output: outputCtx };

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      sessionPromise.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            if (signal.aborted || !isComponentMounted()) return;
            setStatusText('أنا أستمع...');
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              if (signal.aborted) { // Prevent sending data if aborted
                scriptProcessor.disconnect();
                source.disconnect();
                return;
              }
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob: Blob = { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
              sessionPromise.current?.then(s => {
                if (signal.aborted) return; // Prevent sending if aborted after promise resolution
                s?.sendRealtimeInput({ media: pcmBlob });
              }).catch(err => {
                if (err.name !== 'AbortError') logger.error("Error sending realtime input:", err);
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (signal.aborted || !isComponentMounted()) return;
            if (msg.serverContent?.outputTranscription) setStatusText(msg.serverContent.outputTranscription.text);
            if (msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) playAudio(msg.serverContent.modelTurn.parts[0].inlineData.data);
            if (msg.toolCall) msg.toolCall.functionCalls.forEach(onToolCall);
          },
          onerror: (e) => { 
            if (e.error?.name === 'AbortError') {
              logger.warn("Gemini Live session error: AbortError", e.error.message);
            } else {
              logger.error("Gemini Live session error:", e); 
            }
            stop(); 
          },
          onclose: () => {
            logger.info("Gemini Live session closed.");
            stop();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ functionDeclarations: aiTools }],
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        },
      }, { signal }); // Pass signal to the connect method
    } catch (e: any) {
      if (e.name === 'AbortError') {
        logger.warn("Failed to start Gemini Live (aborted):", e.message);
      } else {
        logger.error("Failed to start Gemini Live:", e);
      }
      stop();
    }
  }, [isComponentMounted, playAudio, stop, onToolCall]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Ensure stop is called on unmount to clean up all resources
      stop(); 
    };
  }, [stop]);


  return { isActive, statusText, start, stop, setIsActive };
};
