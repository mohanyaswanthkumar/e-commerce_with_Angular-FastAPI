import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container">
      <div class="not-found">
        <div class="error-code">404</div>
        <h1>Page Not Found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <a routerLink="/home" class="btn btn-primary">Back to Home</a>
      </div>
    </div>
  `,
  styles: [`
    .not-found {
      text-align: center;
      padding: 80px 20px;

      .error-code {
        font-family: var(--font-display);
        font-size: 120px;
        font-weight: 700;
        color: var(--border);
        line-height: 1;
        margin-bottom: 16px;
      }

      h1 { margin-bottom: 12px; }
      p { color: var(--text-secondary); margin-bottom: 32px; }
    }
  `]
})
export class NotFoundComponent {}
