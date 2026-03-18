import sqlite3
import os

db_path = 'trip_management.db'
if not os.path.exists(db_path):
    print(f"Error: {db_path} not found")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("--- Ramesh Info ---")
cursor.execute("SELECT dm.name, ds.current_city, ds.availability_status FROM driver_master dm JOIN driver_status ds ON dm.id = ds.driver_id WHERE dm.name = 'Ramesh'")
r = cursor.fetchone()
if r:
    print(f"Name: {repr(r[0])}")
    print(f"City: {repr(r[1])}")
    print(f"Status: {repr(r[2])}")
else:
    print("Ramesh not found")

print("\n--- Surat Vehicle Info ---")
cursor.execute("SELECT vm.number, vs.current_city, vs.availability_status FROM vehicle_master vm JOIN vehicle_status vs ON vm.id = vs.vehicle_id WHERE vs.current_city LIKE '%Surat%'")
v = cursor.fetchone()
if v:
    print(f"Number: {repr(v[0])}")
    print(f"City: {repr(v[1])}")
    print(f"Status: {repr(v[2])}")
else:
    print("Surat vehicle not found")

conn.close()
