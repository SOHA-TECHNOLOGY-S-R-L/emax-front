# App Banner Text

> Componente reutilizable de Angular para mostrar mensajes desplazables horizontalmente, inspirado en el antiguo elemento HTML `<marquee>`, pero diseñado con una arquitectura moderna basada en **Angular Signals**, **Strategy Pattern** y **requestAnimationFrame**.

---

## Descripción

A diferencia del antiguo elemento HTML `<marquee>`, este componente proporciona:

- Arquitectura desacoplada.
- Animaciones fluidas mediante `requestAnimationFrame`.
- Compatibilidad con Angular SSR.
- API moderna basada en Signals.
- Accesibilidad.
- Alto rendimiento.
- Contenido HTML completamente proyectable mediante `ng-content`.

El componente puede utilizarse para mostrar:

- Noticias.
- Promociones.
- Mensajes informativos.
- Alertas.
- Avisos de mantenimiento.
- Banners corporativos.
- Mensajes de bienvenida.
- Campañas publicitarias.

---

# Características

## ✔ Standalone Component


Compatible con Angular 17+ y especialmente optimizado para Angular 20/21.

---

## ✔ Arquitectura basada en Strategy Pattern

Cada comportamiento del banner se implementa mediante una estrategia independiente.

```
                BannerTextComponent
                        │
                        ▼
             BannerStrategyFactory
                        │
        ┌───────────────┼────────────────┐
        ▼               ▼                ▼
 ScrollStrategy   SlideStrategy   AlternateStrategy
```

Esto permite añadir nuevos comportamientos sin modificar el componente principal.

---

## ✔ Animación mediante requestAnimationFrame

Las animaciones no utilizan CSS `@keyframes`.

En su lugar se utiliza:

- requestAnimationFrame
- Delta Time
- Velocidad en píxeles por segundo

Esto ofrece:

- Movimiento completamente fluido.
- Control de pausa y reanudación.
- Independencia de la frecuencia del monitor.
- Mayor precisión.
- Mejor integración con Angular.

---

## ✔ Compatible con SSR

El componente detecta automáticamente si la aplicación se está ejecutando en el navegador.

Las operaciones relacionadas con el DOM únicamente se ejecutan cuando existe un entorno Browser.

---

## ✔ ResizeObserver

El componente detecta automáticamente cambios de tamaño del contenedor.

No es necesario reiniciar manualmente la animación cuando cambia el ancho de la ventana.

---

## ✔ IntersectionObserver

Cuando el banner deja de ser visible:

- la animación se pausa automáticamente.

Cuando vuelve a ser visible:

- la animación continúa exactamente desde el mismo punto.

Esto reduce considerablemente el uso de CPU.

---

## ✔ Accesibilidad

Incluye soporte para:

- role
- aria-label
- aria-live
- prefers-reduced-motion

---

## ✔ Contenido completamente personalizable

El componente no impone ningún estilo visual.

Todo el contenido se proyecta mediante:

```html
<ng-content></ng-content>
```

Por ello puede contener:

- texto
- iconos
- imágenes
- botones
- badges
- componentes Angular Material
- componentes PrimeNG
- cualquier contenido HTML

---



# Vista general

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  📢  Promoción del día: 30% de descuento en productos seleccionados │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

El contenido puede desplazarse mediante tres comportamientos diferentes:

- Scroll
- Slide
- Alternate

y en cualquiera de las dos direcciones:

- Left
- Right

---

# Requisitos

- Angular 20 o superior
- TypeScript 5+
- Navegador con soporte para:

  - requestAnimationFrame
  - ResizeObserver
  - IntersectionObserver

---

# Próximos capítulos

En los siguientes apartados se describen:

1. Instalación
2. API completa
3. Ejemplos de uso
4. Eventos
5. Control desde el componente padre
6. Accesibilidad
7. Rendimiento
8. Buenas prácticas
9. Solución de problemas

# Capítulo 2 - Guía de Inicio Rápido

En este capítulo aprenderás a integrar **`app-banner-text`** en un componente Angular Standalone y crear tu primer banner en pocos minutos.

---

# Requisitos

Antes de utilizar el componente verifica que tu proyecto cumpla con los siguientes requisitos:

| Requisito | Versión |
|-----------|----------|
| Angular | 20 o superior |
| TypeScript | 5.x |
| Standalone Components | ✔ |
| Signals | ✔ |

---

# Importar el componente

Al tratarse de un **Standalone Component**, únicamente debes importarlo en el componente donde vayas a utilizarlo.

```typescript
import { BannerTextComponent } from
'../shared/components/banner-text/banner-text.component';

@Component({
    standalone: true,

    imports: [
        BannerTextComponent
    ]
})
export class HomeComponent {

}
```

