import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sider',
  templateUrl: './sider.component.html',
  styleUrls: ['./sider.component.scss'],
})
export class SiderComponent {
  @Input() user: any; // 输入用户对象
  @Input() favoriteStores: any[] = []; // 输入喜爱商店列表

  loginOrLogout() {
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
