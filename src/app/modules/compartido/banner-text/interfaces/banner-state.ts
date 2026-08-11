export class BannerState {
  containerWidth = 0;
  trackWidth = 0;
  position = 0;
  direction: 1 | -1 = -1;
  loops = 0;
  running = false;
  paused = false;
  animationId: number | null = null;
  lastTimestamp = 0;
  reducedMotion = false;
}
