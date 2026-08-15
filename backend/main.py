from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from fastapi.staticfiles import StaticFiles
from routes.users import router as user_router
from routes.shop import router as shop_router
from routes.products import router as products_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router)
app.include_router(shop_router)
app.include_router(products_router)

@app.get("/heald")
def servidor():
    
    return{
        "status": "success",
        "data": "ok"
    }