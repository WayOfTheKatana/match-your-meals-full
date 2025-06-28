import { useState, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useTextToSpeech = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);

  // Clean up audio resources
  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current = null;
    }
    setIsPlaying(false);
    setProgress(0);
  }, []);

  // Generate and play speech
  const speak = useCallback(async (text, options = {}) => {
    try {
      setIsLoading(true);
      setError('');
      setProgress(0);

      // Clean up any existing audio
      cleanup();

      console.log('🔄 Starting text-to-speech generation...');
      console.log('📝 Text to speak:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));

      // Validate input
      if (!text || text.trim().length === 0) {
        throw new Error('No text provided for speech generation');
      }

      // Prepare request payload
      const payload = {
        text: text.trim(),
        voice_id: options.voiceId || 'AZnzlk1XvdvUeBnXmlld', // Amelia voice
        model_id: options.modelId || 'eleven_monolingual_v1'
      };

      console.log('📡 Calling recipe-tts Edge Function...');

      // Call the Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('recipe-tts', {
        body: payload,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (functionError) {
        console.error('❌ Edge Function error:', functionError);
        throw new Error(`Speech generation failed: ${functionError.message}`);
      }

      // Check if we received audio data
      if (!data || !(data instanceof ArrayBuffer)) {
        throw new Error('Invalid audio data received from server');
      }

      console.log('✅ Audio data received:', data.byteLength, 'bytes');

      // Create audio blob and URL
      const audioBlob = new Blob([data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      console.log('🎵 Creating audio element...');

      // Create and configure audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Set up audio event listeners
      audio.addEventListener('loadstart', () => {
        console.log('🔄 Audio loading started...');
      });

      audio.addEventListener('canplay', () => {
        console.log('✅ Audio ready to play');
      });

      audio.addEventListener('play', () => {
        console.log('▶️ Audio playback started');
        setIsPlaying(true);
      });

      audio.addEventListener('pause', () => {
        console.log('⏸️ Audio playback paused');
        setIsPlaying(false);
      });

      audio.addEventListener('ended', () => {
        console.log('🏁 Audio playback ended');
        setIsPlaying(false);
        setProgress(100);
        // Clean up the blob URL
        URL.revokeObjectURL(audioUrl);
      });

      audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
          const progressPercent = (audio.currentTime / audio.duration) * 100;
          setProgress(progressPercent);
        }
      });

      audio.addEventListener('error', (e) => {
        console.error('❌ Audio playback error:', e);
        setError('Failed to play audio');
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      });

      // Start playback
      console.log('▶️ Starting audio playback...');
      await audio.play();

      console.log('✅ Text-to-speech generation and playback successful');

    } catch (err) {
      console.error('❌ Error in text-to-speech:', err);
      
      let errorMessage = 'Failed to generate speech. Please try again.';
      
      if (err.message?.includes('API key')) {
        errorMessage = 'Speech service not configured. Please contact support.';
      } else if (err.message?.includes('too long')) {
        errorMessage = 'Text is too long for speech generation.';
      } else if (err.message?.includes('Failed to connect')) {
        errorMessage = 'Unable to connect to speech service. Please check your internet connection.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, [cleanup]);

  // Stop current playback
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setProgress(0);
  }, []);

  // Pause current playback
  const pause = useCallback(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Resume current playback
  const resume = useCallback(() => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().catch(err => {
        console.error('Error resuming audio:', err);
        setError('Failed to resume audio playback');
      });
    }
  }, [isPlaying]);

  // Toggle play/pause
  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  }, [isPlaying, pause, resume]);

  // Clear error
  const clearError = useCallback(() => {
    setError('');
  }, []);

  // Cleanup on unmount
  const destroy = useCallback(() => {
    cleanup();
    setError('');
    setIsLoading(false);
  }, [cleanup]);

  return {
    speak,
    stop,
    pause,
    resume,
    toggle,
    clearError,
    destroy,
    isLoading,
    isPlaying,
    error,
    progress,
    // Utility functions
    isReady: !isLoading && !error,
    canPlay: audioRef.current && !isLoading,
  };
};