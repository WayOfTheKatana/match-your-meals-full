// import { useState, useRef, useCallback } from 'react';
// import { supabase } from '../lib/supabase';

// export const useTextToSpeech = () => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [error, setError] = useState('');
//   const [progress, setProgress] = useState(0);
//   const audioRef = useRef(null);
//   const audioContextRef = useRef(null);

//   // Clean up audio resources
//   const cleanup = useCallback(() => {
//     if (audioRef.current) {
//       audioRef.current.pause();
//       audioRef.current.src = '';
//       audioRef.current = null;
//     }
//     if (audioContextRef.current) {
//       audioContextRef.current = null;
//     }
//     setIsPlaying(false);
//     setProgress(0);
//   }, []);

//   // Validate audio data
//   const validateAudioData = (data) => {
//     if (!data) {
//       throw new Error('No audio data received from server');
//     }

//     // Check if data is ArrayBuffer or Uint8Array
//     if (!(data instanceof ArrayBuffer) && !(data instanceof Uint8Array)) {
//       throw new Error('Invalid audio data format received');
//     }

//     // Check if data has content
//     const byteLength = data instanceof ArrayBuffer ? data.byteLength : data.length;
//     if (byteLength === 0) {
//       throw new Error('Empty audio data received from server');
//     }

//     // Minimum size check (audio files should be at least a few hundred bytes)
//     if (byteLength < 100) {
//       throw new Error('Audio data too small to be valid');
//     }

//     return true;
//   };

//   // Generate and play speech
//   const speak = useCallback(async (text, options = {}) => {
//     try {
//       setIsLoading(true);
//       setError('');
//       setProgress(0);

//       // Clean up any existing audio
//       cleanup();

//       console.log('🔄 Starting text-to-speech generation...');
//       console.log('📝 Text to speak:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));

//       // Validate input
//       if (!text || text.trim().length === 0) {
//         throw new Error('No text provided for speech generation');
//       }

//       // Prepare request payload
//       const payload = {
//         text: text.trim(),
//         voice_id: options.voiceId || 'v8DWAeuEGQSfwxqdH9t2', // Updated voice ID
//         model_id: options.modelId || 'eleven_monolingual_v1'
//       };

//       console.log('📡 Calling recipe-tts Edge Function...');

//       // Call the Edge Function with responseType: 'arraybuffer'
//       const { data, error: functionError } = await supabase.functions.invoke('recipe-tts', {
//         body: payload,
//         responseType: 'arraybuffer'
//       });

//       // Check for errors in the response
//       if (functionError) {
//         console.error('❌ Edge Function error:', functionError);
//         throw new Error(`Server error: ${functionError.message || 'Unknown error'}`);
//       }

//       // Validate audio data
//       validateAudioData(data);

//       const byteLength = data instanceof ArrayBuffer ? data.byteLength : data.length;
//       console.log('✅ Valid audio data received:', byteLength, 'bytes');

//       // Create audio blob with explicit MIME type
//       const audioBlob = new Blob([data], { type: 'audio/mpeg' });
      
//       // Verify blob was created successfully
//       if (audioBlob.size === 0) {
//         throw new Error('Failed to create audio blob - no data');
//       }

//       console.log('🎵 Audio blob created successfully:', audioBlob.size, 'bytes');
//       const audioUrl = URL.createObjectURL(audioBlob);

//       console.log('🎵 Creating audio element...');

//       // Create and configure audio element
//       const audio = new Audio();
//       audioRef.current = audio;

//       // Set up audio event listeners before setting src
//       audio.addEventListener('loadstart', () => {
//         console.log('🔄 Audio loading started...');
//       });

//       audio.addEventListener('canplay', () => {
//         console.log('✅ Audio ready to play');
//       });

//       audio.addEventListener('play', () => {
//         console.log('▶️ Audio playback started');
//         setIsPlaying(true);
//       });

//       audio.addEventListener('pause', () => {
//         console.log('⏸️ Audio playback paused');
//         setIsPlaying(false);
//       });

//       audio.addEventListener('ended', () => {
//         console.log('🏁 Audio playback ended');
//         setIsPlaying(false);
//         setProgress(100);
//         // Clean up the blob URL
//         URL.revokeObjectURL(audioUrl);
//       });

//       audio.addEventListener('timeupdate', () => {
//         if (audio.duration) {
//           const progressPercent = (audio.currentTime / audio.duration) * 100;
//           setProgress(progressPercent);
//         }
//       });

//       audio.addEventListener('error', (e) => {
//         console.error('❌ Audio playback error:', e);
//         console.error('❌ Audio error details:', {
//           error: audio.error,
//           networkState: audio.networkState,
//           readyState: audio.readyState,
//           src: audio.src
//         });
        