No es necesario importar ningún módulo adicional.

---

# Primer Banner

El ejemplo más sencillo consiste en proyectar un texto.

```html
<app-banner-text>

    Bienvenido a nuestra tienda virtual.

</app-banner-text>
```

Resultado:

```
← Bienvenido a nuestra tienda virtual ←
```

Por defecto el componente utiliza:

- behavior = "scroll"
- direction = "left"

---

# Agregando estilos

El componente no aplica estilos al contenido.

Puedes utilizar cualquier clase CSS.

```html
<app-banner-text>

    <span class="text-primary fw-bold">

        Bienvenido a Grafiya

    </span>

</app-banner-text>
```

También puedes utilizar Bootstrap.

```html
<app-banner-text>

    <span class="badge bg-success">

        Nuevo Producto Disponible

    </span>

</app-banner-text>
```

---

# Contenido HTML

El componente utiliza **Content Projection** mediante:

```html
<ng-content></ng-content>
```

Esto significa que puedes colocar cualquier contenido HTML.

Por ejemplo:

```html
<app-banner-text>

    <i class="fa-solid fa-star text-warning"></i>

    <span class="mx-2">

        Oferta del día

    </span>

</app-banner-text>
```

Resultado:

```
⭐ Oferta del día
```

---

# Contenido complejo

También es posible combinar varios elementos.

```html
<app-banner-text>

    <span class="text-danger fw-bold">

        🔥 HOT SALE

    </span>

    <span class="mx-3">

        Hasta 50% de descuento

    </span>

    <button class="btn btn-sm btn-primary">

        Comprar

    </button>

</app-banner-text>
```

---

# Cambiar el comportamiento

El componente dispone de tres modos de animación.

## Scroll

```html
<app-banner-text
    behavior="scroll">

    Scroll continuo

</app-banner-text>
```

```
← ← ← ← ←
```

---

## Slide

```html
<app-banner-text
    behavior="slide">

    Slide

</app-banner-text>
```

```
────────────►
```

Cuando el texto desaparece vuelve a comenzar desde el inicio.

---

## Alternate

```html
<app-banner-text
    behavior="alternate">

    Alternate

</app-banner-text>
```

```
◄──────────►
```

El texto rebota continuamente entre ambos extremos.

---

# Cambiar la dirección

## Izquierda

```html
<app-banner-text
    direction="left">

    Movimiento hacia la izquierda

</app-banner-text>
```

---

## Derecha

```html
<app-banner-text
    direction="right">

    Movimiento hacia la derecha

</app-banner-text>
```

---

# Cambiar la velocidad

La velocidad se expresa en píxeles por segundo.

```html
<app-banner-text
    [speed]="60">

    Movimiento lento

</app-banner-text>
```

```html
<app-banner-text
    [speed]="120">

    Movimiento normal

</app-banner-text>
```

```html
<app-banner-text
    [speed]="220">

    Movimiento rápido

</app-banner-text>
```

---

# Repeticiones

Puedes indicar cuántas veces debe ejecutarse la animación.

```html
<app-banner-text
    [loop]="3">

    Solo tres recorridos

</app-banner-text>
```

Para repetir indefinidamente:

```html
<app-banner-text
    [loop]="0">

    Repetición infinita

</app-banner-text>
```

> **Nota:** Un valor de `0` indica que el banner nunca finalizará automáticamente.

---

# Pausar al pasar el mouse

```html
<app-banner-text
    [pauseOnHover]="true">

    Pase el mouse para pausar

</app-banner-text>
```

Cuando el cursor entra sobre el banner:

- la animación se pausa.

Cuando el cursor sale:

- la animación continúa.

---

# Inicio automático

El componente inicia automáticamente la animación.

```html
<app-banner-text
    [autostart]="true">

    Inicio automático

</app-banner-text>
```

También puedes iniciar manualmente.

```html
<app-banner-text
    [autostart]="false">

    Inicio manual

</app-banner-text>
```

---

# Combinando propiedades

```html
<app-banner-text

    behavior="alternate"

    direction="right"

    [speed]="180"

    [pauseOnHover]="true"

    [loop]="5">

    <span class="text-primary fw-bold">

        Promoción exclusiva

    </span>

</app-banner-text>
```

---

# Primer ejemplo completo

```html
<div class="bg-dark p-2">

    <app-banner-text

        behavior="scroll"

        direction="left"

        [speed]="120">

        <span class="text-warning fw-bold">

            🚚 Envío gratis en compras mayores a S/ 150

        </span>

    </app-banner-text>

</div>
```

