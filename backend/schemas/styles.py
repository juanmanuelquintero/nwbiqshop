from pydantic import BaseModel


class EstilosUpdate(BaseModel):
    id_usuario: int
    color_principal: str | None = None
    color_secundario: str | None = None
    title_color: str | None = None
    text_color: str | None = None
    color_carrito: str | None = None
    color_botones: str | None = None