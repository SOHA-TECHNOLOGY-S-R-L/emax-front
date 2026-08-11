import { BannerAnimationContext } from "../interfaces/banner-animation-context";
import { BannerAnimationResult } from "../interfaces/banner-animation-result";
import { BannerState } from "../interfaces/banner-state";
import { BaseBannerStrategy } from "./base-banner-strategy";


export class SlideStrategy
  extends BaseBannerStrategy {

  override reset(
    state: BannerState,
    context: BannerAnimationContext
  ): void {

    if (context.direction === 'left') {

      this.startOutsideRight(
        state,
        context
      );

    } else {

      this.startOutsideLeft(
        state,
        context
      );

    }

  }

  override update(
    state: BannerState,
    context: BannerAnimationContext,
    delta: number
  ): BannerAnimationResult {

    this.move(
      state,
      context,
      delta
    );

    if (this.isMovingLeft(state)) {

      if (this.hasReachedLeftLimit(state)) {

        state.position = 0;

        return this.result(
          true
        );

      }

    } else {

      if (this.hasReachedRightLimit(state)) {

        state.position =
          this.maxPosition(state);

        return this.result(
          true
        );

      }

    }

    return this.result();

  }

}
