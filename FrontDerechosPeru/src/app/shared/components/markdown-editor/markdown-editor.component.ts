import { Component, ElementRef, input, model, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownPipe } from '../../pipes/markdown.pipe';

@Component({
  selector: 'app-markdown-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownPipe],
  template: `
    <div class="mde">
      <div class="mde__toolbar">
        <button type="button" (click)="wrap('**','**')" title="Negrita"><b>B</b></button>
        <button type="button" (click)="wrap('*','*')" title="Cursiva"><i>I</i></button>
        <button type="button" (click)="prefix('## ')" title="Subtítulo">H</button>
        <button type="button" (click)="prefix('- ')" title="Lista">•</button>
        <span class="mde__spacer"></span>
        <button type="button" class="mde__toggle" [class.mde__toggle--on]="preview()" (click)="preview.set(!preview())">
          {{ preview() ? 'Editar' : 'Vista previa' }}
        </button>
      </div>
      @if (preview()) {
        <div class="mde__preview" [innerHTML]="value() | markdown"></div>
      } @else {
        <textarea #ta class="mde__text" [(ngModel)]="value" [rows]="rows()"></textarea>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as v;

    .mde { border: 1.5px solid v.$color-border; border-radius: v.$radius-sm; overflow: hidden; background: white; }
    .mde__toolbar { display: flex; align-items: center; gap: 2px; padding: 4px; background: v.$color-bg-subtle; border-bottom: 1px solid v.$color-border; }
    .mde__toolbar button { width: 28px; height: 28px; border: none; background: transparent; border-radius: v.$radius-sm; cursor: pointer; font-size: v.$font-size-sm; color: v.$color-text-secondary; }
    .mde__toolbar button:hover { background: white; color: v.$color-primary; }
    .mde__spacer { flex: 1; }
    .mde__toggle { width: auto !important; padding: 0 v.$spacing-sm; font-weight: 600; font-size: v.$font-size-xs !important; }
    .mde__toggle--on { background: white !important; color: v.$color-primary !important; }
    .mde__text { width: 100%; border: none; padding: v.$spacing-sm; font-size: v.$font-size-sm; font-family: v.$font-family-ui; line-height: 1.5; resize: vertical; outline: none; display: block; }
    .mde__preview { padding: v.$spacing-sm; font-size: v.$font-size-sm; font-family: v.$font-family-base; line-height: 1.55; color: v.$color-text-primary; }
    .mde__preview :first-child { margin-top: 0; }
    .mde__preview :last-child { margin-bottom: 0; }
  `],
})
export class MarkdownEditorComponent {
  readonly value = model<string>('');
  readonly rows = input(6);
  readonly preview = signal(false);
  private readonly ta = viewChild<ElementRef<HTMLTextAreaElement>>('ta');

  /** Envuelve la selección (negrita/cursiva). */
  wrap(before: string, after: string): void {
    const el = this.ta()?.nativeElement;
    const text = this.value();
    if (!el) { this.value.set(text + before + after); return; }
    const s = el.selectionStart, e = el.selectionEnd;
    this.value.set(text.slice(0, s) + before + text.slice(s, e) + after + text.slice(e));
    queueMicrotask(() => {
      el.focus();
      el.selectionStart = s + before.length;
      el.selectionEnd = e + before.length;
    });
  }

  /** Inserta un prefijo al inicio de la línea actual (título/lista). */
  prefix(p: string): void {
    const el = this.ta()?.nativeElement;
    const text = this.value();
    if (!el) { this.value.set(p + text); return; }
    const s = el.selectionStart;
    const lineStart = text.lastIndexOf('\n', s - 1) + 1;
    this.value.set(text.slice(0, lineStart) + p + text.slice(lineStart));
    queueMicrotask(() => { el.focus(); el.selectionStart = el.selectionEnd = s + p.length; });
  }
}
