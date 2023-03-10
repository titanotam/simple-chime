import { Box, Typography, Container as MuiContainer } from "@mui/material";
import { forwardRef } from "react";

export const MainHeader = () => (
  <Box
    component="header"
    textAlign="center"
    paddingTop="20px"
    paddingBottom="10px"
  >
    <Typography component="h1" variant="h4">
      Simple Amazon Chime SDK App
    </Typography>
    <Typography variant="caption">By WebRTC.Ventures</Typography>
  </Box>
);

export const PeerBox = ({ enabled, ...props }) => (
  <Box
    display={enabled ? "inline-block" : "none"}
    width="50px"
    height="50px"
    backgroundColor="black"
    margin="10px"
    {...props}
  />
);

export const Video = forwardRef(({ style = {}, ...props }, ref) => (
  <video
    ref={ref}
    width="100%"
    height="100%"
    style={{ objectFit: "cover", ...style }}
    {...props}
  />
));

export const InvisibleAudio = forwardRef((props, ref) => (
  <audio ref={ref} style={{ display: "hidden" }} {...props} />
));

export const SectionBox = ({ heading, children, ...props }) => (
  <Box component="section" paddingTop="10px" paddingBottom="10px" width={'100%'} {...props}>
    <Typography component="h2" variant="h5" textAlign={'center'}>
      {heading}
    </Typography>
    {children}
  </Box>
);

export const Container = ({ children, ...props }) => (
  <MuiContainer maxWidth="xs" style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }} {...props}>
    {children}
  </MuiContainer>
)