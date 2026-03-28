import { useEffect, useRef, useState } from 'react';
import type { AmbientSound } from '../types';

const SOUND_URLS: Record<Exclude<AmbientSound, 'none'>, string> = {
  rain:       '/sounds/rain.mp3',
  whitenoise: '/sounds/whitenoise.mp3',
  lofi:       '/sounds/lofi.mp3',
  forest:     '/sounds/forest.mp3',
};

const VOLUMES: Record<Exclude<AmbientSound, 'none'>, number> = {
  rain:       0.55,
  whitenoise: 0.35,
  lofi:       0.90,
  forest:     0.60,
};

export function useAmbientSound() {
  const [selectedSound, setSelectedSound] = useState<AmbientSound>('none');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Stop and release previous audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }

    if (selectedSound === 'none') return;

    const audio = new Audio(SOUND_URLS[selectedSound]);
    audio.loop = true;
    audio.volume = VOLUMES[selectedSound];
    audio.play().catch(() => {
      // Autoplay policy: play() starts on next user interaction if blocked
    });
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [selectedSound]);

  return { selectedSound, setSelectedSound };
}
