export interface MenuItem {
    title?: string;
    icon?: string;
    link?: string;
    color?: string;
  
    hideFor?: string;
    routerLink?: string;
    expanded?: boolean;
    subMenu?: MenuItem[];
    path?: string;
  }
  
  export type Menu = MenuItem[];
  