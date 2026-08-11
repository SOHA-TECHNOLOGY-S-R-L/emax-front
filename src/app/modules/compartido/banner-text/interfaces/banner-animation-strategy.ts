import { BannerAnimationContext } from './banner-animation-context';
import { BannerAnimationResult } from './banner-animation-result';
import { BannerState } from './banner-state';

export interface BannerAnimationStrategy {

  reset(
    state: BannerState,
    context: BannerAnimationContext
  ): void;

  update(
    state: BannerState,
    context: BannerAnimationContext,
    delta: number
  ): BannerAnimationResult;

}
