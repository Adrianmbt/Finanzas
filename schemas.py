from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# Esquemas para Categorías
class CategoriaBase(BaseModel):
    nombre: str
    tipo: str  # 'ingreso' o 'egreso'
    icono: Optional[str] = None

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaResponse(CategoriaBase):
    id: int
    class Config:
        from_attributes = True

# Esquemas para Transacciones
class TransaccionBase(BaseModel):
    monto: float
    descripcion: Optional[str] = None
    categoria_id: int

class TransaccionCreate(TransaccionBase):
    pass

class TransaccionResponse(TransaccionBase):
    id: int
    fecha: datetime
    categoria: CategoriaResponse # Incluye los datos de la categoría al responder
    class Config:
        from_attributes = True