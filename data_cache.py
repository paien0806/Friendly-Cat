import asyncio
import httpx
import time

# 記憶體快取區
cache_data = []
last_updated = 0
cache_ttl = 300  # 300 秒 = 5 分鐘

# Friendly-Cat 提供的資料 API（可依需求更換）
FRIENDLY_API_URL = "https://raw.githubusercontent.com/Alan-Cheng/Friendly-Cat/main/docs/items.json"

# 🚀 定時更新任務（啟動時呼叫）
def start_refresh_task():
    loop = asyncio.get_event_loop()
    loop.create_task(refresh_forever())

# ⏲️ 每隔固定時間重新抓資料
async def refresh_forever():
    while True:
        await fetch_data()
        await asyncio.sleep(cache_ttl)

# 🔁 手動抓一次資料（可用於 /refresh）
async def fetch_data():
    global cache_data, last_updated
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(FRIENDLY_API_URL)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    cache_data = data
                    last_updated = int(time.time())
                    print(f"✅ Friendly API 資料更新成功，共 {len(data)} 筆")
                else:
                    print("⚠️ 資料格式不是 list")
            else:
                print(f"❌ API 回應錯誤：{response.status_code}")
    except Exception as e:
        print(f"🚨 Friendly API 讀取失敗：{e}")

# 📦 取得目前快取資料
def get_cached_data():
    return {
        "updated": last_updated,
        "items": cache_data
    }
