from fastapi import FastAPI, Query
from typing import List, Optional
from math import radians, cos, sin, asin, sqrt

app = FastAPI()

# 範例資料（可替換為動態擷取）
DATA = [
    {"name": "7-11 焗烤雞腿飯", "price": 79, "lat": 25.033, "lng": 121.5654, "image": "https://i.imgur.com/example1.jpg"},
    {"name": "全家 照燒雞三明治", "price": 49, "lat": 25.0325, "lng": 121.566, "image": "https://i.imgur.com/example2.jpg"},
    {"name": "全聯 草莓牛奶", "price": 32, "lat": 22.6273, "lng": 120.3014, "image": "https://i.imgur.com/example3.jpg"},
    {"name": "OK 超商 鮪魚飯糰", "price": 35, "lat": 24.1477, "lng": 120.6736, "image": "https://i.imgur.com/example4.jpg"},
    {"name": "7-11 日式炸雞便當", "price": 85, "lat": 25.034, "lng": 121.5644, "image": "https://i.imgur.com/example5.jpg"},
    {"name": "全家 起司蛋堡", "price": 42, "lat": 22.6255, "lng": 120.2995, "image": "https://i.imgur.com/example6.jpg"}
]

# 計算兩座標距離（單位：公里）
def haversine(lat1, lng1, lat2, lng2):
    R = 6371  # 地球半徑 km
    dlat = radians(lat2 - lat1)
    dlng = radians(lng2 - lng1)
    a = sin(dlat / 2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng / 2)**2
    c = 2 * asin(sqrt(a))
    return R * c

@app.get("/items")
def get_items(
    lat: float = Query(..., description="使用者目前緯度"),
    lng: float = Query(..., description="使用者目前經度"),
    max_distance: Optional[float] = Query(None, description="最大距離範圍，單位公里，例如 0.5")
):
    results = []
    for item in DATA:
        dist = haversine(lat, lng, item["lat"], item["lng"])
        if (max_distance is None) or (dist <= max_distance):
            new_item = item.copy()
            new_item["distance_km"] = round(dist, 3)
            results.append(new_item)

    # 距離由近到遠排序
    sorted_items = sorted(results, key=lambda x: x["distance_km"])
    return {"items": sorted_items}
