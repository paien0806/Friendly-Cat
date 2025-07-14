from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse
import uvicorn
#from app import friendlycat
import friendlycat
from math import radians, sin, cos, sqrt, atan2
app = FastAPI()

# 計算兩點距離（公尺）
def haversine(lat1, lon1, lat2, lon2):
    R = 6371000  # 地球半徑（公尺）
    phi1 = radians(lat1)
    phi2 = radians(lat2)
    d_phi = radians(lat2 - lat1)
    d_lambda = radians(lon2 - lon1)
    a = sin(d_phi/2)**2 + cos(phi1)*cos(phi2)*sin(d_lambda/2)**2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))

@app.get("/query")
def query_items(lat: float = Query(...), lng: float = Query(...), radius: int = Query(500)):
    items = friendlycat.get_items()
    result = {}

    for item in items:
        shop = item.get("shop")
        try:
            lat2 = float(shop["lat"])
            lng2 = float(shop["lng"])
        except:
            continue
        distance = haversine(lat, lng, lat2, lng2)
        if distance > radius:
            continue

        name = item["name"]
        price = item.get("price", "未知")
        if name not in result:
            result[name] = {
                "price": price,
                "total": 0,
                "stores": []
            }
        result[name]["total"] += 1
        result[name]["stores"].append({
            "store": shop["name"],
            "distance": int(distance),
            "qty": 1
        })

    return JSONResponse(content=result)
