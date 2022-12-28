import { Box } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { PeerBox, SectionBox, Video } from '../ui-components';

export default function StreamingVideosSection({ meetingSession }) {
  const localVideoRef = useRef(null);

  useEffect(() => {
    if (!localVideoRef.current) {
      console.error("No local video element found.");
      return;
    }

    const videoElement = localVideoRef.current;

    const observer = {
      videoTileDidUpdate: (tileState) => {
        if (!tileState.boundAttendeeId || !tileState.localTile) {
          return;
        }

        meetingSession.audioVideo.bindVideoElement(
          tileState.tileId,
          videoElement
        );
        videoElement.id = `video-${tileState.boundAttendeeId}`;
      },
    };

    meetingSession.audioVideo.addObserver(observer);

    meetingSession.audioVideo.startLocalVideoTile();
  }, [meetingSession]);

  const videoSlotsRef = useRef(
    Array(25)
      .fill()
      .map(() => ({ tileId: null, video: null }))
  );

  const [enabledTiles, setEnabledTiles] = useState([]);
  const enableTile = (tileId) =>
    setEnabledTiles((previous) => [...previous, tileId]);
  const disableTile = (tileId) =>
    setEnabledTiles((previous) => previous.filter((p) => p !== tileId));
  const isEnabledTile = (tileId) => enabledTiles.includes(tileId);

  useEffect(() => {
    const findSlot = (tileId) =>
      videoSlotsRef.current.find((slot) => slot.tileId === tileId) ||
      videoSlotsRef.current.find((slot) => !slot.tileId);
    const mapToAssignedSlot = (assigningTileId, assigningSlot) =>
      videoSlotsRef.current.map((slot) =>
        slot.video === assigningSlot.video
          ? { ...slot, tileId: assigningTileId }
          : slot
      );
    const mapToUnassignedSlot = (unassigningTileId) =>
      videoSlotsRef.current.map((slot) =>
        slot.tileId === unassigningTileId ? { ...slot, tileId: null } : slot
      );

    const mutateVideoSlotsRef = (updatingSlots) => {
      videoSlotsRef.current = updatingSlots;
    };

    const observer = {
      videoTileDidUpdate: (tileState) => {
        if (
          !tileState.boundAttendeeId ||
          tileState.localTile ||
          tileState.isContent
        ) {
          return;
        }

        const slot = findSlot(tileState.tileId);
        if (!slot) {
          throw new Error("Failed to find slot for remote peer.");
        }

        mutateVideoSlotsRef(mapToAssignedSlot(tileState.tileId, slot));

        if (tileState.active) {
          enableTile(tileState.tileId);
        }

        meetingSession.audioVideo.bindVideoElement(
          tileState.tileId,
          slot.video
        );
        slot.video.id = `video-${tileState.boundAttendeeId}`;
      },
      videoTileWasRemoved: (tileId) => {
        mutateVideoSlotsRef(mapToUnassignedSlot(tileId));
        disableTile(tileId);
      },
    };

    meetingSession.audioVideo.addObserver(observer);
  }, [meetingSession]);

  return (
    <SectionBox
      aria-label="Streaming videos"
      display="flex"
      justifyContent="center"
    >
      <Box>
        <PeerBox title="Local user" enabled>
          <Video
            ref={localVideoRef}
            className="streaming-video streaming-video-local"
          />
        </PeerBox>
        {videoSlotsRef.current.map((slot, index) => (
          <PeerBox
            key={index}
            title={`Remote user #${index}`}
            enabled={isEnabledTile(slot.tileId)}
          >
            <Video
              ref={(video) => (slot.video = video)}
              className="streaming-video streaming-video-remote"
            />
          </PeerBox>
        ))}
      </Box>
    </SectionBox>
  );
}