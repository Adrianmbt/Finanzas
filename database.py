from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# El archivo de la base de datos se creará automáticamente en la raíz
SQLALCHEMY_DATABASE_URL = "sqlite:///./finanzas.db"

# connect_args={"check_same_thread": False} es obligatorio solo para SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependencia para obtener la sesión de la base de datos en cada endpoint
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()