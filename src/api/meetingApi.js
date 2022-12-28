import axiosInstance from './apiUtil';

const endpoint = process.env.REACT_APP_API_URL + '/meetings';
const localApiEndpoint = process.env.REACT_APP_LOCAL_API_URL;

export function createMeeting(organizer, roomName) {
  return axiosInstance.post(endpoint, {
    data: {
      Organizer: organizer,
      Attendees: [
        "tamhuynh1@flodev.net",
        "tamhuynh2@flodev.net",
        "tamhuynh3@flodev.net",
      ],
      ExternalMeetingId: roomName,
    },
  });
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