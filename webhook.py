# webhook.py
from fastapi import APIRouter, Request
import httpx
import os

router = APIRouter()

# 🔐 LINE 設定（記得放你自己的 TOKEN）
CHANNEL_ACCESS_TOKEN = "DED64eRi0GLeout3sWtkebzadMdiAydomXvXcYW4sxQTRepbcVaK7tlyckXLJRF8Rm2+dVjTLGNUXFBK6IswVpCYqwvPio52blUsMmv+GZSfG87uUBV7dgty9H4/bCRKPbSZm19K7YyWkjHO5cbxtQdB04t89/1O/w1cDnyilFU="
REPLY_ENDPOINT = "https://api.line.me/v2/bot/message/reply"
ITEM_API = "https://friendly-cat-api.onrender.com/items"  # ← 你剛剛部署成功的網址

@router.post("/webhook")
async def webhook(request: Request):
    body = await request.json()
    events = body.get("events", [])

    for event in events:
        reply_token = event["replyToken"]

        # 只處理位置訊息
        if event["type"] == "message" and event["message"]["type"] == "location":
            lat = event["message"]["latitude"]
            lng = event["message"]["longitude"]

            # 呼叫 /items API 拿資料
            async with httpx.AsyncClient() as client:
                res = await client.get(ITEM_API, params={"lat": lat, "lng": lng})
                items = res.json()

            # 如果沒有找到商品
            if not items:
                await reply_text(reply_token, "附近 1 公里內沒有即期商品 😢")
                return {"status": "ok"}

            # 回傳前 5 項商品（LINE carousel 最多 10 項）
            bubbles = []
            for item in items[:5]:
                bubble = {
                    "thumbnailImageUrl": item["image"],
                    "title": item["name"][:40],
                    "text": f"價格：{item['price']}元\n距離：{item['distance']}公尺",
                    "actions": [
                        {
                            "type": "uri",
                            "label": "立即查看",
                            "uri": f"https://www.google.com/maps?q={item['lat']},{item['lng']}"
                        }
                    ]
                }
                bubbles.append(bubble)

            flex_msg = {
                "type": "template",
                "altText": "附近即期商品",
                "template": {
                    "type": "carousel",
                    "columns": bubbles
                }
            }

            await reply_flex(reply_token, flex_msg)
        else:
            await reply_text(reply_token, "請傳送你的位置 📍，我會找附近即期商品給你！")

    return {"status": "ok"}


async def reply_text(token, message):
    async with httpx.AsyncClient() as client:
        await client.post(
            REPLY_ENDPOINT,
            headers={
                "Authorization": f"Bearer {CHANNEL_ACCESS_TOKEN}",
                "Content-Type": "application/json"
            },
            json={
                "replyToken": token,
                "messages": [{"type": "text", "text": message}]
            }
        )


async def reply_flex(token, flex_msg):
    async with httpx.AsyncClient() as client:
        await client.post(
            REPLY_ENDPOINT,
            headers={
                "Authorization": f"Bearer {CHANNEL_ACCESS_TOKEN}",
                "Content-Type": "application/json"
            },
            json={
                "replyToken": token,
                "messages": [flex_msg]
            }
        )
