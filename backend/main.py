from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from fastapi.staticfiles import StaticFiles
from routes.users import router as user_router
from routes.shop import router as shop_router
from routes.products import router as products_router
from routes.collections import router as collection_router
from routes.styles import router as styles_router
from routes.promociones import router as promocion_router
from routes.pedidos import router as pedidos_router
from routes.alimentos import router as alimentos_router
from routes.colecciones_alimentos import router as colecciones_alimentos_router
from routes.pedidos_alimentos import router as pedidos_alimentos_router
from routes.combos import router as combos_router
from routes.alpormayor import router as alpormayor_router
from routes.tuinfo import router as tuinfo_router
from routes.notificaciones import router as noti_router
from routes.suscripciones import router as suscripciones_router
from fastapi.staticfiles import StaticFiles

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
app.include_router(collection_router)
app.include_router(styles_router)
app.include_router(promocion_router)
app.include_router(pedidos_router)
app.include_router(alimentos_router)
app.include_router(colecciones_alimentos_router)
app.include_router(pedidos_alimentos_router)
app.include_router(combos_router)
app.include_router(alpormayor_router)
app.include_router(tuinfo_router)
app.include_router(noti_router)
app.include_router(suscripciones_router)

app.mount("/img", StaticFiles(directory="img"), name="img")
app.mount("/alimentos", StaticFiles(directory="alimentos"), name="alimentos")
app.mount("/fotoperfil", StaticFiles(directory="fotoperfil"), name="fotoperfil")

@app.get("/heald")
def servidor():
    
    return{
        "status": "success",
        "data": "ok"
    }