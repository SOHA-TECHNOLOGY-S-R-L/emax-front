import {
  AfterViewInit,
  Component,
  ElementRef,
  Injector,
  HostListener,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  computed,
  effect,
  inject,
  input,
  output,
  contentChild,
  TemplateRef,
  signal
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';
import { BannerStrategyFactory } from './strategies/banner-strategy-factory';
import { BannerDirection } from './models/banner-direction';
import { BannerBehavior } from './models/banner-behavior';
import { BannerAnimationStrategy } from './interfaces/banner-animation-strategy';
import { BannerAnimationContext } from './interfaces/banner-animation-context';
import { BannerState } from './interfaces/banner-state';

@Component({
  selector: 'app-banner-text',
  standalone: true,
  templateUrl: './banner-text.component.html',
  styleUrls: ['./banner-text.component.css']
})
export class BannerTextComponent implements AfterViewInit, OnDestroy {
  // ==========================================================
  // Inputs
  // ==========================================================
  readonly text = input('');
  readonly speed = input(80);
  readonly gap = input(80);
  readonly direction = input<BannerDirection>('left');
  readonly behavior = input<BannerBehavior>('scroll');
  readonly loop = input(0);
  readonly autostart = input(true);
  readonly pauseOnHover = input(true);
  readonly messages = input<string[]>([]);
  // ==========================================================
  // Outputs
  // ==========================================================
  readonly started = output<void>();
  readonly paused = output<void>();
  readonly resumed = output<void>();
  readonly finished = output<void>();
  readonly bounce = output<void>();
  readonly loopCompleted = output<number>();

  @ViewChild('container', { static: true })
  protected container!: ElementRef<HTMLDivElement>;
  @ViewChild('track', { static: true })
  protected track!: ElementRef<HTMLDivElement>;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly injector = inject(Injector);
  protected readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly strategyFactory = new BannerStrategyFactory();
  private strategy!: BannerAnimationStrategy;
  private resizeObserver?: ResizeObserver;
  private readonly state = new BannerState();
  readonly running = computed(() => this.state.running);
  readonly pausedState = computed(() => this.state.paused);
  readonly completedLoops = computed(() => this.state.loops);

  protected readonly context =
    computed<BannerAnimationContext>(() => ({
      speed: this.speed(),
      gap: this.gap(),
      direction: this.direction(),
      loop: this.loop()
    }));

  readonly projectedContent = contentChild(TemplateRef);
  protected readonly hasProjectedContent =
    computed(() =>
      !!this.projectedContent()
    );

  private readonly currentMessageIndex = signal(0);

  readonly currentMessage = computed(() =>
    this.messages()[this.currentMessageIndex()] ?? ''
  );

  // ==========================================================
  // Visibility
  // ==========================================================

  private intersectionObserver?: IntersectionObserver;
  private pausedByVisibility = false;

  // ==========================================================
  // Accessibility
  // ==========================================================
  readonly ariaLabel = input<string>();
  readonly ariaLive = input<'off' | 'polite' | 'assertive'>('off');
  readonly role = input<'status' | 'region'>('status');
  readonly respectReducedMotion = input(true);
  reducedMotion = false;

  private readonly reducedMotionMediaQuery: MediaQueryList | null =
    this.isBrowser
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;

  private readonly onReducedMotionChanged =
    (event: MediaQueryListEvent) => {
      if (!this.respectReducedMotion()) {
        return;
      }

      if (event.matches) {
        this.showStaticBanner();
      } else {
        this.start();
      }
    };



  readonly debugState = computed(() => ({
    running: this.state.running,
    paused: this.state.paused,
    reducedMotion: this.state.reducedMotion,
    loops: this.state.loops,
    position: this.state.position,
    direction: this.state.direction
  }));

  constructor() { this.initializeEffects(); }

  private initializeEffects(): void {

    if (!this.isBrowser) {
      return;
    }

    effect(() => {
      this.context();
      queueMicrotask(() => {
        if (this.state.running) {
          this.restart();
        }
      });
    }, {
      injector: this.injector
    });

    effect(() => {
      const messages = this.messages();
      if (this.currentMessageIndex() >= messages.length) {
        this.currentMessageIndex.set(0);
        if (this.state.running) {
          queueMicrotask(() => this.restart());
        }
      }
    }, {
      injector: this.injector
    });
  }

  // ==========================================================
  // Layout
  // ==========================================================

  private measure(): boolean {

    const container =
      this.container.nativeElement;

    const track =
      this.track.nativeElement;

    this.state.containerWidth =
      container.clientWidth;

    this.state.trackWidth =
      track.scrollWidth;

    return (
      this.state.containerWidth > 0 &&
      this.state.trackWidth > 0
    );

  }

  private render(): void {
    this.track.nativeElement.style.transform =
      `translate3d(${this.state.position}px,0,0)`;
  }

  /**
   * Reinicia completamente la animación.
   */
  private resetAnimation(): void {

    this.state.loops = 0;

    this.strategy.reset(
      this.state,
      this.context()
    );
    this.render();

  }

  /**
   * Observa cambios de tamaño.
   */
  private observeResize(): void {

    this.resizeObserver =
      new ResizeObserver(() => {

        if (this.state.running) {

          this.restart();

        } else {

          this.measure();

          this.resetAnimation();

        }

      });

    this.resizeObserver.observe(
      this.container.nativeElement
    );

  }

  // ==========================================================
  // Animation
  // ==========================================================

  /**
   * Inicia la animación.
   */
  start(measure = true): void {

    if (!this.isBrowser) {
      return;
    }

    if (this.respectReducedMotion() && this.reducedMotionMediaQuery?.matches) {
      this.showStaticBanner();
      return;
    }

    if (this.state.running) {
      return;
    }

    if (measure && !this.measure()) {
      return;
    }

    this.resetAnimation();
    this.state.reducedMotion = false;
    this.state.running = true;
    this.state.paused = false;
    this.state.lastTimestamp = 0;

    this.started.emit();

    this.state.animationId = requestAnimationFrame(this.animate);
  }

  /**
   * Detiene la animación.
   */
  stop(): void {

    this.cancelAnimation();

    this.state.running = false;
    this.state.paused = false;
    this.state.loops = 0;
    this.state.lastTimestamp = 0;

    this.pausedByVisibility = false;

  }

  /**
   * Pausa la animación.
   */
  pause(): void {

    if (
      !this.state.running ||
      this.state.paused
    ) {
      return;
    }

    this.state.paused = true;

    this.paused.emit();

  }

  /**
   * Reanuda la animación.
   */
  resume(): void {

    if (
      !this.state.running ||
      !this.state.paused
    ) {
      return;
    }

    this.state.paused = false;

    this.state.lastTimestamp = 0;

    this.resumed.emit();

  }

  /**
   * Reinicia completamente la animación.
   */
  restart(): void {

    this.stop();

    if (!this.measure()) {
      return;
    }

    this.start(false);

  }

  /**
   * Motor principal.
   */
  private readonly animate = (timestamp: number): void => {

    if (!this.state.running) {
      return;
    }

    if (this.state.paused) {
      this.state.animationId =
        requestAnimationFrame(
          this.animate
        );

      return;
    }

    if (this.state.lastTimestamp === 0) {
      this.state.lastTimestamp =
        timestamp;
    }

    const delta = (timestamp - this.state.lastTimestamp) / 1000;

    this.state.lastTimestamp =
      timestamp;

    const result =
      this.strategy.update(
        this.state,
        this.context(),
        delta
      );

    this.render();

    if (result.bounced) {
      this.bounce.emit();
    }


    if (result.loopCompleted) {
      this.loopCompleted.emit(
        this.state.loops
      );
      if (this.restartWithNextMessage()) {
        return;
      }
    }

//    console.log('completed =', result.completed);
    if (result.completed) {
      this.finished.emit();
      this.stop();
      return;
    }

    this.state.animationId = requestAnimationFrame(this.animate);

  };

  // ==========================================================
  // Mouse
  // ==========================================================

  @HostListener('mouseenter')
  protected onMouseEnter(): void {
    if (this.pauseOnHover()) {
      this.pause();
    }

  }

  @HostListener('mouseleave')
  protected onMouseLeave(): void {

    if (this.pauseOnHover()) {

      this.resume();

    }

  }

  // ==========================================================
  // Lifecycle
  // ==========================================================

  ngAfterViewInit(): void {

    if (!this.isBrowser) {
      return;
    }

    if (!this.measure()) {
      return;
    }

    this.strategy = this.strategyFactory.create(
      this.behavior()
    );

    this.observeResize();
    this.observeVisibility();
    this.initializeReducedMotion();

    if (this.autostart()) {
      this.start(false);
    }

  }

  /**
 * Muestra el banner sin animación respetando
 * la preferencia de reducir movimiento.
 */
  private showStaticBanner(): void {

    if (!this.measure()) {
      return;
    }

    this.cancelAnimation();

    this.state.running = false;
    this.state.paused = false;
    this.state.lastTimestamp = 0;
    this.state.reducedMotion = true;

    this.pausedByVisibility = false;

    this.state.position = 0;

    this.render();

  }

  /**
 * Cancela el requestAnimationFrame activo.
 */
  private cancelAnimation(): void {

    const id = this.state.animationId;
    if (id === null) {
      return;
    }
    cancelAnimationFrame(id);
    this.state.animationId = null;
  }

  private observeVisibility(): void {

    if (!this.isBrowser) {
      return;
    }

    this.intersectionObserver =
      new IntersectionObserver(

        entries => {
          const entry = entries[0];
          if (!entry) {
            return;
          }

          if (entry.isIntersecting) {
            if (this.pausedByVisibility) {
              this.pausedByVisibility = false;
              this.resume();
            }
          } else {
            if (
              this.state.running &&
              !this.state.paused
            ) {
              this.pausedByVisibility = true;
              this.pause();
            }
          }

        },
        {
          threshold: 0.01
        }
      );

    this.intersectionObserver.observe(
      this.container.nativeElement
    );

  }

  private initializeReducedMotion(): void {

    if (!this.reducedMotionMediaQuery) {
      return;
    }

    this.reducedMotionMediaQuery.addEventListener(
      'change',
      this.onReducedMotionChanged
    );

  }

  private restartWithNextMessage(): boolean {
    //console.log('restartWithNextMessage');

    const messages = this.messages();

    if (messages.length <= 1) {
      return false;
    }

    this.currentMessageIndex.update(index =>
      (index + 1) % messages.length
    );

    queueMicrotask(() => {
      this.restart();
    });

    return true;

  }

  ngOnDestroy(): void {
    this.stop();
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    this.reducedMotionMediaQuery?.removeEventListener(
      'change',
      this.onReducedMotionChanged
    );
  }



}
