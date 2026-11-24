import {
  Component,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

@Component({
    selector: 'app-page-with-sidebar',
    standalone: true,
    templateUrl: './page-with-sidebar.html',
    styleUrl: './page-with-sidebar.scss'
})
export class PageWithSidebar {

    @Input() isExpanded = true;

    @Output() isExpandedChange = new EventEmitter<boolean>();

    toggleSidebar(): void {
        this.isExpanded = !this.isExpanded;
        this.isExpandedChange.emit(this.isExpanded);
    }
}
