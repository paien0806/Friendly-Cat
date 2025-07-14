# 🔧 設定區（請只改這裡）
CHANNEL_ACCESS_TOKEN = "DED64eRi0GLeout3sWtkebzadMdiAydomXvXcYW4sxQTRepbcVaK7tlyckXLJRF8Rm2+dVjTLGNUXFBK6IswVpCYqwvPio52blUsMmv+GZSfG87uUBV7dgty9H4/bCRKPbSZm19K7YyWkjHO5cbxtQdB04t89/1O/w1cDnyilFU="
CHANNEL_SECRET = "f6ad0906db1caa0a57bea1cf0f66d7f0"

# =============================
# 🚀 主程式開始
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import httpx
import math

app = FastAPI()

# ✅ 即期品項資料（未來可換成資料庫或 API）
EXPIRED_ITEMS = [
    {"name": "7-11 焗烤雞腿飯", "price": 79, "lat": 25.033, "lng": 121.5654, "image": "https://i.imgur.com/example1.jpg"},
    {"name": "全家 照燒雞三明治", "price": 49, "lat": 25.0325, "lng": 121.566, "image": "https://i.imgur.com/example2.jpg"},
    {"name": "全聯 草莓牛奶", "price": 32, "lat": 22.6273, "lng": 120.3014, "image": "https://i.imgur.com/example3.jpg"},
    {"name": "OK 超商 鮪魚飯糰", "price": 35, "lat": 24.1477, "lng": 120.6736, "image": "https://i.imgur.com/example4.jpg"},
    {"name": "7-11 日式炸雞便當", "price": 85, "lat": 25.034, "lng": 121.5644, "image": "https://i.imgur.com/example5.jpg"},
    {"name": "全家 起司蛋堡", "price": 42, "lat": 22.6255, "lng": 120.2995, "image": "https://i.imgur.com/example6.jpg"}
]

# =============================
# ✅ /items API：可用經緯度篩選附近商品
@app.get("/items")
def get_items(lat: float = None, lng: float = None, radius: int = 1000):
    def haversine(lat1, lng1, lat2, lng2):
        R = 6371
        phi1, phi2 = math.radians(lat1), math.radians(lat2)
        d_phi = math.radians(lat2 - lat1)
        d_lambda = math.radians(lng2 - lng1)
        a = math.sin(d_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2)**2
        return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    if lat is not None and lng is not None:
        results = []
        for item in EXPIRED_ITEMS:
            dist = haversine(lat, lng, item["lat"], item["lng"]) * 1000
            if dist <= radius:
                item_with_distance = item.copy()
                item_with_distance["distance"] = round(dist)
                results.append(item_with_distance)
        results.sort(key=lambda x: x["distance"])
        return {"items": results}
    else:
        return {"items": EXPIRED_ITEMS}

# =============================
# ✅ /webhook：接收 LINE 地點並回傳附近品項
@app.post("/webhook")
async def webhook(req: Request):
    body = await req.json()
    events = body.get("events", [])

    for event in events:
        if event["type"] == "message":
            msg = event["message"]
            reply_token = event["replyToken"]

            if msg["type"] == "location":
                user_lat = msg["latitude"]
                user_lng = msg["longitude"]

                # 計算距離內的品項
                def haversine(lat1, lng1, lat2, lng2):
                    R = 6371
                    phi1, phi2 = math.radians(lat1), math.radians(lat2)
                    d_phi = math.radians(lat2 - lat1)
                    d_lambda = math.radians(lng2 - lng1)
                    a = math.sin(d_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2)**2
                    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

                near_items = []
                for item in EXPIRED_ITEMS:
                    dist = haversine(user_lat, user_lng, item["lat"], item["lng"]) * 1000
                    if dist <= 1000:
                        near_items.append({
                            "name": item["name"],
                            "price": item["price"],
                            "distance": round(dist),
                            "image": item["image"]
                        })

                if not near_items:
                    reply = {"type": "text", "text": "🚫 1公里內查無即期商品"}
                else:
                    first = near_items[0]
                    reply = {
                        "type": "template",
                        "altText": "即期商品",
                        "template": {
                            "type": "buttons",
                            "thumbnailImageUrl": first["image"],
                            "title": first["name"],
                            "text": f"💰{first['price']} 元\n📍{first['distance']} 公尺內",
                            "actions": [
                                {"type": "message", "label": "查看更多", "text": "我要看更多"}
                            ]
                        }
                    }

                await send_reply(reply_token, [reply])

    return JSONResponse({"status": "ok"})

# =============================
# ✅ 傳送訊息給 LINE
async def send_reply(token, messages):
    headers = {
        "Authorization": f"Bearer {CHANNEL_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "replyToken": token,
        "messages": messages
    }
    async with httpx.AsyncClient() as client:
        await client.post("https://api.line.me/v2/bot/message/reply", headers=headers, json=payload)
