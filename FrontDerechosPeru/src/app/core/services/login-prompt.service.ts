import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoginPromptService {
  readonly visible = signal(false);
  readonly feature = signal<'chat' | 'foro' | ''>('');

  show(feature: 'chat' | 'foro' | '' = '') { this.feature.set(feature); this.visible.set(true); }
  hide() { this.visible.set(false); }
}
