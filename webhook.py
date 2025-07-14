# webhook.py
import math
import httpx
from fastapi import APIRouter, Request, Header
from fastapi.responses import PlainTextResponse

LINE_CHANNEL_ACCESS_TOKEN = "DED64eRi0GLeout3sWtkebzadMdiAydomXvXcYW4sxQTRepbcVaK7tlyckXLJRF8Rm2+dVjTLGNUXFBK6IswVpCYqwvPio52blUsMmv+GZSfG87uUBV7dgty9H4/bCRKPbSZm19K7YyWkjHO5cbxtQdB04t89/1O/w1cDnyilFU="

router = APIRouter()

def haversine(lat1, lng1, lat2, lng2):
    R = 6371000  # 地球半徑（公尺）
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)

    a = math.sin(dphi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c  # 單位：公尺

@router.post("/webhook")
async def webhook_handler(request: Request, x_line_signature: str = Header(None)):
    body = await request.json()

    # 只處理位置訊息
    for event in body.get("events", []):
        if event["type"] == "message" and event["message"]["type"] == "location":
            lat = event["message"]["latitude"]
            lng = event["message"]["longitude"]
            reply_token = event["replyToken"]

            # 抓商品資料
            async with httpx.AsyncClient() as client:
                res = await client.get("https://friendly-cat-api.onrender.com/items")
                items = res.json()["items"]

            # 計算距離 + 篩選半徑內的商品
            nearby = []
            for item in items:
                d = haversine(lat, lng, item["lat"], item["lng"])
                if d <= 2000:
                    item["distance"] = int(d)
                    item["store"] = f"分店 @ {round(item['lat'], 4)}, {round(item['lng'], 4)}"
                    nearby.append(item)

            if not nearby:
                reply_text = "😣 2 公里內查無即期商品"
            else:
                # 分類統整
                grouped = {}
                for item in nearby:
                    key = item["name"]
                    if key not in grouped:
                        grouped[key] = {"price": item["price"], "items": []}
                    grouped[key]["items"].append((item["store"], item["distance"]))

                reply_text = "📍 附近 2 公里內即期品項如下：\n\n"
                for name, info in grouped.items():
                    reply_text += f"🍱 {name}（共 {len(info['items'])} 間）${info['price']}\n"
                    for store, dist in sorted(info["items"], key=lambda x: x[1]):
                        reply_text += f"・{store}（距離 {dist} 公尺）\n"
                    reply_text += "\n"

            # 回傳給 LINE
            await reply_to_line(reply_token, reply_text.strip())

    return PlainTextResponse("OK")

async def reply_to_line(token, message):
    headers = {
        "Authorization": f"Bearer {LINE_CHANNEL_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    data = {
        "replyToken": token,
        "messages": [{
            "type": "text",
            "text": message
        }]
    }
    async with httpx.AsyncClient() as client:
        await client.post("https://api.line.me/v2/bot/message/reply", headers=headers, json=data)