Resultado esperado:

```
┌─────────────────────────────────────────────────────────────┐
│ 🚚 Envío gratis en compras mayores a S/ 150                 │
└─────────────────────────────────────────────────────────────┘
```

---

# ¿Qué sigue?

Ahora que ya puedes utilizar el componente, el siguiente capítulo describe toda la API pública con detalle.

En el **Capítulo 3 - API Completa** aprenderás:

- Todos los `@Input()`.
- Todos los `@Output()`.
- Métodos públicos.
- Estado interno expuesto.
- Valores por defecto.
- Restricciones de uso.
- Ejemplos para cada propiedad.

# Capítulo 3 - API Completa

Este capítulo describe toda la API pública del componente **`app-banner-text`**.

---

# Selector

```html
<app-banner-text></app-banner-text>
```

---

# Inputs

## behavior

Define el comportamiento de la animación.

### Tipo

```ts
'scroll' | 'slide' | 'alternate'
```

### Valor por defecto

```ts
'scroll'
```

### Ejemplo

```html
<app-banner-text
    behavior="scroll">

    Scroll continuo

</app-banner-text>
```

```html
<app-banner-text
    behavior="slide">

    Slide

</app-banner-text>
```

```html
<app-banner-text
    behavior="alternate">

    Alternate

</app-banner-text>
```

### Descripción

| Valor | Descripción |
|--------|-------------|
| scroll | El contenido se desplaza continuamente. |
| slide | El contenido atraviesa el contenedor y vuelve al inicio. |
| alternate | El contenido rebota entre ambos extremos. |

---

## direction

Define la dirección del movimiento.

### Tipo

```ts
'left' | 'right'
```

### Valor por defecto

```ts
'left'
```

### Ejemplo

```html
<app-banner-text
    direction="left">

    Movimiento hacia la izquierda

</app-banner-text>
```

```html
<app-banner-text
    direction="right">

    Movimiento hacia la derecha

</app-banner-text>
```

---

## speed

Velocidad de desplazamiento.

### Tipo

```ts
number
```

### Valor por defecto

```ts
80
```

### Unidad

Píxeles por segundo (px/s)

### Ejemplo

```html
<app-banner-text
    [speed]="40">

    Muy lento

</app-banner-text>
```

```html
<app-banner-text
    [speed]="120">

    Normal

</app-banner-text>
```

```html
<app-banner-text
    [speed]="250">

    Muy rápido

</app-banner-text>
```

### Recomendaciones

| Velocidad | Uso recomendado |
|------------|-----------------|
| 40-60 | Noticias largas |
| 80-120 | Uso general |
| 150-220 | Alertas |
| +250 | No recomendado |

---

## loop

Número de repeticiones.

### Tipo

```ts
number
```

### Valor por defecto

```ts
0
```

### Significado

| Valor | Resultado |
|--------|-----------|
| 0 | Repetición infinita |
| 1 | Una ejecución |
| 2 | Dos ejecuciones |
| n | n ejecuciones |

### Ejemplo

```html
<app-banner-text
    [loop]="3">

    Tres recorridos

</app-banner-text>
```

---

## autostart

Inicia automáticamente la animación.

### Tipo

```ts
boolean
```

### Valor por defecto

```ts
true
```

### Ejemplo

```html
<app-banner-text
    [autostart]="false">

    Inicio manual

</app-banner-text>
```

---

## pauseOnHover

Pausa la animación cuando el cursor se sitúa sobre el banner.

### Tipo

```ts
boolean
```

### Valor por defecto

```ts
true
```

### Ejemplo

```html
<app-banner-text
    [pauseOnHover]="true">

    Pase el mouse sobre este banner

</app-banner-text>
```

---

# Accesibilidad

## ariaLabel

Texto utilizado por lectores de pantalla.

### Tipo

```ts
string
```

### Valor por defecto

```ts
undefined
```

### Ejemplo

```html
<app-banner-text
    ariaLabel="Promociones del día">

    Oferta especial

</app-banner-text>
```

---

## ariaLive

Indica cómo anunciar cambios al lector de pantalla.

### Tipo

```ts
'off' | 'polite' | 'assertive'
```

### Valor por defecto

```ts
'off'
```

### Valores

| Valor | Descripción |
|--------|-------------|
| off | No anuncia cambios. |
| polite | Espera a terminar la locución actual. |
| assertive | Interrumpe para anunciar el cambio. |

---

## role

Rol ARIA del componente.

### Tipo

```ts
'status' | 'region'
```

### Valor por defecto

```ts
'status'
```

### Ejemplo

```html
<app-banner-text
    role="region">

    Noticias

</app-banner-text>
```

