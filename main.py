from fastapi import FastAPI, Request, Query
from fastapi.responses import JSONResponse
import httpx
import math
import os

app = FastAPI()

# ===============================
# 商品資料（內建地點與圖片）
# ===============================
EXPIRED_ITEMS = [
    {"name": "7-11 焗烤雞腿飯", "price": 79, "lat": 25.033, "lng": 121.5654, "image": "https://i.imgur.com/example1.jpg"},
    {"name": "全家 照燒雞三明治", "price": 49, "lat": 25.0325, "lng": 121.566, "image": "https://i.imgur.com/example2.jpg"},
    {"name": "全聯 草莓牛奶", "price": 32, "lat": 22.6273, "lng": 120.3014, "image": "https://i.imgur.com/example3.jpg"},
    {"name": "OK 超商 鮪魚飯糰", "price": 35, "lat": 24.1477, "lng": 120.6736, "image": "https://i.imgur.com/example4.jpg"},
    {"name": "7-11 日式炸雞便當", "price": 85, "lat": 25.034, "lng": 121.5644, "image": "https://i.imgur.com/example5.jpg"},
    {"name": "全家 起司蛋堡", "price": 42, "lat": 22.6255, "lng": 120.2995, "image": "https://i.imgur.com/example6.jpg"}
]

# ===============================
# 計算兩點之間距離（公里）
# ===============================
def haversine(lat1, lng1, lat2, lng2):
    R = 6371
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lng2 - lng1)
    a = math.sin(d_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

# ===============================
# /items API：支援距離排序與範圍過濾
# ===============================
@app.get("/items")
def get_items(
    lat: float = Query(None),
    lng: float = Query(None),
    radius: float = Query(1000)  # 公尺
):
    if lat is not None and lng is not None:
        nearby = []
        for item in EXPIRED_ITEMS:
            dist = haversine(lat, lng, item["lat"], item["lng"]) * 1000  # 公尺
            if dist <= radius:
                item_copy = item.copy()
                item_copy["distance"] = round(dist)
                nearby.append(item_copy)
        nearby.sort(key=lambda x: x["distance"])
        return {"items": nearby}
    return {"items": EXPIRED_ITEMS}

# ===============================
# LINE Webhook 處理程式
# ===============================
CHANNEL_ACCESS_TOKEN = os.getenv("DED64eRi0GLeout3sWtkebzadMdiAydomXvXcYW4sxQTRepbcVaK7tlyckXLJRF8Rm2+dVjTLGNUXFBK6IswVpCYqwvPio52blUsMmv+GZSfG87uUBV7dgty9H4/bCRKPbSZm19K7YyWkjHO5cbxtQdB04t89/1O/w1cDnyilFU=", "")
REPLY_ENDPOINT = "https://api.line.me/v2/bot/message/reply"

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

                # 篩選 1 公里內
                near_items = []
                for item in EXPIRED_ITEMS:
                    dist_km = haversine(user_lat, user_lng, item["lat"], item["lng"])
                    if dist_km <= 1:
                        near_items.append({
                            "name": item["name"],
                            "price": item["price"],
                            "distance": round(dist_km * 1000),
                            "image": item["image"]
                        })

                if not near_items:
                    reply = {"type": "text", "text": "🚫 1公里內查無即期商品"}
                else:
                    item = near_items[0]
                    reply = {
                        "type": "template",
                        "altText": "即期商品",
                        "template": {
                            "type": "buttons",
                            "thumbnailImageUrl": item["image"],
                            "title": item["name"],
                            "text": f"💰{item['price']} 元\n📍{item['distance']} 公尺內",
                            "actions": [
                                {"type": "message", "label": "查看更多", "text": "我要看更多"}
                            ]
                        }
                    }

                await send_reply(reply_token, [reply])

    return JSONResponse({"status": "ok"})

async def send_reply(token, messages):
    headers = {
        "Authorization": f"Bearer {CHANNEL_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    data = {"replyToken": token, "messages": messages}
    async with httpx.AsyncClient() as client:
        await client.post(REPLY_ENDPOINT, headers=headers, json=data)

    d_lambda = math.radians(lng2 - lng1)
    a = math.sin(d_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

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

                # 過濾距離 1 公里內的商品
                near_items = []
                for item in EXPIRED_ITEMS:
                    dist_km = haversine(user_lat, user_lng, item["lat"], item["lng"])
                    if dist_km <= 1:
                        near_items.append({
                            "name": item["name"],
                            "price": item["price"],
                            "distance": round(dist_km * 1000),  # 公尺
                            "image": item["image"]
                        })

                if not near_items:
                    reply = {"type": "text", "text": "🚫 1公里內查無即期商品"}
                else:
                    # 回傳第一個品項（可擴充成 carousel）
                    item = near_items[0]
                    reply = {
                        "type": "template",
                        "altText": "即期商品",
                        "template": {
                            "type": "buttons",
                            "thumbnailImageUrl": item["image"],
                            "title": item["name"],
                            "text": f"💰{item['price']} 元\n📍{item['distance']} 公尺內",
                            "actions": [
                                {"type": "message", "label": "查看更多", "text": "我要看更多"}
                            ]
                        }
                    }

                await send_reply(reply_token, [reply])

    return JSONResponse({"status": "ok"})

async def send_reply(token, messages):
    headers = {
        "Authorization": f"Bearer {CHANNEL_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    data = {"replyToken": token, "messages": messages}
    async with httpx.AsyncClient() as client:
        await client.post(REPLY_ENDPOINT, headers=headers, json=data)
