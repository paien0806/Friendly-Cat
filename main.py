from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import httpx
from math import radians, cos, sin, sqrt, atan2
from collections import defaultdict
import time

from data_cache import get_cached_data, fetch_data, start_refresh_task

# ========== LINE 設定區 ==========
CHANNEL_ACCESS_TOKEN = "DED64eRi0GLeout3sWtkebzadMdiAydomXvXcYW4sxQTRepbcVaK7tlyckXLJRF8Rm2+dVjTLGNUXFBK6IswVpCYqwvPio52blUsMmv+GZSfG87uUBV7dgty9H4/bCRKPbSZm19K7YyWkjHO5cbxtQdB04t89/1O/w1cDnyilFU="
CHANNEL_SECRET = "f6ad0906db1caa0a57bea1cf0f66d7f0"

# ========== FastAPI 啟動 ==========
app = FastAPI()

@app.on_event("startup")
async def on_startup():
    start_refresh_task()

# ========== 工具函式 ==========
def haversine(lat1, lng1, lat2, lng2):
    R = 6371
    dlat = radians(lat2 - lat1)
    dlng = radians(lng2 - lng1)
    a = sin(dlat / 2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c * 1000  # 回傳公尺

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

# ========== API ==========
@app.get("/items")
def get_items(lat: float = None, lng: float = None, radius: int = 1000):
    cache = get_cached_data()
    items = cache["items"]
    if lat is None or lng is None:
        return {"items": items}

    nearby = []
    for item in items:
        try:
            d = haversine(lat, lng, float(item["lat"]), float(item["lng"]))
            if d <= radius:
                item_copy = item.copy()
                item_copy["distance"] = int(d)
                nearby.append(item_copy)
        except:
            continue

    nearby.sort(key=lambda x: x["distance"])
    return {"items": nearby}

@app.get("/debug-cache")
def debug_cache():
    cache = get_cached_data()
    return {
        "status": "success",
        "count": len(cache["items"]),
        "updated": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(cache["updated"])),
        "items": cache["items"]
    }

@app.get("/refresh")
async def refresh_now():
    await fetch_data()
    return {"status": "ok", "message": "手動刷新成功"}

@app.post("/webhook")
async def webhook(req: Request):
    body = await req.json()
    events = body.get("events", [])

    for event in events:
        if event["type"] == "message" and event["message"]["type"] == "location":
            lat = event["message"]["latitude"]
            lng = event["message"]["longitude"]
            reply_token = event["replyToken"]

            cache = get_cached_data()
            items = cache["items"]

            nearby = []
            for item in items:
                try:
                    d = haversine(lat, lng, float(item["lat"]), float(item["lng"]))
                    if d <= 1000:
                        nearby.append({
                            "name": item["name"],
                            "price": item["price"],
                            "distance": int(d),
                            "image": item["image"],
                            "lat": item["lat"],
                            "lng": item["lng"]
                        })
                except:
                    continue

            nearby.sort(key=lambda x: x["distance"])

            if not nearby:
                await send_reply(reply_token, [{"type": "text", "text": "🚫 1公里內查無即期商品"}])
            else:
                brand_map = defaultdict(list)
                for f in nearby:
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

                all_messages = []
                for brand, group in brand_map.items():
                    bubbles = []
                    for item in group[:10]:
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
                                    {"type": "text", "text": f"💰{item['price']} 元", "size": "sm"},
                                    {"type": "text", "text": f"📍{item['distance']} 公尺", "size": "sm"}
                                ]
                            },
                            "footer": {
                                "type": "box",
                                "layout": "vertical",
                                "contents": [
                                    {
                                        "type": "button",
                                        "action": {
                                            "type": "uri",
                                            "label": "地圖導航",
                                            "uri": f"https://www.google.com/maps?q={item['lat']},{item['lng']}"
                                        }
                                    }
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
