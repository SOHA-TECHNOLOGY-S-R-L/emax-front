
export interface BannerAnimationResult {
  /** La animación terminó. */
  completed: boolean;

  /** Se produjo un rebote. */
  bounced: boolean;

  /** Se completó un ciclo.*/
  loopCompleted: boolean;
}
