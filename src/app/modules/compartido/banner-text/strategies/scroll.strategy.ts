import { BannerAnimationContext } from "../interfaces/banner-animation-context";
import { BannerAnimationResult } from "../interfaces/banner-animation-result";
import { BannerState } from "../interfaces/banner-state";
import { BaseBannerStrategy } from "./base-banner-strategy";


export class ScrollStrategy
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

      if (
        state.position <=
        -state.trackWidth - context.gap
      ) {

        state.position =
          state.containerWidth + context.gap;

        return this.completeLoop(
          state,
          context
        );

      }

    } else {

      if (
        state.position >=
        state.containerWidth + context.gap
      ) {

        state.position =
          -state.trackWidth - context.gap;

        return this.completeLoop(
          state,
          context
        );

      }

    }

    return this.result();

  }

}