//         let errorMessage = 'Failed to play audio';
//         if (audio.error) {
//           switch (audio.error.code) {
//             case audio.error.MEDIA_ERR_ABORTED:
//               errorMessage = 'Audio playback was aborted';
//               break;
//             case audio.error.MEDIA_ERR_NETWORK:
//               errorMessage = 'Network error while loading audio';
//               break;
//             case audio.error.MEDIA_ERR_DECODE:
//               errorMessage = 'Audio format not supported or corrupted';
//               break;
//             case audio.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
//               errorMessage = 'Audio format not supported by browser';
//               break;
//             default:
//               errorMessage = 'Unknown audio playback error';
//           }
//         }
        
//         setError(errorMessage);
//         setIsPlaying(false);
//         URL.revokeObjectURL(audioUrl);
//       });

//       // Set the audio source
//       audio.src = audioUrl;

//       // Load the audio
//       audio.load();

//       // Wait for audio to be ready, then play
//       await new Promise((resolve, reject) => {
//         const onCanPlay = () => {
//           audio.removeEventListener('canplay', onCanPlay);
//           audio.removeEventListener('error', onError);
//           resolve();
//         };

//         const onError = (e) => {
//           audio.removeEventListener('canplay', onCanPlay);
//           audio.removeEventListener('error', onError);
//           reject(new Error('Failed to load audio for playback'));
//         };

//         audio.addEventListener('canplay', onCanPlay);
//         audio.addEventListener('error', onError);
        
//         // If audio is already ready to play, resolve immediately
//         if (audio.readyState >= 3) {
//           resolve();
//         }
//       });

//       // Start playback
//       console.log('▶️ Starting audio playback...');
//       await audio.play();

//       console.log('✅ Text-to-speech generation and playback successful');

//     } catch (err) {
//       console.error('❌ Error in text-to-speech:', err);
      
//       let errorMessage = 'Failed to generate speech. Please try again.';
      
//       if (err.message?.includes('API key')) {
//         errorMessage = 'Speech service not configured. Please contact support.';
//       } else if (err.message?.includes('too long')) {
//         errorMessage = 'Text is too long for speech generation.';
//       } else if (err.message?.includes('Failed to connect')) {
//         errorMessage = 'Unable to connect to speech service. Please check your internet connection.';
//       } else if (err.message?.includes('audio data')) {
//         errorMessage = 'Invalid audio data received. Please try again.';
//       } else if (err.message?.includes('format not supported')) {
//         errorMessage = 'Audio format not supported by your browser.';
//       } else if (err.message) {
//         errorMessage = err.message;
//       }
      
//       setError(errorMessage);
//       setIsPlaying(false);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [cleanup]);

//   // Stop current playback
//   const stop = useCallback(() => {
//     if (audioRef.current) {
//       audioRef.current.pause();
//       audioRef.current.currentTime = 0;
//     }
//     setIsPlaying(false);
//     setProgress(0);
//   }, []);

//   // Pause current playback
//   const pause = useCallback(() => {
//     if (audioRef.current && isPlaying) {
//       audioRef.current.pause();
//     }
//   }, [isPlaying]);

//   // Resume current playback
//   const resume = useCallback(() => {
//     if (audioRef.current && !isPlaying) {
//       audioRef.current.play().catch(err => {
//         console.error('Error resuming audio:', err);
//         setError('Failed to resume audio playback');
//       });
//     }
//   }, [isPlaying]);

//   // Toggle play/pause
//   const toggle = useCallback(() => {
//     if (isPlaying) {
//       pause();
//     } else {
//       resume();
//     }
//   }, [isPlaying, pause, resume]);

//   // Clear error
//   const clearError = useCallback(() => {
//     setError('');
//   }, []);

//   // Cleanup on unmount
//   const destroy = useCallback(() => {
//     cleanup();
//     setError('');
//     setIsLoading(false);
//   }, [cleanup]);

