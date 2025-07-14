from fastapi import FastAPI, Query
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 允許跨網域（前端會用到）
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

@app.get("/")
def index():
    return {"message": "請使用 /items 進行查詢，可加 area, keyword 參數"}

@app.get("/items")
def get_items(
    area: Optional[str] = Query(None),
    keyword: Optional[str] = Query(None)
):
    results = items_data

    if area:
        results = [item for item in results if item["area"] == area.lower()]
    if keyword:
        results = [item for item in results if keyword in item["name"]]

    return results
