import { Box, Button, MenuItem, Select, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { getLocalMeeting } from '../api/meetingApi';
import { USER } from '../Consts';
import { SectionBox } from '../ui-components';

export default function Login({ onLogin }) {
  const [selected, setSelected] = useState('');
  const [attendees, setAttendees] = useState([]);

  useEffect(() => {
    getExistingMeeting()
  }, [])

  const getExistingMeeting = async () => {
    try {
      const localMeeting = await getLocalMeeting();
      if (localMeeting && localMeeting.Attendees && localMeeting.Attendees.length) {
        const noHost = USER.filter(x => x.id !== 'tamhuynh1');
        setAttendees(noHost)
      }
    } catch (error) {
      const host = USER.filter(x => x.id === 'tamhuynh1');
      setAttendees(host)
    }
  }

  const handleChange = (event) => {
    setSelected(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const found = USER.find(x => x.id === selected)
    const loginFormData = {
      username: found.email,
      password: found.rsa
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
            return <MenuItem key={ind} value={att.id}>{att.email}</MenuItem>
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