from fastapi import APIRouter, Request
import httpx
import math
import os

router = APIRouter()

LINE_TOKEN = os.environ.get("DED64eRi0GLeout3sWtkebzadMdiAydomXvXcYW4sxQTRepbcVaK7tlyckXLJRF8Rm2+dVjTLGNUXFBK6IswVpCYqwvPio52blUsMmv+GZSfG87uUBV7dgty9H4/bCRKPbSZm19K7YyWkjHO5cbxtQdB04t89/1O/w1cDnyilFU=")
HEADERS = {
    "Authorization": f"Bearer {LINE_TOKEN}",
    "Content-Type": "application/json"
}

# 計算距離（使用 Haversine 公式）
def calculate_distance(lat1, lng1, lat2, lng2):
    R = 6371000  # 地球半徑（公尺）
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c)

@router.post("/webhook")
async def line_webhook(request: Request):
    body = await request.json()
    events = body.get("events", [])

    for event in events:
        if event["type"] == "message" and event["message"]["type"] == "location":
            lat = event["message"]["latitude"]
            lng = event["message"]["longitude"]
            reply_token = event["replyToken"]

            # 呼叫 /items API 拿商品資料
            async with httpx.AsyncClient() as client:
                r = await client.get("https://friendly-cat-api.onrender.com/items")
                items = r.json()["items"]

            # 過濾 2 公里內，依 name 分類
            nearby = {}
            for item in items:
                d = calculate_distance(lat, lng, item["lat"], item["lng"])
                if d <= 2000:
                    key = item["name"]
                    if key not in nearby:
                        nearby[key] = {
                            "price": item["price"],
                            "stores": []
                        }
                    # 模擬店名（也可改為 item["store"]）
                    store_name = f"店鋪({round(item['lat'], 3)},{round(item['lng'], 3)})"
                    nearby[key]["stores"].append((store_name, d))

            if not nearby:
                reply = "🚫 附近 2 公里內查無即期商品"
            else:
                reply = "📍 2 公里內即期商品：\n"
                for name, info in nearby.items():
                    reply += f"\n🍱 {name}（共 {len(info['stores'])} 間）${info['price']}\n"
                    for store, d in sorted(info["stores"], key=lambda x: x[1]):
                        reply += f"・{store}（距離 {d} 公尺）\n"

            # 回傳給 LINE 使用者
            payload = {
                "replyToken": reply_token,
                "messages": [{"type": "text", "text": reply}]
            }
            await httpx.post("https://api.line.me/v2/bot/message/reply", headers=HEADERS, json=payload)

    return {"status": "ok"}
