import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatFabComponent } from './shared/components/chat-fab/chat-fab.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChatFabComponent],
  template: `<router-outlet /><app-chat-fab />`,
})
export class App {}