//   return {
//     speak,
//     stop,
//     pause,
//     resume,
//     toggle,
//     clearError,
//     destroy,
//     isLoading,
//     isPlaying,
//     error,
//     progress,
//     // Utility functions
//     isReady: !isLoading && !error,
//     canPlay: audioRef.current && !isLoading,
//   };
// };

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
    // Debug logging
    console.log('🔍 Received data type:', typeof data);
    console.log('🔍 Data constructor:', data?.constructor?.name);
    
    if (!data) {
      throw new Error('No audio data received from server');
    }

    // Check if data is ArrayBuffer or Uint8Array
    if (!(data instanceof ArrayBuffer) && !(data instanceof Uint8Array)) {
      console.error('❌ Expected ArrayBuffer or Uint8Array, got:', typeof data, data?.constructor?.name);
      throw new Error(`Invalid audio data format received: ${typeof data}`);
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

    console.log('✅ Audio data validation passed:', byteLength, 'bytes');
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
        voice_id: options.voiceId || 'AZnzlk1XvdvUeBnXmld',
        model_id: options.modelId || 'eleven_monolingual_v1'
      };

      console.log('📡 Calling recipe-tts Edge Function...');

      // Try direct fetch approach first as a fallback
      let audioData;
      let useDirectFetch = false;

      try {
        // Call the Edge Function with responseType: 'arraybuffer'
        const { data, error: functionError } = await supabase.functions.invoke('recipe-tts', {
          body: payload,
          responseType: 'arraybuffer'
        });

        // Comprehensive debugging
        console.log('🔍 Full response debugging:');
        console.log('- functionError:', functionError);
        console.log('- data type:', typeof data);
        console.log('- data constructor:', data?.constructor?.name);
        console.log('- data instance checks:', {
          isArrayBuffer: data instanceof ArrayBuffer,
          isUint8Array: data instanceof Uint8Array,
          isNull: data === null,
          isUndefined: data === undefined
        });
        
        if (data) {
          console.log('- data properties:', Object.getOwnPropertyNames(data));
          if (data.byteLength !== undefined) {
            console.log('- data.byteLength:', data.byteLength);
          }
          if (data.length !== undefined) {
            console.log('- data.length:', data.length);
          }
        }

        // Check for errors in the response
        if (functionError) {
          console.error('❌ Edge Function error:', functionError);
          throw new Error(`Server error: ${functionError.message || 'Unknown error'}`);
        }

        // Handle different response types
        audioData = data;
        
        // If data is null or undefined
        if (!data) {
          throw new Error('No data received from server');
        }

        // If data is an object (potentially JSON response)
        if (typeof data === 'object' && !(data instanceof ArrayBuffer) && !(data instanceof Uint8Array)) {
          console.log('🔍 Received object response, checking for audio data...');
          
          // Try to decode as text to see if it's a JSON error
          try {
            let textData;
            if (data instanceof ArrayBuffer) {
              textData = new TextDecoder().decode(data);
            } else {
              textData = JSON.stringify(data);
            }
            
            console.log('🔍 Response as text:', textData.substring(0, 200));
            
            // Try to parse as JSON
            const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
            
            if (parsedData.error) {
              throw new Error(`Server error: ${parsedData.error}`);
            }
            
            // If it has audioData property, use that
            if (parsedData.audioData) {
              if (typeof parsedData.audioData === 'string') {
                // Convert base64 to ArrayBuffer
                const binaryString = atob(parsedData.audioData);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                audioData = bytes.buffer;
              } else {
                audioData = parsedData.audioData;
              }
            } else {
              console.log('🔄 No audio data in response, trying direct fetch...');
              useDirectFetch = true;
            }
          } catch (parseError) {
            console.error('❌ Failed to parse response:', parseError);
            console.log('🔄 Trying direct fetch as fallback...');
            useDirectFetch = true;
          }
        }

      } catch (supabaseError) {
        console.error('❌ Supabase invoke error:', supabaseError);
        console.log('🔄 Trying direct fetch as fallback...');
        useDirectFetch = true;
      }

      // Fallback: Direct fetch to the Edge Function URL
      if (useDirectFetch) {
        try {
          console.log('📡 Using direct fetch to Edge Function...');
          
          // Get the Supabase project URL
          const supabaseUrl = supabase.supabaseUrl;
          const functionUrl = `${supabaseUrl}/functions/v1/recipe-tts`;
          
          const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabase.supabaseKey}`,
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Direct fetch error: ${response.status} - ${errorText}`);
          }

          audioData = await response.arrayBuffer();
          console.log('✅ Direct fetch successful, received:', audioData.byteLength, 'bytes');

        } catch (fetchError) {
          console.error('❌ Direct fetch also failed:', fetchError);
          throw new Error('Failed to generate speech using both methods');
        }
      }

      // Validate audio data
      validateAudioData(audioData);

      const byteLength = audioData instanceof ArrayBuffer ? audioData.byteLength : audioData.length;
      console.log('✅ Valid audio data received:', byteLength, 'bytes');

      // Create audio blob with explicit MIME type
      const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
      
      // Verify blob was created successfully
      if (audioBlob.size === 0) {
        throw new Error('Failed to create audio blob - no data');
      }

      console.log('🎵 Audio blob created successfully:', audioBlob.size, 'bytes');
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
        const timeoutId = setTimeout(() => {
          audio.removeEventListener('canplay', onCanPlay);
          audio.removeEventListener('error', onError);
          reject(new Error('Audio loading timeout'));
        }, 10000); // 10 second timeout

        const onCanPlay = () => {
          clearTimeout(timeoutId);
          audio.removeEventListener('canplay', onCanPlay);
          audio.removeEventListener('error', onError);
          resolve();
        };

        const onError = (e) => {
          clearTimeout(timeoutId);
          audio.removeEventListener('canplay', onCanPlay);
          audio.removeEventListener('error', onError);
          reject(new Error('Failed to load audio for playback'));
        };

        audio.addEventListener('canplay', onCanPlay);
        audio.addEventListener('error', onError);
        
        // If audio is already ready to play, resolve immediately
        if (audio.readyState >= 3) {
          clearTimeout(timeoutId);
          resolve();
        }
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
      } else if (err.message?.includes('Rate limit')) {
        errorMessage = 'Too many requests. Please wait a moment before trying again.';
      } else if (err.message?.includes('timeout')) {
        errorMessage = 'Audio loading took too long. Please try again.';
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