---

## respectReducedMotion

Respeta la preferencia del sistema operativo para reducir animaciones.

### Tipo

```ts
boolean
```

### Valor por defecto

```ts
true
```

Cuando el usuario activa **Reducir movimiento** en su sistema operativo:

- la animación se detiene.
- el contenido permanece visible.

---

# Outputs

## finished

Se dispara cuando termina la última repetición.

### Tipo

```ts
EventEmitter<void>
```

### Ejemplo

```html
<app-banner-text
    [loop]="1"
    (finished)="bannerFinalizado()">

    Banner

</app-banner-text>
```

---

## bounce

Se dispara cuando una estrategia **Alternate** cambia de dirección.

### Tipo

```ts
EventEmitter<void>
```

### Ejemplo

```html
<app-banner-text
    behavior="alternate"
    (bounce)="onBounce()">

    Alternate

</app-banner-text>
```

---

## loopCompleted

Se dispara al finalizar una repetición.

### Tipo

```ts
EventEmitter<number>
```

El parámetro recibido corresponde al número total de recorridos completados.

```ts
loopCompleted(loop: number)
```

### Ejemplo

```html
<app-banner-text
    (loopCompleted)="onLoop($event)">

    Banner

</app-banner-text>
```

```ts
onLoop(loop: number){

    console.log(loop);

}
```

---

# Métodos públicos

Estos métodos pueden invocarse mediante `ViewChild`.

---

## start()

Inicia la animación.

```ts
start(): void
```

### Ejemplo

```ts
this.banner.start();
```

---

## stop()

Detiene completamente la animación.

```ts
this.banner.stop();
```

---

## pause()

Pausa temporalmente.

```ts
this.banner.pause();
```

---

## resume()

Continúa una animación pausada.

```ts
this.banner.resume();
```

---

## restart()

Reinicia completamente la animación.

```ts
this.banner.restart();
```

---

# Estado público

El componente expone información útil mediante Signals.

---

## running()

Indica si el banner está ejecutándose.

```ts
banner.running()
```

Retorna:

```ts
boolean
```

---

## pausedState()

Indica si la animación está pausada.

```ts
banner.pausedState()
```

---

## completedLoops()

Cantidad de recorridos completados.

```ts
banner.completedLoops()
```

Retorna:

```ts
number
```

---

## debugState()

Devuelve el estado interno del componente.

```ts
banner.debugState()
```

Ejemplo:

```ts
{
    running: true,
    paused: false,
    reducedMotion: false,
    loops: 3,
    position: -125,
    direction: -1
}
```

---

# Valores por defecto

| Propiedad | Valor |
|------------|-------|
| behavior | scroll |
| direction | left |
| speed | 80 |
| loop | 0 |
| autostart | true |
| pauseOnHover | true |
| role | status |
| ariaLive | off |
| respectReducedMotion | true |

---

# Resumen de la API

| Categoría | Cantidad |
|------------|----------|
| Inputs | 9 |
| Outputs | 3 |
| Métodos públicos | 5 |
| Signals públicas | 4 |

---

# Próximo capítulo

En el siguiente capítulo se presentan más de veinte ejemplos prácticos que muestran cómo utilizar **`app-banner-text`** en aplicaciones reales, incluyendo Bootstrap 5, Angular Material, Font Awesome, imágenes, contenido dinámico y control mediante `ViewChild`.

# Capítulo 4 - Ejemplos para E-commerce

En este capítulo se presentan ejemplos prácticos de utilización de **`app-banner-text`** dentro de una tienda virtual.

Todos los ejemplos utilizan Bootstrap 5 y pueden adaptarse fácilmente a cualquier aplicación Angular.

---

# Promoción principal

Ideal para mostrar la promoción más importante de la tienda.

```html
<div class="bg-dark py-2">

    <app-banner-text
        behavior="scroll"
        direction="left"
        [speed]="100">

        <span class="text-warning fw-bold">

            🔥 Hasta 40% de descuento en productos seleccionados.

        </span>

    </app-banner-text>

</div>
```

---

# Envío gratis

Muy utilizado en tiendas virtuales.

```html
<div class="bg-success py-2">

    <app-banner-text>

        <span class="text-white">

            🚚 Envío GRATIS a todo el Perú por compras mayores a S/ 150.

        </span>

    </app-banner-text>

</div>
```

---

# Oferta Flash

```html
<app-banner-text
    behavior="alternate"
    [speed]="180">

    <span class="badge bg-danger fs-6">

        ⚡ OFERTA FLASH

    </span>

    <span class="ms-3 text-danger fw-bold">

        Solo por hoy.

    </span>

</app-banner-text>
```

