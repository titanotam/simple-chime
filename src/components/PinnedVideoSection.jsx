import { useEffect, useRef } from 'react';
import { Video } from '../ui-components';
import { copyStreamToPinnedVideo } from '../Util';

export default function PinnedVideoSection() {
  const videoRef = useRef(null);

  useEffect(() => {
    const workerId = setInterval(() => {
      if (videoRef.current.srcObject && videoRef.current.srcObject.active) {
        return;
      }

      const foundActiveStreamingElement = Array.from(
        document.getElementsByClassName("streaming-video")
      ).find((el) => el.srcObject && el.srcObject.active);
      copyStreamToPinnedVideo(foundActiveStreamingElement, videoRef.current);
    }, 3000);
    return () => clearInterval(workerId);
  }, []);

  return (
    <Video
      ref={videoRef}
      id="video-pinned"
      aria-label="Pinned video"
      style={{ maxHeight: "80vh", objectFit: "contain" }}
      width={undefined}
      height={undefined}
    />
  );
}