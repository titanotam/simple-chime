
import { Box, Button, Typography } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  ConsoleLogger, DefaultActiveSpeakerPolicy, DefaultDeviceController,
  DefaultMeetingSession,
  LogLevel,
  MeetingSessionConfiguration
} from "amazon-chime-sdk-js";
import { useEffect, useState } from "react";
import { login } from './api/authApi';
import { createMeeting, saveLocalMeeting } from './api/meetingApi';
import AudioOutput from './components/AudioOutput';
import Controls from './components/Controls';
import JoiningMeeting from './components/JoiningMeeting';
import Login from './components/Login';
import PinnedVideoSection from './components/PinnedVideoSection';
import StreamingVideosSection from './components/StreamingVideosSection';
import {
  SectionBox,
  Container
} from "./ui-components";
import { copyStreamToPinnedVideo } from './Util';

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
            <Container>
              <Login onLogin={handleLogin} />
            </Container>
          )}
          {!hadFinishedApplication && !isInSession && !joining && user && (
            <Container>
              <JoiningMeeting onJoin={handleJoin} />
            </Container>
          )}
          {!hadFinishedApplication && !isInSession && joining && user && (
            <Container>
              <SectionBox heading="Joining...">
                <Typography component='p' variant='body1' textAlign={'center'} marginTop='20px'>Attempting to join <code>{joining}</code> meeting.</Typography>
              </SectionBox>
            </Container>
          )}
          {hadFinishedApplication && (
            <Container>
              <SectionBox heading="Bye, bye!">
                <Typography component='p' variant='body1' textAlign={'center'} marginTop='20px'>You can close this window now or...{" "}
                  <Button variant="text" onClick={() => window.location.reload()}>
                    start another meeting
                  </Button>
                </Typography>
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
