import { BannerDirection } from '../models/banner-direction';

export interface BannerAnimationContext {
  speed: number;
  gap: number;
  direction: BannerDirection;
  loop: number;
}
