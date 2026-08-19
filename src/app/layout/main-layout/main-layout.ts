import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Sidebar, Icon],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {}
