import { Component, Input } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sider',
  templateUrl: './sider.component.html',
  styleUrls: ['./sider.component.scss'],
})
export class SiderComponent {
  @Input() user: any;
  @Input() favoriteStores: any[] = [];

  sevenElevenIconUrl = environment.sevenElevenUrl.icon;
  familyMartIconUrl = environment.familyMartUrl.icon;

  loginOrlogout() {
    // 处理登录登出的逻辑
    if (this.user) {
      // 登出逻辑
      console.log('Logging out...');
    } else {
      // 登录逻辑
      console.log('Logging in...');
    }
  }
}
