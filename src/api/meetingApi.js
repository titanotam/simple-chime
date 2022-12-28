import { USER } from '../Consts';
import axiosInstance from './apiUtil';

const endpoint = process.env.REACT_APP_API_URL + '/meetings';
const attendeeEndpoint = process.env.REACT_APP_API_URL + '/attendees';
const localApiEndpoint = process.env.REACT_APP_LOCAL_API_URL;

export function createMeeting(organizer, roomName) {
  return axiosInstance.post(endpoint, {
    data: {
      Organizer: organizer,
      //Attendees: USER.map(x => x.email),
      Attendees: [organizer],
      ExternalMeetingId: roomName,
    },
  });
}

export function removeMeeting(meetingId) {
  return axiosInstance.delete(endpoint + `/${meetingId}`, {
    data: {
      MeetingId: meetingId
    }
  });
}

export function addAttendees(meetingId, attendees) {
  return axiosInstance.post(attendeeEndpoint, {
    data: {
      MeetingId: meetingId,
      Attendees: attendees
    },
  });
}

export function removeAttendee(meetingId, attendeeId) {
  return axiosInstance.delete(`${endpoint}/${meetingId}/attendees/${attendeeId}`);
}

export function getAttendee(meetingId, attendeeId) {
  return axiosInstance.get(`${endpoint}/${meetingId}/attendees/${attendeeId}`);
}

export function getLocalMeeting() {
  return axiosInstance.get(`${localApiEndpoint}/meeting`);
}

export function saveLocalMeeting(data) {
  return axiosInstance.post(`${localApiEndpoint}/meeting`, data);
}

export function deleteLocalMeeting() {
  return axiosInstance.delete(`${localApiEndpoint}/meeting`);
}