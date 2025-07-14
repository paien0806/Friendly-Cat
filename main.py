from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional

app = FastAPI()

# CORS 設定，允許跨來源請求（前端使用時用得到）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 商品資料
items_data = [
    {"name": "7-11 焗烤雞腿飯", "price": 79, "area": "taipei", "image": "https://i.imgur.com/example1.jpg"},
    {"name": "全家 照燒雞三明治", "price": 49, "area": "taipei", "image": "https://i.imgur.com/example2.jpg"},
    {"name": "全聯 草莓牛奶", "price": 32, "area": "kaohsiung", "image": "https://i.imgur.com/example3.jpg"},
    {"name": "OK 超商 鮪魚飯糰", "price": 35, "area": "taichung", "image": "https://i.imgur.com/example4.jpg"},
    {"name": "7-11 日式炸雞便當", "price": 85, "area": "taipei", "image": "https://i.imgur.com/example5.jpg"},
    {"name": "全家 起司蛋堡", "price": 42, "area": "kaohsiung", "image": "https://i.imgur.com/example6.jpg"}
]

@app.get("/items")
def get_items(
    area: Optional[str] = Query(None),
    keyword: Optional[str] = Query(None)
):
    results = items_data

    # 過濾地區
    if area:
        results = [item for item in results if item["area"] == area.lower()]

    # 關鍵字查詢（比對名稱）
    if keyword:
        results = [item for item in results if keyword in item["name"]]

    return results
