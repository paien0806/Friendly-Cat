from fastapi import APIRouter, Query
from typing import List
import gspread
from google.oauth2.service_account import Credentials
from math import radians, cos, sin, sqrt, atan2

router = APIRouter()

# Google Sheets 設定
SPREADSHEET_ID = '12WyIQo-DBfqMaP-hv4Y6_QuhxSM6-EoqRkRqwdfmvSU'
SERVICE_ACCOUNT_FILE = 'service_account.json'

def read_items_from_sheets():
    scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly']
    creds = Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=scopes)
    client = gspread.authorize(creds)
    sheet = client.open_by_key(SPREADSHEET_ID).sheet1
    return sheet.get_all_records()

def calculate_distance(lat1, lng1, lat2, lng2):
    R = 6371  # 地球半徑，公里
    dlat = radians(lat2 - lat1)
    dlng = radians(lng2 - lng1)
    a = sin(dlat / 2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c * 1000  # 回傳公尺

@router.get("/items")
def get_items(lat: float = Query(...), lng: float = Query(...)):
    all_items = read_items_from_sheets()
    nearby_items = []

    for item in all_items:
        try:
            item_lat = float(item['lat'])
            item_lng = float(item['lng'])
            dist = calculate_distance(lat, lng, item_lat, item_lng)
            if dist <= 1000:
                item['distance'] = int(dist)
                nearby_items.append(item)
        except Exception as e:
            print("資料處理錯誤:", e)
            continue

    nearby_items.sort(key=lambda x: x['distance'])
    return {"items": nearby_items}

