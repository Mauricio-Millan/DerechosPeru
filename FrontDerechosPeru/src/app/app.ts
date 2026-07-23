import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatFabComponent } from './shared/components/chat-fab/chat-fab.component';
import { LoginPromptComponent } from './shared/components/login-prompt/login-prompt.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChatFabComponent, LoginPromptComponent],
  template: `<router-outlet /><app-chat-fab /><app-login-prompt />`,
})
export class App {}
