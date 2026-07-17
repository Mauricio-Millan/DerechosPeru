import { Component, Input, OnDestroy, inject, signal, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConstitucionService } from '../../../core/services/constitucion.service';
import {
  Articulo, CategoriaArticulo, ConsultaResultado,
  MensajeChat, FuenteChat, SegmentoMensaje,
} from '../../../core/models/constitucion.models';
import { ArticleCardComponent } from '../../../shared/components/article-card/article-card.component';

const EJEMPLOS = [
  'Me despidieron sin causa justificada y no me pagaron mis beneficios',
  'El colegio de mi hijo le niega matrícula sin explicación',
  'Me niegan atención médica en el hospital público',
  'Mi vecino invadió parte de mi terreno registrado',
  'Fui discriminado en mi trabajo por mi origen',
  'Me detuvieron sin orden judicial',
];

const MENSAJE_INICIAL: MensajeChat = {
  rol: 'bot',
  texto: '¡Hola! Soy tu asistente constitucional.\n\nCuéntame con tus propias palabras la situación o duda que tienes y te orientaré con los artículos de la Constitución Política del Perú que aplican a tu caso.',
};

const ART_RE = /\[Art\.\s*(\d+)\]/g;

@Component({
  selector: 'app-consulta-guiada',
  standalone: true,
  imports: [CommonModule, FormsModule, ArticleCardComponent],
  templateUrl: './consulta-guiada.component.html',
  styleUrl: './consulta-guiada.component.scss',
})
export class ConsultaGuiadaComponent implements OnDestroy {
  private readonly service = inject(ConstitucionService);

  readonly ejemplos = EJEMPLOS;
  readonly resultados = signal<ConsultaResultado[]>([]);
  readonly cargando = signal(false);
  readonly consultado = signal(false);

  // Chat
  readonly tab = signal<'consulta' | 'chat'>('consulta');
  readonly mensajes = signal<MensajeChat[]>([MENSAJE_INICIAL]);
  readonly enviando = signal(false);
  readonly articulosCtx = signal<FuenteChat[]>([]);
  readonly articuloModal = signal<FuenteChat | null>(null);
  readonly chatBody = viewChild<ElementRef<HTMLDivElement>>('chatBody');
  preguntaChat = '';
  texto = '';

  @Input() set startTab(v: string) {
    if (v === 'chat') this.tab.set('chat');
  }

  @Input() set autoVoz(v: boolean) {
    if (!v) return;
    this.autoLeer.set(true);
    setTimeout(() => {
      if (this.ttsSupported) {
        // Lee el saludo y al terminar activa el micrófono
        this.leer(MENSAJE_INICIAL.texto, () => {
          if (this.speechSupported) this.iniciarVoz();
        });
      } else if (this.speechSupported) {
        this.iniciarVoz();
      }
    }, 400);
  }

  // Accesibilidad de voz
  readonly speechSupported = ('SpeechRecognition' in window) || ('webkitSpeechRecognition' in window);
  readonly ttsSupported = 'speechSynthesis' in window;
  readonly escuchando = signal(false);
  readonly leyendo = signal(false);
  readonly autoLeer = signal(false);
  private recognition: any = null;

  usarEjemplo(ejemplo: string): void {
    this.texto = ejemplo;
    this.consultar();
  }

  consultar(): void {
    const t = this.texto.trim();
    if (t.length < 5 || this.cargando()) return;
    this.cargando.set(true);
    this.service.consultarGuiada(t).subscribe({
      next: r => {
        this.resultados.set(r.resultados);
        this.consultado.set(true);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  enviarChat(): void {
    const p = this.preguntaChat.trim();
    if (p.length < 5 || this.enviando()) return;

    const esPrimero = this.articulosCtx().length === 0;

    // Historial = mensajes reales (excluye el saludo inicial hardcoded)
    const historial = this.mensajes()
      .filter(m => m !== MENSAJE_INICIAL)
      .map(m => ({ rol: m.rol, texto: m.texto }));

    this.mensajes.update(m => [...m, { rol: 'user', texto: p }]);
    this.preguntaChat = '';
    this.enviando.set(true);
    this.scrollChat();

    const payload: Parameters<typeof this.service.chatConstitucional>[0] = {
      mensaje: p,
      historial,
      ...(esPrimero ? {} : { articulos_ids: this.articulosCtx().map(f => f.id) }),
    };

    this.service.chatConstitucional(payload).subscribe({
      next: r => {
        if (esPrimero && r.fuentes.length > 0) this.articulosCtx.set(r.fuentes);
        this.mensajes.update(m => [
          ...m,
          { rol: 'bot', texto: r.respuesta, fuentes: esPrimero ? r.fuentes : undefined },
        ]);
        this.enviando.set(false);
        this.scrollChat();
        if (this.autoLeer()) this.leer(r.respuesta);
      },
      error: () => {
        this.mensajes.update(m => [
          ...m,
          { rol: 'bot', texto: 'Error al conectar con el asistente. Inténtalo de nuevo.' },
        ]);
        this.enviando.set(false);
      },
    });
  }

  /** Descompone el texto del bot en segmentos texto / referencia [Art. N] */
  parsear(texto: string): SegmentoMensaje[] {
    const segs: SegmentoMensaje[] = [];
    let last = 0;
    ART_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = ART_RE.exec(texto)) !== null) {
      if (m.index > last) segs.push({ type: 'text', value: texto.slice(last, m.index) });
      segs.push({ type: 'ref', value: m[0], numero: Number(m[1]) });
      last = m.index + m[0].length;
    }
    if (last < texto.length) segs.push({ type: 'text', value: texto.slice(last) });
    return segs;
  }

  abrirArticulo(numero: number): void {
    const art = this.articulosCtx().find(f => f.numero === numero);
    if (art) this.articuloModal.set(art);
  }

  private scrollChat(): void {
    setTimeout(() => {
      const el = this.chatBody()?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }

  iniciarVoz(): void {
    if (this.escuchando()) { this.recognition?.abort(); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SR();
    this.recognition.lang = 'es-PE';
    this.recognition.interimResults = false;
    this.recognition.onresult = (e: any) => {
      this.preguntaChat = e.results[0][0].transcript;
      this.escuchando.set(false);
      this.enviarChat();
    };
    this.recognition.onerror = () => this.escuchando.set(false);
    this.recognition.onend = () => this.escuchando.set(false);
    this.recognition.start();
    this.escuchando.set(true);
  }

  leer(texto: string, onEnd?: () => void): void {
    if (!this.ttsSupported) return;
    speechSynthesis.cancel();
    const limpio = texto.replace(/\[Art\.\s*\d+\]/g, '').trim();
    const utt = new SpeechSynthesisUtterance(limpio);
    utt.lang = 'es-PE';
    utt.rate = 0.95;
    utt.onstart = () => this.leyendo.set(true);
    utt.onend = () => { this.leyendo.set(false); onEnd?.(); };
    utt.onerror = () => { this.leyendo.set(false); onEnd?.(); };
    speechSynthesis.speak(utt);
  }

  toggleAutoLeer(): void { this.autoLeer.update(v => !v); }

  detenerAudio(): void {
    speechSynthesis.cancel();
    this.leyendo.set(false);
  }

  ngOnDestroy(): void {
    this.recognition?.abort();
    speechSynthesis.cancel();
  }

  toArticulo(r: ConsultaResultado): Articulo {
    return {
      id: r.id, numero: r.numero, titulo: r.titulo,
      contenido: r.contenido, categoria: r.categoria as CategoriaArticulo,
      capituloId: 0, tituloId: 0,
    };
  }
}
