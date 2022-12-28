import { Box, Button, MenuItem, Select, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { getLocalMeeting } from '../api/meetingApi';
import { SectionBox } from '../ui-components';

export default function Login({ onLogin }) {
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