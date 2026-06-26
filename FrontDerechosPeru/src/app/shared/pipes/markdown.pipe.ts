import { Pipe, PipeTransform, SecurityContext, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { marked } from 'marked';

/**
 * Renderiza Markdown a HTML saneado. El contenido lo escribe staff (editores),
 * pero igual se pasa por el sanitizer de Angular (no bypass) para evitar XSS.
 */
@Pipe({ name: 'markdown', standalone: true })
export class MarkdownPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(value: string | null | undefined): string {
    if (!value) return '';
    const html = marked.parse(value, { async: false, breaks: true, gfm: true }) as string;
    return this.sanitizer.sanitize(SecurityContext.HTML, html) ?? '';
  }
}
