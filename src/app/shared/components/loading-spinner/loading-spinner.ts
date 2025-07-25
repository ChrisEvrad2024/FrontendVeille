// ===== 12. src/app/shared/components/loading-spinner/loading-spinner.ts =====
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner" [style.width]="size" [style.height]="size">
      <div class="bounce1"></div>
      <div class="bounce2"></div>
      <div class="bounce3"></div>
    </div>
  `,
  styles: [`
    .spinner {
      display: inline-block;
      position: relative;
    }

    .spinner > div {
      width: 18px;
      height: 18px;
      background-color: #333;
      border-radius: 100%;
      display: inline-block;
      animation: sk-bouncedelay 1.4s infinite ease-in-out both;
    }

    .spinner .bounce1 {
      animation-delay: -0.32s;
    }

    .spinner .bounce2 {
      animation-delay: -0.16s;
    }

    @keyframes sk-bouncedelay {
      0%, 80%, 100% {
        transform: scale(0);
      } 40% {
        transform: scale(1.0);
      }
    }
  `]
})
export class LoadingSpinner {
  @Input() size: string = '50px';
}