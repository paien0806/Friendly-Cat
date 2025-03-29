import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ViewChild, ElementRef, OnInit } from '@angular/core';

import { AuthService } from '../services/auth.service';
import { SearchFoodModule } from '../search-food/search-food.module';
import { StoreDataService } from '../services/stores-data.service';

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
  messages: { text: string; sender: string }[] = [
    { text: '嗨，想要找什麼類型的食物呢？', sender: 'bot' }
  ];

  constructor(
    private authService: AuthService,
    private storeDataService: StoreDataService,
  ) {}

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
      this.storesInfo = this.storeDataService.getStores();
      
      // Add user message
      this.messages.push({ text: this.userInput, sender: 'user' });

      if (this.storesInfo.length === 0) {
        this.messages.push({ text: '請先點擊「使用目前位置」搜尋按鈕，才能幫你看附近商店唷！', sender: 'bot' });
      }
      else {
        // Simulate bot response (you can replace this with actual bot logic)
        setTimeout(() => {
          this.messages.push({ text: '測試回應唷', sender: 'bot' });
        }, 500);
      }
      this.userInput = ''; // Clear input
    }
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
}
