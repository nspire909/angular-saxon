import { Directive, ElementRef, HostListener, Renderer2, booleanAttribute, effect, inject, input } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

@Directive({
  standalone: true,
  selector: '[ibsOverflowTooltip]',
})
export class OverflowTooltipDirective {
  private readonly matTooltip = inject(MatTooltip, { optional: true });
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);

  active = input<boolean, unknown>(true, { transform: booleanAttribute, alias: 'ibsOverflowTooltip' });

  constructor() {
    effect(() => {
      const addEllipsis = {
        'white-space': 'nowrap',
        'overflow': 'hidden',
        'text-overflow': 'ellipsis',
      };
      if (this.active()) {
        Object.entries(addEllipsis).forEach(([key, value]) => {
          this.renderer.setStyle(this.el.nativeElement, key, value);
        });
      } else {
        Object.keys(addEllipsis).forEach((key) => {
          this.renderer.removeStyle(this.el.nativeElement, key);
        });
      }
    });
  }

  @HostListener('window:resize')
  @HostListener('mouseover')
  run() {
    if (this.el.nativeElement.offsetWidth < this.el.nativeElement.scrollWidth) {
      // checks for text overflow
      if (this.matTooltip) {
        this.matTooltip.message = this.getMessage();
        this.matTooltip.disabled = false;
      } else {
        this.renderer.setAttribute(this.el.nativeElement, 'title', this.getMessage());
      }
    } else {
      if (this.matTooltip) {
        this.matTooltip.disabled = true;
      } else {
        this.renderer.removeAttribute(this.el.nativeElement, 'title');
      }
    }
  }

  private getMessage(): string {
    // Input elements don't set their innerText/textContent with their value
    return (
      this.matTooltip?.message ||
      this.el.nativeElement.innerText ||
      ('value' in this.el.nativeElement ? (this.el.nativeElement.value as string) : '')
    );
  }
}