---

# Nuevo Producto

```html
<app-banner-text
    behavior="slide">

    <span class="badge bg-primary">

        NUEVO

    </span>

    <span class="ms-2">

        Llegaron nuestras agendas corporativas 2027.

    </span>

</app-banner-text>
```

---

# Productos personalizados

```html
<app-banner-text>

    <i class="fa-solid fa-shirt text-primary"></i>

    <span class="mx-2">

        Personalizamos polos, tazas, tomatodos y mochilas.

    </span>

</app-banner-text>
```

---

# Descuento por categoría

```html
<app-banner-text
    [speed]="140">

    <span class="text-danger fw-bold">

        🎁 25% de descuento en artículos publicitarios.

    </span>

</app-banner-text>
```

---

# Horario de atención

```html
<app-banner-text>

    <i class="fa-regular fa-clock text-warning"></i>

    <span class="mx-2">

        Atención de lunes a sábado de 9:00 a.m. a 7:00 p.m.

    </span>

</app-banner-text>
```

---

# WhatsApp

```html
<app-banner-text
    direction="right">

    <i class="fab fa-whatsapp text-success"></i>

    <span class="mx-2">

        Escríbenos al +51 978 663 071.

    </span>

</app-banner-text>
```

---

# Múltiples beneficios

```html
<app-banner-text
    behavior="scroll"
    [speed]="130">

    <span class="badge bg-success">

        ENVÍO GRATIS

    </span>

    <span class="mx-4">

        ✓ Pago seguro

    </span>

    <span class="mx-4">

        ✓ Garantía

    </span>

    <span class="mx-4">

        ✓ Atención personalizada

    </span>

</app-banner-text>
```

---

# Cuenta regresiva de campaña

```html
<app-banner-text
    behavior="alternate">

    <span class="text-danger fw-bold">

        ⏳ Últimos días del Cyber Grafiya.

    </span>

</app-banner-text>
```

---

# Banner institucional

```html
<app-banner-text
    [speed]="90">

    <span class="text-primary fw-bold">

        Grafiya®

    </span>

    <span class="mx-2">

        Expertos en merchandising, branding y publicidad corporativa.

    </span>

</app-banner-text>
```

---

# Medios de pago

```html
<app-banner-text>

    <i class="fa-brands fa-cc-visa"></i>

    <i class="fa-brands fa-cc-mastercard mx-3"></i>

    <i class="fa-solid fa-building-columns"></i>

    <span class="mx-3">

        Aceptamos todas las tarjetas y transferencias bancarias.

    </span>

</app-banner-text>
```

---

# Campaña de temporada

```html
<app-banner-text
    behavior="scroll"
    [speed]="110">

    <span class="text-success fw-bold">

        🎄 Campaña Navideña 2026.

    </span>

    <span class="mx-2">

        Solicita tu cotización hoy mismo.

    </span>

</app-banner-text>
```

---

# Atención personalizada

```html
<app-banner-text>

    <i class="fa-solid fa-headset text-info"></i>

    <span class="mx-2">

        Un asesor responderá tus consultas en menos de 5 minutos.

    </span>

</app-banner-text>
```

---

# Banner con imagen

```html
<app-banner-text>

    <img
        src="logo.png"
        width="40"
        class="me-3">

    <span>

        Productos promocionales para empresas.

    </span>

</app-banner-text>
```

---

# Banner con botón

```html
<app-banner-text>

    <span>

        Descubre nuestra nueva colección.

    </span>

    <button
        class="btn btn-warning btn-sm ms-3">

        Ver catálogo

    </button>

</app-banner-text>
```

---

# Banner usando Signals

```typescript
mensaje = signal(
    'Bienvenido a Grafiya'
);
```

```html
<app-banner-text>

    <span class="text-primary">

        {{ mensaje() }}

    </span>

</app-banner-text>
```

Cuando el valor del Signal cambie, el banner actualizará automáticamente el contenido.

---

# Banner controlado mediante ViewChild

```typescript
@ViewChild(BannerTextComponent)
banner!: BannerTextComponent;

pausar(){

    this.banner.pause();

}

reanudar(){

    this.banner.resume();

}

reiniciar(){

    this.banner.restart();

}
```

---

# Banner para la cabecera de una tienda

```html
<div class="bg-dark">

    <app-banner-text
        behavior="scroll"
        [speed]="100"
        [pauseOnHover]="true">

        <span class="text-warning fw-bold">

            🚚 Envío GRATIS

        </span>

        <span class="mx-4">

            🔥 Hasta 40% de descuento

        </span>

        <span class="mx-4">

            📞 +51 978 663 071

        </span>

        <span class="mx-4">

            💳 Pago seguro

        </span>

    </app-banner-text>

</div>
```

