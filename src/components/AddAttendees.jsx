import { Box, Button, MenuItem, Select, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { getLocalMeeting } from '../api/meetingApi';
import { USER } from '../Consts';
import { SectionBox } from '../ui-components';

export default function AddAttendees({ onAdd }) {
  const [selected, setSelected] = useState('');
  const [attendees, setAttendees] = useState([]);
  const [localMeeting, setLocalMeeting] = useState(null);

  useEffect(() => {
    getExistingMeeting();
    buildAttendees()
  }, [])

  const getExistingMeeting = async () => {
    try {
      const meeting = await getLocalMeeting();
      setLocalMeeting(meeting)
    } catch (error) {
      setLocalMeeting(null)
    }
  }

  const buildAttendees = () => {
    const noHost = USER.filter(x => x.id !== 'tamhuynh1');
    setAttendees(noHost)
  }

  const handleChange = (event) => {
    setSelected(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const found = USER.find(x => x.id === selected)
    const formData = {
      attendee: found.email,
      localMeeting
    };
    onAdd(formData);
  };

  return (
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
          Add
        </Button>
      </Box>
    </Box>
  );
}