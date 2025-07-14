# 🔧 設定區（請只改這裡）
CHANNEL_ACCESS_TOKEN = "DED64eRi0GLeout3sWtkebzadMdiAydomXvXcYW4sxQTRepbcVaK7tlyckXLJRF8Rm2+dVjTLGNUXFBK6IswVpCYqwvPio52blUsMmv+GZSfG87uUBV7dgty9H4/bCRKPbSZm19K7YyWkjHO5cbxtQdB04t89/1O/w1cDnyilFU="
CHANNEL_SECRET = "f6ad0906db1caa0a57bea1cf0f66d7f0"

# ======================================
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import httpx
import math
from collections import defaultdict

app = FastAPI()

# ✅ 模擬資料來源
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

# ======================================
@app.get("/items")
def get_items(lat: float = None, lng: float = None, radius: int = 1000):
    if lat is None or lng is None:
        return {"items": EXPIRED_ITEMS}

    result = []
    for item in EXPIRED_ITEMS:
        dist = haversine(lat, lng, item["lat"], item["lng"]) * 1000
        if dist <= radius:
            new_item = item.copy()
            new_item["distance"] = round(dist)
            result.append(new_item)

    result.sort(key=lambda x: x["distance"])
    return {"items": result}

# ======================================
@app.post("/webhook")
async def webhook(req: Request):
    body = await req.json()
    events = body.get("events", [])

    for event in events:
        if event["type"] == "message" and event["message"]["type"] == "location":
            lat = event["message"]["latitude"]
            lng = event["message"]["longitude"]
            reply_token = event["replyToken"]

            # 找出 1 公里內的商品
            filtered = []
            for item in EXPIRED_ITEMS:
                d = haversine(lat, lng, item["lat"], item["lng"]) * 1000
                if d <= 1000:
                    filtered.append({
                        "name": item["name"],
                        "price": item["price"],
                        "distance": round(d),
                        "image": item["image"]
                    })
            filtered.sort(key=lambda x: x["distance"])

            if not filtered:
                await send_reply(reply_token, [{"type": "text", "text": "🚫 1公里內查無即期商品"}])
            else:
                # 分類（依據超商名稱）
                brand_map = defaultdict(list)
                for f in filtered:
                    if "7-11" in f["name"]:
                        brand_map["7-11"].append(f)
                    elif "全家" in f["name"]:
                        brand_map["全家"].append(f)
                    elif "全聯" in f["name"]:
                        brand_map["全聯"].append(f)
                    elif "OK" in f["name"]:
                        brand_map["OK"].append(f)
                    else:
                        brand_map["其他"].append(f)

                # 每品牌產出一則 Flex Carousel
                all_messages = []
                for brand, items in brand_map.items():
                    bubbles = []
                    for item in items[:10]:  # 最多10筆
                        bubbles.append({
                            "type": "bubble",
                            "hero": {
                                "type": "image",
                                "url": item["image"],
                                "size": "full",
                                "aspectRatio": "20:13",
                                "aspectMode": "cover"
                            },
                            "body": {
                                "type": "box",
                                "layout": "vertical",
                                "contents": [
                                    {"type": "text", "text": item["name"], "weight": "bold", "size": "md"},
                                    {"type": "text", "text": f"💰{item['price']} 元", "size": "sm", "color": "#555555"},
                                    {"type": "text", "text": f"📍{item['distance']} 公尺", "size": "sm", "color": "#aaaaaa"}
                                ]
                            }
                        })

                    all_messages.append({
                        "type": "flex",
                        "altText": f"{brand} 即期商品",
                        "contents": {
                            "type": "carousel",
                            "contents": bubbles
                        }
                    })

                await send_reply(reply_token, all_messages)

    return JSONResponse({"status": "ok"})

# ======================================
async def send_reply(reply_token, messages):
    headers = {
        "Authorization": f"Bearer {CHANNEL_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "replyToken": reply_token,
        "messages": messages
    }
    async with httpx.AsyncClient() as client:
        await client.post("https://api.line.me/v2/bot/message/reply", headers=headers, json=payload)
