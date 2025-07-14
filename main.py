# 🔧 設定區（請只改這裡）
CHANNEL_ACCESS_TOKEN = "DED64eRi0GLeout3sWtkebzadMdiAydomXvXcYW4sxQTRepbcVaK7tlyckXLJRF8Rm2+dVjTLGNUXFBK6IswVpCYqwvPio52blUsMmv+GZSfG87uUBV7dgty9H4/bCRKPbSZm19K7YyWkjHO5cbxtQdB04t89/1O/w1cDnyilFU="
CHANNEL_SECRET = "f6ad0906db1caa0a57bea1cf0f66d7f0"
SPREADSHEET_ID = '12WyIQo-DBfqMaP-hv4Y6_QuhxSM6-EoqRkRqwdfmvSU

# ======================================
from fastapi import FastAPI, Request, Query
from fastapi.responses import JSONResponse
import httpx
import math
import os
import json
import gspread
from google.oauth2.service_account import Credentials
from collections import defaultdict

app = FastAPI()

# ======================================
def haversine(lat1, lng1, lat2, lng2):
    R = 6371
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lng2 - lng1)
    a = math.sin(d_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))  # 公里

def read_items_from_sheets():
    scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly']
    info = json.loads(os.environ['GOOGLE_SERVICE_ACCOUNT_JSON'])
    creds = Credentials.from_service_account_info(info, scopes=scopes)
    client = gspread.authorize(creds)
    sheet = client.open_by_key(SPREADSHEET_ID).sheet1
    return sheet.get_all_records()

# ======================================
@app.get("/items")
def get_items(lat: float = Query(None), lng: float = Query(None), radius: int = 1000):
    try:
        all_items = read_items_from_sheets()
    except Exception as e:
        return {"error": f"讀取 Google Sheets 失敗: {str(e)}"}

    if lat is None or lng is None:
        return {"items": all_items}

    result = []
    for item in all_items:
        try:
            item_lat = float(item["lat"])
            item_lng = float(item["lng"])
            dist = haversine(lat, lng, item_lat, item_lng) * 1000
            if dist <= radius:
                item["distance"] = round(dist)
                result.append(item)
        except:
            continue

    result.sort(key=lambda x: x["distance"])
    return {"items": result}

# ======================================
@app.get("/debug-items")
def debug_items():
    try:
        data = read_items_from_sheets()
        return {"status": "success", "count": len(data), "items": data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

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

            try:
                all_items = read_items_from_sheets()
            except Exception as e:
                await send_reply(reply_token, [{"type": "text", "text": "⚠️ 無法讀取商品資料，請稍後再試"}])
                return JSONResponse({"status": "error", "detail": str(e)})

            filtered = []
            for item in all_items:
                try:
                    item_lat = float(item["lat"])
                    item_lng = float(item["lng"])
                    d = haversine(lat, lng, item_lat, item_lng) * 1000
                    if d <= 1000:
                        filtered.append({
                            "name": item["name"],
                            "price": item["price"],
                            "distance": round(d),
                            "image": item["image"],
                            "lat": item_lat,
                            "lng": item_lng
                        })
                except:
                    continue

            filtered.sort(key=lambda x: x["distance"])

            if not filtered:
                await send_reply(reply_token, [{"type": "text", "text": "🚫 1公里內查無即期商品"}])
            else:
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

                all_messages = []
                for brand, items in brand_map.items():
                    bubbles = []
                    for item in items[:10]:
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
