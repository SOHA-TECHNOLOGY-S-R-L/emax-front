import { BannerAnimationContext } from "../interfaces/banner-animation-context";
import { BannerAnimationResult } from "../interfaces/banner-animation-result";
import { BannerAnimationStrategy } from "../interfaces/banner-animation-strategy";
import { BannerState } from "../interfaces/banner-state";



export abstract class BaseBannerStrategy
  implements BannerAnimationStrategy {

  abstract reset(
    state: BannerState,
    context: BannerAnimationContext
  ): void;

  /**
   * Desplaza el banner según la velocidad configurada.
   */
  protected move(
    state: BannerState,
    context: BannerAnimationContext,
    delta: number
  ): void {

    state.position +=
      context.speed *
      delta *
      state.direction;

  }

  /**
   * Indica si el movimiento actual es hacia la izquierda.
   */
  protected isMovingLeft(
    state: BannerState
  ): boolean {

    return state.direction < 0;

  }

  /**
   * Indica si el movimiento actual es hacia la derecha.
   */
  protected isMovingRight(
    state: BannerState
  ): boolean {

    return state.direction > 0;

  }

  /**
   * Posición máxima permitida para el texto.
   */
  protected maxPosition(
    state: BannerState
  ): number {

    return state.containerWidth - state.trackWidth;

  }

  /**
   * El texto llegó al borde izquierdo.
   */
  protected hasReachedLeftLimit(
    state: BannerState
  ): boolean {

    return state.position <= 0;

  }

  /**
   * El texto llegó al borde derecho.
   */
  protected hasReachedRightLimit(
    state: BannerState
  ): boolean {

    return state.position >= this.maxPosition(state);

  }

  /**
   * ¿Se alcanzó el número máximo de ciclos?
   */
  protected hasCompletedLoops(
    state: BannerState,
    context: BannerAnimationContext
  ): boolean {

    return (
      context.loop > 0 &&
      state.loops >= context.loop
    );

  }

  /**
   * Construye un resultado.
   */
  protected result(
    completed = false,
    bounced = false,
    loopCompleted = false
  ): BannerAnimationResult {

    return {
      completed,
      bounced,
      loopCompleted
    };

  }

  /**
   * Finaliza un ciclo.
   */
  protected completeLoop(
    state: BannerState,
    context: BannerAnimationContext,
    bounced = false
  ): BannerAnimationResult {

    state.loops++;

    return this.result(
      this.hasCompletedLoops(state, context),
      bounced,
      true
    );

  }

  abstract update(
    state: BannerState,
    context: BannerAnimationContext,
    delta: number
  ): BannerAnimationResult;

  protected startOutsideLeft(
    state: BannerState,
    context: BannerAnimationContext
  ): void {

    state.position =
      -state.trackWidth - context.gap;

    state.direction = 1;

  }

  protected startOutsideRight(
    state: BannerState,
    context: BannerAnimationContext
  ): void {

    state.position =
      state.containerWidth + context.gap;

    state.direction = -1;

  }

  protected startInsideLeft(
    state: BannerState
  ): void {

    state.position = 0;

    state.direction = 1;

  }

  protected startInsideRight(
    state: BannerState
  ): void {

    state.position =
      this.maxPosition(state);

    state.direction = -1;

  }

}
