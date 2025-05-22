import { BreakpointObserver, MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { Menu } from '../menu.model';
import { MatDialog } from '@angular/material/dialog';
import { PdfDialogComponent } from '../pdf-dialog/pdf-dialog.component';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnDestroy {
  mobileQuery: MediaQueryList;
  isSidenavOpen = false;
  @Output() menuToggled = new EventEmitter<boolean>();
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  showLeftMenu = false;
  user: string = '';
  isCollapsed = false;
  opened = true;
  showeventanalysis = false;
  showcasualdiscovery = false;
  showhmichatbot = true;
  username: any;
  menu: Menu = [
    {
      title: 'Batch Data Analyzer',
      icon: 'search',
      path: '/batch-analysis',

    },
    {
      title: 'Event Analysis',
      icon: 'list',
      path: '/event-analysis'

    },
    {
      title: 'Causal Discovery',
      icon: 'account_circle',
      path: '/causal-discovery'
    },
    {
      title: 'Data Vault',
      icon: 'view_module',
      path: '/data-vault'
    }
  ];

  private _mobileQueryListener: () => void;
  constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private observer: BreakpointObserver,
    private router: Router, public dialog: MatDialog) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }
  ngOnInit() {
    this.username = (localStorage.getItem("username") || '{}').replace(/"/g, '');
  }
  message: string = '';
  isClicked = false;
  getMessage() {
    this.isClicked = !this.isClicked;
    if (this.isClicked) {
      this.message = 'Welcome to GFG!!!';
    } else {
      this.message = '';
    }
  }
  routes = [
    { path: '/first-component', display: 'First Component' },
    { path: '/second-component', display: 'Second Component' },
  ];
  toggleMenu() {
    if (this.showLeftMenu) {
      this.sidenav.toggle();
      this.isCollapsed = false;
    } else {
      this.sidenav.open();
      this.isCollapsed = !this.isCollapsed;
    }
  }
  logout() {
    this.router.navigate(['./login']);
    localStorage.clear()
  }

  openPdfDialog() {
    const dialogRef = this.dialog.open(PdfDialogComponent, {
      data: { filePath: 'assets/UserGuideCausalAnalysis.pdf' }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }
  handleClick(title: any) {
    if (title == 'Event Analysis') {
      this.isClicked = true;
      this.showcasualdiscovery = false;
      this.showhmichatbot = false;
      this.showeventanalysis = true;
    }
    else if (title == 'Causal Discovery') {
      this.showeventanalysis = false;
      this.showhmichatbot = false;
      this.showcasualdiscovery = true;
    }
    else if (title == 'Batch Data Analyzer') {
      this.showeventanalysis = false;
      this.showcasualdiscovery = false;
      this.showhmichatbot = true;
    }
  }
  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
  shouldRun = [/(^|\.)plnkr\.co$/, /(^|\.)stackblitz\.io$/].some(h => h.test(window.location.host));
}