Este ejemplo representa un caso real de uso para la cabecera de una tienda virtual, combinando promociones, información de contacto y beneficios en un único banner desplazable.

---

# Próximo capítulo

En el siguiente capítulo aprenderás a controlar completamente el componente mediante sus eventos (`finished`, `bounce` y `loopCompleted`) y a interactuar con él desde el componente padre utilizando `@ViewChild`.

# Capítulo 5 - Recetario de Diseños

Este capítulo contiene una colección de diseños reutilizables para **`app-banner-text`**.

Todos los ejemplos están pensados para Bootstrap 5 y Font Awesome.

---

# Barra corporativa Grafiya

Ideal para la cabecera del sitio web.

```
┌──────────────────────────────────────────────────────────────┐
│ 🚚 Envío Gratis | 📞 +51 978 663 071 | 💳 Pago Seguro         │
└──────────────────────────────────────────────────────────────┘
```

```html
<div class="bg-dark py-2">

    <app-banner-text
        behavior="scroll"
        [speed]="100">

        <span class="text-warning fw-bold">

            🚚 Envío GRATIS

        </span>

        <span class="mx-4 text-white">

            📞 +51 978 663 071

        </span>

        <span class="mx-4 text-success">

            💳 Pago Seguro

        </span>

    </app-banner-text>

</div>
```

---

# Barra de Envío Gratis

```
┌──────────────────────────────────────────────┐
│ 🚚 ENVÍO GRATIS EN TODO EL PERÚ              │
└──────────────────────────────────────────────┘
```

```html
<div class="bg-success py-2">

    <app-banner-text>

        <span class="text-white fw-bold">

            🚚 Envío GRATIS por compras mayores a S/150

        </span>

    </app-banner-text>

</div>
```

---

# Barra Cyber Days

```
┌──────────────────────────────────────────────┐
│ 🔥 CYBER DAYS | Hasta 50% de descuento       │
└──────────────────────────────────────────────┘
```

```html
<div class="bg-danger py-2">

    <app-banner-text
        behavior="alternate"
        [speed]="180">

        <span class="text-white fw-bold">

            🔥 CYBER DAYS

        </span>

        <span class="mx-4 text-warning">

            Hasta 50% de descuento

        </span>

    </app-banner-text>

</div>
```

---

# Barra Black Friday

```html
<div class="bg-black py-2">

    <app-banner-text>

        <span style="color:#FFD700;font-weight:bold;">

            🖤 BLACK FRIDAY

        </span>

        <span class="mx-3 text-light">

            Solo por 24 horas.

        </span>

    </app-banner-text>

</div>
```

---

# Barra Navidad

```html
<div class="bg-danger py-2">

    <app-banner-text>

        <span class="text-warning fw-bold">

            🎄 Navidad 2026

        </span>

        <span class="mx-3 text-white">

            Regalos corporativos personalizados.

        </span>

    </app-banner-text>

</div>
```

---

# Barra Año Nuevo

```html
<div class="bg-primary py-2">

    <app-banner-text>

        <span class="text-warning fw-bold">

            🎆 Feliz Año Nuevo 2027

        </span>

        <span class="mx-3 text-white">

            Gracias por confiar en Grafiya.

        </span>

    </app-banner-text>

</div>
```

---

# Barra WhatsApp

```
🟢 WhatsApp
```

```html
<div class="bg-success py-2">

    <app-banner-text
        direction="right">

        <i class="fab fa-whatsapp text-white"></i>

        <span class="mx-2 text-white">

            Escríbenos ahora mismo.

        </span>

    </app-banner-text>

</div>
```

---

# Barra Atención Personalizada

```html
<div class="bg-info py-2">

    <app-banner-text>

        <i class="fa-solid fa-headset"></i>

        <span class="mx-2 fw-bold">

            Un asesor responderá en menos de 5 minutos.

        </span>

    </app-banner-text>

</div>
```

---

# Barra Pago Seguro

```html
<div class="bg-light py-2 border-top border-bottom">

    <app-banner-text>

        <i class="fa-solid fa-shield-halved text-success"></i>

        <span class="mx-3">

            Compra 100% segura.

        </span>

        <i class="fa-brands fa-cc-visa ms-4"></i>

        <i class="fa-brands fa-cc-mastercard ms-2"></i>

    </app-banner-text>

</div>
```

---

# Barra Productos Nuevos

```html
<div class="bg-primary py-2">

    <app-banner-text
        behavior="slide">

        <span class="badge bg-warning text-dark">

            NUEVO

        </span>

        <span class="ms-3 text-white">

            Catálogo 2027 disponible.

        </span>

    </app-banner-text>

</div>
```

