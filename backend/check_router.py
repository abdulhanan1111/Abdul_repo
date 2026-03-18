import sys
import os
sys.path.append(os.getcwd())
try:
    from app.routers import companies
    print("Import successful!")
    print(f"Router has {len(companies.router.routes)} routes")
    for route in companies.router.routes:
        print(f"Route: {route.path} [{route.methods}]")
except Exception as e:
    print(f"Import failed: {e}")
    import traceback
    traceback.print_exc()
