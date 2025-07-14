# webhook.py
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import math
import httpx

# ✅ LINE Token 放最上面
CHANNEL_ACCESS_TOKEN = "DED64eRi0GLeout3sWtkebzadMdiAydomXvXcYW4sxQTRepbcVaK7tlyckXLJRF8Rm2+dVjTLGNUXFBK6IswVpCYqwvPio52blUsMmv+GZSfG87uUBV7dgty9H4/bCRKPbSZm19K7YyWkjHO5cbxtQdB04t89/1O/w1cDnyilFU="
REPLY_ENDPOINT = "https://api.line.me/v2/bot/message/reply"

router = APIRouter()

# 範例商品資料（含地點與圖片）
EXPIRED_ITEMS = [
    {"name": "7-11 焗烤雞腿飯", "price": 79, "lat": 25.033, "lng": 121.5654, "image": "https://i.imgur.com/example1.jpg"},
    {"name": "全家 照燒雞三明治", "price": 49, "lat": 25.0325, "lng": 121.566, "image": "https://i.imgur.com/example2.jpg"},
    {"name": "全聯 草莓牛奶", "price": 32, "lat": 22.6273, "lng": 120.3014, "image": "https://i.imgur.com/example3.jpg"},
    {"name": "OK 超商 鮪魚飯糰", "price": 35, "lat": 24.1477, "lng": 120.6736, "image": "https://i.imgur.com/example4.jpg"},
    {"name": "7-11 日式炸雞便當", "price": 85, "lat": 25.034, "lng": 121.5644, "image": "https://i.imgur.com/example5.jpg"},
    {"name": "全家 起司蛋堡", "price": 42, "lat": 22.6255, "lng": 120.2995, "image": "https://i.imgur.com/example6.jpg"}
]

def haversine(lat1, lng1, lat2, lng2):
    R = 6371
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lng2 - lng1)
    a = math.sin(d_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

@router.post("/webhook")
async def webhook(req: Request):
    body = await req.json()
    events = body.get("events", [])

    for event in events:
        if event["type"] == "message" and event["message"]["type"] == "location":
            user_lat = event["message"]["latitude"]
            user_lng = event["message"]["longitude"]
            reply_token = event["replyToken"]

            nearby = []
            for item in EXPIRED_ITEMS:
                dist_km = haversine(user_lat, user_lng, item["lat"], item["lng"])
                if dist_km <= 1:
                    nearby.append({
                        "name": item["name"],
                        "brand": item["name"].split()[0],
                        "price": item["price"],
                        "image": item["image"],
                        "distance": round(dist_km * 1000)
                    })

            if not nearby:
                reply = [{"type": "text", "text": "🚫 1 公里內查無即期商品"}]
            else:
                columns = []
                for item in nearby[:10]:  # 最多 10 項
                    columns.append({
                        "thumbnailImageUrl": item["image"],
                        "title": f"{item['brand']} - {item['name'][:40]}",
                        "text": f"💰 {item['price']} 元\n📍{item['distance']} 公尺內",
                        "actions": [{"type": "message", "label": "我要看更多", "text": "我要看更多"}]
                    })
                reply = [{
                    "type": "template",
                    "altText": "即期商品查詢結果",
                    "template": {
                        "type": "carousel",
                        "columns": columns
                    }
                }]

            await send_reply(reply_token, reply)

    return JSONResponse({"status": "ok"})

async def send_reply(token, messages):
    headers = {
        "Authorization": f"Bearer {CHANNEL_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {"replyToken": token, "messages": messages}
    async with httpx.AsyncClient() as client:
        await client.post(REPLY_ENDPOINT, headers=headers, json=payload)