---

# Barra Marcas

```html
<div class="bg-white border-top border-bottom">

    <app-banner-text>

        <img src="nike.svg" height="30">

        <img src="adidas.svg"
             class="mx-5"
             height="30">

        <img src="puma.svg"
             height="30">

    </app-banner-text>

</div>
```

---

# Barra Redes Sociales

```html
<div class="bg-dark py-2">

    <app-banner-text>

        <i class="fab fa-facebook text-primary"></i>

        <i class="fab fa-instagram text-danger mx-4"></i>

        <i class="fab fa-tiktok text-white"></i>

        <span class="mx-4 text-warning">

            Síguenos en nuestras redes sociales.

        </span>

    </app-banner-text>

</div>
```

---

# Barra Testimonios

```html
<div class="bg-light py-2">

    <app-banner-text
        behavior="scroll"
        [speed]="70">

        ⭐⭐⭐⭐⭐

        <span class="mx-3">

            Más de 2,000 empresas confían en Grafiya.

        </span>

    </app-banner-text>

</div>
```

---

# Barra de Beneficios

```html
<div class="bg-secondary py-2">

    <app-banner-text>

        ✅ Atención personalizada

        <span class="mx-5">

            ✅ Entrega rápida

        </span>

        <span class="mx-5">

            ✅ Productos garantizados

        </span>

        <span class="mx-5">

            ✅ Diseños exclusivos

        </span>

    </app-banner-text>

</div>
```

---

# Barra Premium

```html
<div
    class="py-2"
    style="background:linear-gradient(90deg,#0f2027,#203a43,#2c5364);">

    <app-banner-text
        [speed]="90">

        <span class="text-warning fw-bold">

            ✨ Experiencia Premium

        </span>

        <span class="mx-3 text-white">

            Calidad, diseño y puntualidad.

        </span>

    </app-banner-text>

</div>
```

---

# Recomendaciones

## Fondos oscuros

Utilizar:

- text-warning
- text-info
- text-light

---

## Fondos claros

Utilizar:

- text-primary
- text-danger
- text-success

---

## Velocidades recomendadas

| Tipo | Speed |
|-------|------:|
| Corporativo | 80 |
| Noticias | 70 |
| Promociones | 100 |
| Flash Sale | 180 |
| Alternate | 150 |

---

# Próximo capítulo

En el siguiente capítulo aprenderás a controlar completamente el componente mediante:

- ViewChild
- Eventos
- API pública
- Inicio y pausa manual
- Reinicio dinámico

# Capítulo 6 - Control Programático

Además de su funcionamiento automático, **app-banner-text** permite controlar completamente la animación desde el componente padre.

En este capítulo aprenderás a utilizar:

- ViewChild
- Métodos públicos
- Eventos
- Control manual
- Reinicio dinámico

---

# Obteniendo una referencia del componente

La forma recomendada consiste en utilizar **ViewChild**.

```typescript
import {
    ViewChild
} from '@angular/core';

import {
    BannerTextComponent
} from '../banner-text/banner-text.component';

export class HomeComponent {

    @ViewChild(BannerTextComponent)

    banner!: BannerTextComponent;

}
```

Una vez inicializada la vista podrás acceder a toda la API pública.

---

# Iniciar manualmente

Si el banner tiene:

```html
<app-banner-text

    [autostart]="false">

    Bienvenido

</app-banner-text>
```

podrás iniciarlo cuando desees.

```typescript
this.banner.start();
```

Por ejemplo:

```typescript
iniciarBanner(){

    this.banner.start();

}
```

```html
<button
    class="btn btn-success"
    (click)="iniciarBanner()">

    Iniciar

</button>
```

---

# Detener completamente

```typescript
this.banner.stop();
```

El banner:

- detiene la animación
- cancela el requestAnimationFrame
- limpia el estado interno

Ejemplo:

```typescript
detenerBanner(){

    this.banner.stop();

}
```

---

# Pausar

```typescript
this.banner.pause();
```

La posición actual se conserva.

El banner podrá continuar posteriormente.

```html
<button
    class="btn btn-warning"
    (click)="banner.pause()">

    Pausar

</button>
```

---

# Reanudar

```typescript
this.banner.resume();
```

Continúa exactamente donde quedó pausado.

```html
<button
    class="btn btn-primary"
    (click)="banner.resume()">

    Continuar

</button>
```

---

# Reiniciar

```typescript
this.banner.restart();
```

El banner vuelve al inicio.

También reinicia:

- posición
- contador de recorridos
- dirección

---

