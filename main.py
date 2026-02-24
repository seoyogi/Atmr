from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import ctypes

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cライブラリ読み込み
clib = ctypes.CDLL("./libspeedcalc.so")
clib.calculate_speed.restype = ctypes.c_float

current_speed = 0.0

@app.get("/speed")
def get_speed(input: int):
    global current_speed
    current_speed = clib.calculate_speed(current_speed, input)
    return {"speed": current_speed}
