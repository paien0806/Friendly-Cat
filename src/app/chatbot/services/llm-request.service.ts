import { Injectable } from '@angular/core';
import { RequestService } from 'src/app/services/request.service';
import { Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LlmRequestService {

  url = "https://openrouter.ai/api/v1/chat/completions";
  model = "deepseek/deepseek-chat-v3-0324:free";
  
  constructor(
    private requestService: RequestService
  ) { }

  getLLMRes(foodDesc: string, storesInfo: any[]): Observable<any> {
    const body = JSON.stringify({
      model: this.model,
      messages: [
        {
          role: "system",
          content: `你是一個助手，專門根據使用者提供的商店資訊，篩選出符合指定食物類型的商品。
      你的回應必須是**純 JSON 格式**，不包含任何解釋或額外文字。

      foodDesc中若有指定商店類型，檢查storeName並只回傳特定商店且食物類型符合條件的商品就可以了：
      全家: 使用者可能指定的描述如全家便利商店、全家、FmailyMart、或是其他你推斷類似全家便利商店的文字
      711: 使用者可能輸入7-11、統一超商、或是其他你推斷是7-11便利商店的文字

      如果詢問的資訊不包含查詢商店內的商品相關，請告訴使用者你只能幫忙搜尋食品。

      商店資訊如下：
      ${this.jsonListToString(storesInfo)}

      如果沒有符合條件的商品，請回傳：
      \`\`\`json
      { "stores": [] }
      \`\`\`
      `
        },
        {
          role: "user",
          content: `請根據我提供的商店資訊，找出符合「${foodDesc}」食物描述的商品。
      
      請只回傳 JSON 格式，不要有其他解釋，格式如下：
      \`\`\`json
      {
        "stores": [
        {
          "storeName": "商店名稱",
          "distance": "距離",
          "items": [
          "符合條件的商品1",
          "符合條件的商品2"
          ]
        }
        ]
      }
      \`\`\`
      `
        }
      ],
      max_tokens: 6000,
    });

    return this.requestService.get("https://square-water-d5e4.jhcheng-alan.workers.dev/").pipe(
      switchMap(res => {
        const headers = new Headers({
          "Authorization": res.token, // 替換為你的 API Key
          "Content-Type": "application/json",
        });

        return this.requestService.post(this.url, null, body, headers);
      })
    );
  }

  private jsonListToString(json: any[]): string {
    return json.map(item => JSON.stringify(item)).join(', ');
  }
}
