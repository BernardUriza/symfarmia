import { useState, useEffect } from 'react';

export const useAudioCapture = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach(t => t.stop());
    };
  }, [stream]);

  const start = async () => {
    const media = await navigator.mediaDevices.getUserMedia({ audio: true });
    setStream(media);
    return media;
  };

  const stop = () => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
  };

  return { stream, start, stop };
};

export default useAudioCapture;
