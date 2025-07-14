from fastapi import FastAPI
from friendlycat import get_items

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello Friendly Cat"}

@app.get("/items")
def get_all_items():
    return get_items()
