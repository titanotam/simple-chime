import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import { Button, Typography } from '@mui/material';
import { SectionBox } from '../ui-components';

export default function Controls({ meetingSession, room, onLeave }) {
  const muteAudio = () => meetingSession.audioVideo.realtimeMuteLocalAudio();

  const unmuteAudio = () =>
    meetingSession.audioVideo.realtimeUnmuteLocalAudio();

  const muteVideo = () => meetingSession.audioVideo.stopVideoInput();

  const unmuteVideo = async () => {
    console.error("Not implemented yet!");
  };

  const stopCall = async () => {
    meetingSession.audioVideo.stop();
    onLeave();
  };

  return (
    <SectionBox
      aria-label="Room controls"
      position="absolute"
      bottom="0"
      width="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bgcolor="secondary.contrastText"
    >
      <Typography component="strong" variant="body1">
        (Room {room})
      </Typography>
      <Button type="button" onClick={muteAudio}>
        <MicOffIcon title="Mute audio" aria-label="Mute audio" />
      </Button>
      <Button type="button" onClick={unmuteAudio}>
        <MicIcon title="Mute audio" aria-label="Unmute audio" />
      </Button>
      <Button type="button" onClick={muteVideo}>
        <VideocamOffIcon title="Mute audio" aria-label="Mute audio" />
      </Button>
      <Button type="button" onClick={unmuteVideo}>
        <VideocamIcon title="Mute audio" aria-label="Unmute video" />
      </Button>
      <Button type="button" color="error" onClick={stopCall}>
        <Typography component="strong">End</Typography>
      </Button>
    </SectionBox>
  );
}