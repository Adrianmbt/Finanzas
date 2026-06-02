from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import engine, get_db

# Crear las tablas en SQLite si no existen
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Finanzas Personales API")

# Configurar CORS para permitir conexiones desde cualquier dispositivo (crucial para Expo Go)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ENDPOINTS DE CATEGORÍAS ---
@app.post("/categorias/", response_model=schemas.CategoriaResponse)
def crear_categoria(categoria: schemas.CategoriaCreate, db: Session = Depends(get_db)):
    db_categoria = db.query(models.Categoria).filter(models.Categoria.nombre == categoria.nombre).first()
    if db_categoria:
        raise HTTPException(status_code=400, detail="La categoría ya existe")
    
    nueva_cat = models.Categoria(**categoria.model_dump())
    db.add(nueva_cat)
    db.commit()
    db.refresh(nueva_cat)
    return nueva_cat

@app.get("/categorias/", response_model=List[schemas.CategoriaResponse])
def listar_categorias(db: Session = Depends(get_db)):
    return db.query(models.Categoria).all()


# --- ENDPOINTS DE TRANSACCIONES ---
@app.post("/transacciones/", response_model=schemas.TransaccionResponse)
def registrar_transaccion(transaccion: schemas.TransaccionCreate, db: Session = Depends(get_db)):
    # Verificar que la categoría exista
    categoria = db.query(models.Categoria).filter(models.Categoria.id == transaccion.categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    nueva_trans = models.Transaccion(**transaccion.model_dump())
    db.add(nueva_trans)
    db.commit()
    db.refresh(nueva_trans)
    return nueva_trans

@app.get("/transacciones/", response_model=List[schemas.TransaccionResponse])
def listar_transacciones(db: Session = Depends(get_db)):
    return db.query(models.Transaccion).order_by(models.Transaccion.fecha.desc()).all()