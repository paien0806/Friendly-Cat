from fastapi import FastAPI
import httpx

app = FastAPI()

FAMILY_API_URL = "https://www.family.com.tw/Marketing/api/getWeekendProduct"

@app.get("/")
def root():
    return {"message": "🔍 查詢即期友善時光商品，請打開 /items"}

@app.get("/items")
def get_items():
    try:
        response = httpx.get(FAMILY_API_URL, timeout=10)
        response.raise_for_status()
        raw_items = response.json().get("List", [])

        items = []
        for item in raw_items:
            name = item.get("ProductName", "").strip()
            price = item.get("Price", "").strip()
            items.append({"name": name, "price": int(price)})

        return items
    except Exception as e:
        return {"error": "查詢失敗，請稍後再試", "details": str(e)}
