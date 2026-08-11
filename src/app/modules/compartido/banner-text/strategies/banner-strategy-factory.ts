import { BannerAnimationStrategy } from "../interfaces/banner-animation-strategy";
import { BannerBehavior } from "../models/banner-behavior";
import { AlternateStrategy } from "./alternate.strategy";
import { ScrollStrategy } from "./scroll.strategy";
import { SlideStrategy } from "./slide.strategy";

export class BannerStrategyFactory {
  private readonly scrollStrategy = new ScrollStrategy();
  private readonly slideStrategy = new SlideStrategy();
  private readonly alternateStrategy = new AlternateStrategy();

  create(
    behavior: BannerBehavior
  ): BannerAnimationStrategy {

    switch (behavior) {
      case 'slide':
        return this.slideStrategy;
      case 'alternate':
        return this.alternateStrategy;
      case 'scroll':
      default:
        return this.scrollStrategy;
    }

  }

}
