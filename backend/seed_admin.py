from app.database import SessionLocal, engine
from app import models, auth_crud, schemas

# Ensure tables are created
models.Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    admin = auth_crud.get_admin_by_username(db, "admin")
    if not admin:
        print("Creating admin user...")
        auth_crud.create_admin(db, schemas.AdminCreate(username="admin", password="password123"))
        print("Admin user created successfully.")
    else:
        print("Admin user already exists.")
finally:
    db.close()
