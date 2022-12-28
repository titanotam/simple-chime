import { useEffect, useRef } from 'react';
import { InvisibleAudio } from '../ui-components';

export default function AudioOutput({ meetingSession }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) {
      console.error("No audio element found.");
      return;
    }

    const audioElement = audioRef.current;
    meetingSession.audioVideo.bindAudioElement(audioElement);
  }, [meetingSession]);

  return <InvisibleAudio ref={audioRef} />;
}