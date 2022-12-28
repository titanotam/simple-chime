import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Button, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export default function AttendeesTable({ attendees, onRemove }) {

  if (!attendees.length) {
    return null
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 200 }} aria-label="simple table">
        {/* <TableHead>
          <TableRow>
            <TableCell><Typography fontWeight={'bold'}>Username</Typography></TableCell>
            <TableCell width={50}><Typography fontWeight={'bold'}>Remove</Typography></TableCell>
          </TableRow>
        </TableHead> */}
        <TableBody>
          {attendees.map((attendee, idx) => (
            <TableRow
              key={idx}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell>{attendee}</TableCell>
              <TableCell width={40}>
                <Button size="small" color="error" type="button" onClick={() => onRemove(attendee)}>
                  <DeleteIcon fontSize='small' />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}