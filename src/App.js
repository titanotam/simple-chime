import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import { Box, Button, Container, MenuItem, Select, TextField, Typography } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  ConsoleLogger, DefaultActiveSpeakerPolicy, DefaultDeviceController,
  DefaultMeetingSession,
  LogLevel,
  MeetingSessionConfiguration
} from "amazon-chime-sdk-js";
import { useEffect, useRef, useState } from "react";
import { login } from './api/authApi';
import { createMeeting, getLocalMeeting, saveLocalMeeting } from './api/meetingApi';
import {
  InvisibleAudio, PeerBox,
  SectionBox,
  Video
} from "./ui-components";

export default function App() {
  const [user, setUser] = useState(null);
  const [joining, setJoining] = useState("");
  const [hadFinishedApplication, setFinishedApplication] = useState(false);
  const [meetingSession, setMeetingSession] = useState(null);
  const [hasStartedMediaInputs, setStartedMediaInputs] = useState(false);

  const handleLogin = ({ username, password }) => {
    login(username, password)
      .then((it) => {
        it.username = username;
        localStorage.setItem('credentials', JSON.stringify(it));
        setUser(it)
      })
      .catch(() => setUser(null));
  };

  const handleJoin = (joiningFormData) => {
    setJoining(joiningFormData.room);
    createMeetingSession(joiningFormData, user)
      .then((it) => setMeetingSession(it))
      .catch(() => setJoining(""));
  };

  useEffect(() => {
    if (!meetingSession) {
      return;
    }

    const setupInput = async ({ audioId, videoId } = {}) => {
      if (!audioId || !videoId) {
        throw new Error("No video nor audio input detected.");
      }

      if (audioId) {
        const audioInputDevices =
          await meetingSession.audioVideo.listAudioInputDevices();

        if (audioInputDevices.length) {
          await meetingSession.audioVideo.startAudioInput(audioId);
        }
      }

      if (videoId) {
        const videoInputDevices =
          await meetingSession.audioVideo.listVideoInputDevices();

        if (videoInputDevices.length) {
          const defaultVideoId = videoInputDevices[0].deviceId;
          await meetingSession.audioVideo.startVideoInput(
            videoId === "default" ? defaultVideoId : videoId
          );
          setStartedMediaInputs(true);
        }
      }
    };

    setupInput({ audioId: "default", videoId: "default" }).then(() => {
      const observer = {
        audioInputMuteStateChanged: (device, muted) => {
          console.warn(
            "Device",
            device,
            muted ? "is muted in hardware" : "is not muted"
          );
        },
      };

      meetingSession.audioVideo.addDeviceChangeObserver(observer);

      meetingSession.audioVideo.start();

      const activeSpeakerCallback = (attendeeIds) => {
        if (!attendeeIds || !attendeeIds.length) {
          return;
        }

        const mostActiveAttendeeId = attendeeIds[0];
        const mostActiveAttendeeElement = document.getElementById(
          `video-${mostActiveAttendeeId}`
        );
        copyStreamToPinnedVideo(mostActiveAttendeeElement);
      };

      meetingSession.audioVideo.subscribeToActiveSpeakerDetector(
        new DefaultActiveSpeakerPolicy(),
        activeSpeakerCallback
      );
    });
  }, [meetingSession]);

  const isInSession = !!(meetingSession && hasStartedMediaInputs);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box width="100vw" height="100vh" overflow="hidden">
        <Box component="main" display="flex" flexDirection="column">
          {!hadFinishedApplication && !isInSession && !joining && !user && (
            <Container maxWidth="xs">
              <Login onLogin={handleLogin} />
            </Container>
          )}
          {!hadFinishedApplication && !isInSession && !joining && user && (
            <Container maxWidth="xs">
              <JoiningMeeting onJoin={handleJoin} />
            </Container>
          )}
          {!hadFinishedApplication && !isInSession && joining && user && (
            <Container maxWidth="xs">
              <SectionBox heading="Joining...">
                Attempting to join <code>{joining}</code> meeting.
              </SectionBox>
            </Container>
          )}
          {hadFinishedApplication && (
            <Container maxWidth="xs">
              <SectionBox heading="Bye, bye!">
                You can close this window now or...{" "}
                <Button variant="text" onClick={() => window.location.reload()}>
                  start another meeting
                </Button>
              </SectionBox>
            </Container>
          )}
          {!hadFinishedApplication && isInSession && (
            <>
              <StreamingVideosSection meetingSession={meetingSession} />
              <AudioOutput meetingSession={meetingSession} />
              <PinnedVideoSection />
              <Controls
                meetingSession={meetingSession}
                room={joining}
                onLeave={() => setFinishedApplication(true)}
              />
            </>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const logger = new ConsoleLogger("Logger", LogLevel.INFO);
const deviceController = new DefaultDeviceController(logger);

async function createMeetingSession(joiningFormData, user) {
  let meetingInfo;
  if (!joiningFormData.localMeeting) {
    meetingInfo = await createMeeting(user.username, joiningFormData.room);
    await saveLocalMeeting(meetingInfo);
  } else {
    meetingInfo = joiningFormData.localMeeting;
  }

  const configuration = new MeetingSessionConfiguration(
    meetingInfo.Meeting,
    meetingInfo.Attendees.find(x => x.ExternalUserId === user.username)
  );

  const meetingSession = new DefaultMeetingSession(
    configuration,
    logger,
    deviceController
  );

  return meetingSession;
}

function Login({ onLogin }) {
  const USER = {
    tamhuynh1: process.env.REACT_APP_RSA_1,
    tamhuynh2: process.env.REACT_APP_RSA_2,
    tamhuynh3: process.env.REACT_APP_RSA_3,
  };

  const [selected, setSelected] = useState('');
  const [attendees, setAttendees] = useState([]);

  useEffect(() => {
    getExistingMeeting()
  }, [])

  const getExistingMeeting = async () => {
    try {
      const localMeeting = await getLocalMeeting();
      if (localMeeting && localMeeting.Attendees && localMeeting.Attendees.length) {
        const found = localMeeting.Attendees.find(x => x.ExternalUserId === 'tamhuynh1@flodev.net')
        if (found) {
          setAttendees([
            {
              id: 'tamhuynh2',
              name: 'tamhuynh2@flodev.net'
            },
            {
              id: 'tamhuynh3',
              name: 'tamhuynh3@flodev.net'
            }
          ])
        }
      }
    } catch (error) {
      setAttendees([
        {
          id: 'tamhuynh1',
          name: 'tamhuynh1@flodev.net'
        }
      ])
    }
  }

  const handleChange = (event) => {
    setSelected(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const loginFormData = {
      username: selected + '@flodev.net',
      password: USER[selected]
    };
    onLogin(loginFormData);
  };

  return (
    <SectionBox>
      <Typography component="h1" variant="h4" marginTop="10px" textAlign={'center'}>
        Login
      </Typography>
      <Box component="form" onSubmit={handleSubmit} marginTop="10px">
        <Select
          labelId="username-select-label"
          id="username-select"
          value={selected}
          label="Username"
          onChange={handleChange}
          fullWidth
          required
        >
          {attendees.map((att, ind) => {
            return <MenuItem key={ind} value={att.id}>{att.name}</MenuItem>
          })}
        </Select>
        <Box marginTop="20px">
          <Button type="submit" variant="contained" fullWidth>
            Login
          </Button>
        </Box>
      </Box>
    </SectionBox>
  );
}

function JoiningMeeting({ onJoin }) {
  const [localMeeting, setLocalMeeting] = useState(null);

  useEffect(() => {
    getExistingMeeting()
  }, [])

  const getExistingMeeting = async () => {
    try {
      const meeting = await getLocalMeeting();
      setLocalMeeting(meeting)
    } catch (error) {
      setLocalMeeting(null)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    const joiningFormData = {
      room: localMeeting ? localMeeting.Meeting.ExternalMeetingId : event.target.room.value,
      localMeeting
    };
    onJoin(joiningFormData);
  };

  return (
    <SectionBox>
      <Typography component="h1" variant="h4" marginTop="10px" textAlign={'center'}>
        Start or join a conference
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        {!!localMeeting && <>
          <Typography component="p" variant="body1" marginTop="10px">
            Organizer: tamhuynh1@flodev.net
          </Typography>
          <Typography component="p" variant="body1" marginTop="10px">
            Room Name: {localMeeting.Meeting.ExternalMeetingId}
          </Typography>
        </>
        }
        {!localMeeting && <TextField
          name="room"
          label="Conference room"
          placeholder="Enter any alphanumeric id..."
          maxLength="64"
          minLength="2"
          margin="normal"
          fullWidth
          required
        />
        }
        <Box marginTop="20px">
          <Button type="submit" variant="contained" fullWidth>
            Start call
          </Button>
        </Box>
      </Box>
    </SectionBox>
  );
}

function Controls({ meetingSession, room, onLeave }) {
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

function AudioOutput({ meetingSession }) {
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

function StreamingVideosSection({ meetingSession }) {
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

function PinnedVideoSection() {
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

function copyStreamToPinnedVideo(
  originatingVideoElement,
  pinnedVideoElement = document.getElementById("video-pinned")
) {
  if (!originatingVideoElement || !originatingVideoElement.srcObject) {
    console.error(
      "Invalid originating video element/stream",
      originatingVideoElement
    );
    return;
  }

  if (!pinnedVideoElement) {
    console.error("Invalid pinned video element", pinnedVideoElement);
    return;
  }

  if (pinnedVideoElement.srcObject === originatingVideoElement.srcObject) {
    return;
  }

  pinnedVideoElement.muted = true;
  pinnedVideoElement.volume = 0;
  pinnedVideoElement.setAttributeNode(document.createAttribute("autoplay"));
  pinnedVideoElement.setAttributeNode(document.createAttribute("playsinline"));
  pinnedVideoElement.srcObject = originatingVideoElement.srcObject;
}
