import { BannerAnimationContext } from "../interfaces/banner-animation-context";
import { BannerAnimationResult } from "../interfaces/banner-animation-result";
import { BannerState } from "../interfaces/banner-state";
import { BaseBannerStrategy } from "./base-banner-strategy";


export class AlternateStrategy
  extends BaseBannerStrategy {

  override reset(
    state: BannerState,
    context: BannerAnimationContext
  ): void {

    if (context.direction === 'left') {

      this.startInsideRight(
        state
      );

    } else {

      this.startInsideLeft(
        state
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

        state.direction = 1;

        return this.completeLoop(
          state,
          context,
          true
        );

      }

    } else {

      if (this.hasReachedRightLimit(state)) {

        state.position =
          this.maxPosition(state);

        state.direction = -1;

        return this.completeLoop(
          state,
          context,
          true
        );

      }

    }

    return this.result();

  }

}