# Ejemplo completo

```typescript
@Component({

    ...

})

export class HomeComponent {

    @ViewChild(BannerTextComponent)

    banner!: BannerTextComponent;

    iniciar(){

        this.banner.start();

    }

    pausar(){

        this.banner.pause();

    }

    continuar(){

        this.banner.resume();

    }

    reiniciar(){

        this.banner.restart();

    }

    detener(){

        this.banner.stop();

    }

}
```

```html
<app-banner-text
    [autostart]="false">

    <span class="text-primary">

        Banner controlado manualmente

    </span>

</app-banner-text>

<div class="mt-3">

    <button
        class="btn btn-success me-2"
        (click)="iniciar()">

        Iniciar

    </button>

    <button
        class="btn btn-warning me-2"
        (click)="pausar()">

        Pausar

    </button>

    <button
        class="btn btn-primary me-2"
        (click)="continuar()">

        Continuar

    </button>

    <button
        class="btn btn-info me-2"
        (click)="reiniciar()">

        Reiniciar

    </button>

    <button
        class="btn btn-danger"
        (click)="detener()">

        Detener

    </button>

</div>
```

---

# Eventos

El componente informa de lo que ocurre mediante tres eventos.

```
finished
bounce
loopCompleted
```

---

# finished

Se dispara cuando la animación termina definitivamente.

```html
<app-banner-text

    [loop]="1"

    (finished)="onFinished()">

    Banner

</app-banner-text>
```

```typescript
onFinished(){

    console.log("Banner finalizado.");

}
```

Usos recomendados:

- Mostrar otro banner.
- Iniciar una nueva campaña.
- Cambiar automáticamente el mensaje.

---

# bounce

Solo disponible para:

```
behavior="alternate"
```

Cada vez que el texto rebota:

```html
<app-banner-text

    behavior="alternate"

    (bounce)="onBounce()">

    Oferta Flash

</app-banner-text>
```

```typescript
onBounce(){

    console.log("Cambio de dirección.");

}
```

Puede utilizarse para:

- reproducir un sonido
- cambiar colores
- actualizar estadísticas

---

# loopCompleted

Se ejecuta cuando termina un recorrido.

```html
<app-banner-text

    (loopCompleted)="onLoop($event)">

    Banner

</app-banner-text>
```

```typescript
onLoop(loop:number){

    console.log(loop);

}
```

Salida:

```
1
2
3
4
...
```

---

# Cambiar el mensaje dinámicamente

Con Signals.

```typescript
mensaje = signal(

    "Bienvenido"

);
```

```html
<app-banner-text>

    {{ mensaje() }}

</app-banner-text>
```

Actualizar:

```typescript
this.mensaje.set(

    "Nueva promoción"

);
```

El banner actualizará automáticamente el contenido.

---

# Reinicio automático al cambiar el contenido

Después de modificar el mensaje puedes reiniciar la animación.

```typescript
actualizarBanner(){

    this.mensaje.set(

        "Cyber Days"

    );

    this.banner.restart();

}
```

---

# Mostrar campañas consecutivas

```typescript
mensajes=[

    "Envío Gratis",

    "30% de descuento",

    "Pago Seguro"

];

indice=0;

siguiente(){

    this.indice++;

    if(this.indice>=this.mensajes.length){

        this.indice=0;

    }

    this.mensaje.set(

        this.mensajes[this.indice]

    );

    this.banner.restart();

}
```

```html
<app-banner-text

    [loop]="1"

    (finished)="siguiente()">

    {{ mensaje() }}

</app-banner-text>
```

De esta forma el componente mostrará un mensaje diferente cada vez que finalice el anterior.

---

# Estado del componente

La API pública también permite consultar el estado.

```typescript
console.log(

    this.banner.running()

);

console.log(

    this.banner.pausedState()

);

console.log(

    this.banner.completedLoops()

);

console.table(

    this.banner.debugState()

);
```

Ejemplo:

```
running         true

paused          false

loops           8

position        -245

direction       -1

reducedMotion   false
```

---

# Buenas prácticas

✔ Utilizar `restart()` cuando cambie el contenido.

✔ Utilizar `pause()` en lugar de `stop()` cuando la animación vaya a continuar.

✔ Utilizar `finished` para secuencias de banners.

✔ Utilizar `loopCompleted` para obtener estadísticas.

✔ Utilizar `debugState()` únicamente durante el desarrollo.

---

# Próximo capítulo

En el siguiente capítulo aprenderás cómo integrar **app-banner-text** con Bootstrap 5 para construir barras informativas reutilizables, encabezados promocionales y layouts adaptables para aplicaciones de comercio electrónico.
