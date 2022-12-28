import { Button, TextField, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useEffect, useState } from 'react';
import { getLocalMeeting } from '../api/meetingApi';
import { SectionBox } from '../ui-components';

export default function JoiningMeeting({ onJoin }) {
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
      <Box component="form" onSubmit={handleSubmit} marginTop="20px">
        {!!localMeeting && <>
          <Typography component="p" variant="body1">
            Organizer: tamhuynh1@flodev.net
          </Typography>
          <Typography component="p" variant="body1" marginTop="20px">
            Room Name: {localMeeting.Meeting.ExternalMeetingId}
          </Typography>
        </>
        }
        {!localMeeting && <TextField
          name="room"
          label="Room name"
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