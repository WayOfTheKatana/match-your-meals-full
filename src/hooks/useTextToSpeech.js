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

  // Validate audio data
  const validateAudioData = (data) => {
    if (!data) {
      throw new Error('No audio data received from server');
    }

    // Check if data is ArrayBuffer or Uint8Array
    if (!(data instanceof ArrayBuffer) && !(data instanceof Uint8Array)) {
      throw new Error('Invalid audio data format received');
    }

    // Check if data has content
    const byteLength = data instanceof ArrayBuffer ? data.byteLength : data.length;
    if (byteLength === 0) {
      throw new Error('Empty audio data received from server');
    }

    // Minimum size check (audio files should be at least a few hundred bytes)
    if (byteLength < 100) {
      throw new Error('Audio data too small to be valid');
    }

    return true;
  };

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
        voice_id: options.voiceId || 'v8DWAeuEGQSfwxqdH9t2', // Updated voice ID
        model_id: options.modelId || 'eleven_monolingual_v1'
      };

      console.log('📡 Calling recipe-tts Edge Function...');

      // Call the Edge Function
      const response = await supabase.functions.invoke('recipe-tts', {
        body: payload
      });

      // Check for errors in the response
      if (response.error) {
        console.error('❌ Edge Function error:', response.error);
        throw new Error(`Server error: ${response.error.message || 'Unknown error'}`);
      }

      // Validate audio data
      validateAudioData(response.data);

      const byteLength = response.data instanceof ArrayBuffer ? response.data.byteLength : response.data.length;
      console.log('✅ Valid audio data received:', byteLength, 'bytes');

      // Convert to ArrayBuffer if needed
      let audioData = response.data;
      if (response.data instanceof Uint8Array) {
        audioData = response.data.buffer.slice(
          response.data.byteOffset,
          response.data.byteOffset + response.data.byteLength
        );
      }

      // Create audio blob with explicit MIME type
      const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
      
      // Verify blob was created successfully
      if (audioBlob.size === 0) {
        throw new Error('Failed to create audio blob - no data');
      }

      const audioUrl = URL.createObjectURL(audioBlob);

      console.log('🎵 Creating audio element...');

      // Create and configure audio element
      const audio = new Audio();
      audioRef.current = audio;

      // Set up audio event listeners before setting src
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
        console.error('❌ Audio error details:', {
          error: audio.error,
          networkState: audio.networkState,
          readyState: audio.readyState,
          src: audio.src
        });
        
        let errorMessage = 'Failed to play audio';
        if (audio.error) {
          switch (audio.error.code) {
            case audio.error.MEDIA_ERR_ABORTED:
              errorMessage = 'Audio playback was aborted';
              break;
            case audio.error.MEDIA_ERR_NETWORK:
              errorMessage = 'Network error while loading audio';
              break;
            case audio.error.MEDIA_ERR_DECODE:
              errorMessage = 'Audio format not supported or corrupted';
              break;
            case audio.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = 'Audio format not supported by browser';
              break;
            default:
              errorMessage = 'Unknown audio playback error';
          }
        }
        
        setError(errorMessage);
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      });

      // Set the audio source
      audio.src = audioUrl;

      // Load the audio
      audio.load();

      // Wait for audio to be ready, then play
      await new Promise((resolve, reject) => {
        const onCanPlay = () => {
          audio.removeEventListener('canplay', onCanPlay);
          audio.removeEventListener('error', onError);
          resolve();
        };

        const onError = (e) => {
          audio.removeEventListener('canplay', onCanPlay);
          audio.removeEventListener('error', onError);
          reject(new Error('Failed to load audio for playback'));
        };

        audio.addEventListener('canplay', onCanPlay);
        audio.addEventListener('error', onError);
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
      } else if (err.message?.includes('audio data')) {
        errorMessage = 'Invalid audio data received. Please try again.';
      } else if (err.message?.includes('format not supported')) {
        errorMessage = 'Audio format not supported by your browser.';
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