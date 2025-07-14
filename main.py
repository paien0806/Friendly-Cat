# main.py
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import requests
import math

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 📦 模擬 Friendly-Cat 資料抓取
# 可更換為真實 API 擷取邏輯
def fetch_friendlycat_items():
    return [
        {"name": "7-11 焗烤雞腿飯", "price": 79, "lat": 25.0330, "lng": 121.5654, "image": "https://i.imgur.com/example1.jpg"},
        {"name": "全家 照燒雞三明治", "price": 49, "lat": 25.0325, "lng": 121.5660, "image": "https://i.imgur.com/example2.jpg"},
        {"name": "全聯 草莓牛奶", "price": 32, "lat": 22.6273, "lng": 120.3014, "image": "https://i.imgur.com/example3.jpg"},
        {"name": "OK 超商 鮪魚飯糰", "price": 35, "lat": 24.1477, "lng": 120.6736, "image": "https://i.imgur.com/example4.jpg"},
        {"name": "7-11 日式炸雞便當", "price": 85, "lat": 25.0340, "lng": 121.5644, "image": "https://i.imgur.com/example5.jpg"},
        {"name": "全家 起司蛋堡", "price": 42, "lat": 22.6255, "lng": 120.2995, "image": "https://i.imgur.com/example6.jpg"},
    ]

# 🧭 計算兩點間的距離（Haversine 公式）
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # 地球半徑 (公里)
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

# 🚀 /items API：接收使用者座標，回傳依距離排序的品項
@app.get("/items")
def get_items(lat: Optional[float] = Query(None), lng: Optional[float] = Query(None)):
    items = fetch_friendlycat_items()

    if lat is not None and lng is not None:
        for item in items:
            item["distance_km"] = round(haversine(lat, lng, item["lat"], item["lng"]), 2)
        items.sort(key=lambda x: x["distance_km"])

    return {"items": items}
