export function copyStreamToPinnedVideo(
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