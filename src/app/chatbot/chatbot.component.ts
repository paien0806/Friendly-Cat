import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ViewChild, ElementRef, OnInit } from '@angular/core';
import { forkJoin, of, map, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { SearchFoodModule } from '../search-food/search-food.module';
import { StoreDataService } from '../services/stores-data.service';
import { SevenElevenRequestService } from '../search-food/new-search/services/seven-eleven-request.service';
import { LlmRequestService } from './services/llm-request.service';
import { Store, StoreResponse } from './model/llm-res.model';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    SearchFoodModule
  ],
})
export class ChatbotComponent {
  @ViewChild('chatBody') chatBody!: ElementRef; // Reference to the chat body

  isLogin: boolean = false;
  storesInfo: any[] = [];
  isOpen = false;
  userInput = '';
  messages: { text: string; sender: string; isLoading?: boolean }[] = [
    { text: '嗨，想要找什麼類型的食物呢？', sender: 'bot' }
  ];

  constructor(
    private authService: AuthService,
    private storeDataService: StoreDataService,
    private sevenElevenRequestService: SevenElevenRequestService,
    private llmRequestService: LlmRequestService
  ) { }

  ngOnInit() {
    this.authService.isLoggedIn().subscribe((res) => {
      this.isLogin = res;
    });
  }

  toggleChat(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    if (this.userInput.trim()) {
      this.storesInfo = this.storeDataService.getStores().slice(0, 10);
      const input = this.userInput;
      this.userInput = ''; // 清空輸入
      // 加入使用者訊息
      this.putMessage(input, 'user');

      if (this.storesInfo.length === 0) {
        this.putMessage('請先點擊「使用目前位置」搜尋按鈕，才能幫你看附近商店唷！', 'bot');
      } else {
        this.putMessage('正在搜尋附近的便利商店...', 'bot', true);

        // 確保 7-11 資料取得後再送到 LLM
        this.requestSevenInfoAndCombineFm().subscribe(updatedStores => {
          console.log("updatedStores", updatedStores);
          this.storesInfo = updatedStores; // 更新 storesInfo

          this.llmRequestService.getLLMRes(input, this.storesInfo).subscribe((res) => {
            this.messages = this.messages.filter(msg => !msg.isLoading);
            const resObj: StoreResponse = JSON.parse(res.choices[0].message.content.trim().replace(/```json|```/g, ''));

            if (resObj.error) {
              this.putMessage(resObj.error, "bot");
              return
            }

            if (resObj.stores.length === 0) {
              this.putMessage("找不到你想要的東西QQ", "bot");
              return
            }

            let messageText = "這些商店有賣你想要的！\n\n";
            resObj.stores.forEach((store: Store) => {
              messageText += `📍 ${store.storeName}（距離 ${store.distance.toFixed(1)}m）\n`;
              if (store.items.length > 0) {
                messageText += ` ${store.items.join("\n")}\n\n`;
              } else {
                messageText += `⚠️ 這間店沒有找到相關商品\n\n`;
              }
            });

            this.putMessage(messageText, 'bot');
          });
        });
      }
    }
  }


  putMessage(message: string, sender: string, isLoading?: boolean) {
    this.messages.push({ text: message, sender: sender, isLoading: isLoading });
  }

  // Auto-scroll to bottom after view updates
  ngAfterViewChecked() {
    if (this.isOpen && this.chatBody) {
      this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {
    const element = this.chatBody.nativeElement;
    element.scrollTop = element.scrollHeight;
  }

  private requestSevenInfoAndCombineFm(): Observable<any[]> {
    const requests = this.storesInfo.map(storeInfo => {
      return storeInfo.StoreNo
        ? this.sevenElevenRequestService.getItemsByStoreNo(storeInfo.StoreNo).pipe(
          map(res => ({
            "storeName": storeInfo.storeName,
            "distance": storeInfo.distance,
            "foodInfo": res.element.StoreStockItem.CategoryStockItems
          }))
        )
        : of({
          "storeName": storeInfo.storeName,
          "distance": storeInfo.distance,
          "foodInfo": storeInfo.info
        });
    });

    return forkJoin(requests).pipe(
      map(results => results.filter(result => result.foodInfo.length > 0))
    );
  }

}
