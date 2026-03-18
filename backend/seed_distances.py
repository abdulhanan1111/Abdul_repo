import sys
import os
sys.path.append(os.getcwd())
from app.database import SessionLocal, engine
from app import models

# Create the table if it doesn't exist
models.Base.metadata.create_all(bind=engine)

def seed_distances():
    db = SessionLocal()
    try:
        # Clear existing distances to avoid duplicates
        db.query(models.Distance).delete()
        
        # Dictionary to store distances (key: sorted tuple of cities) to ensure no duplicates
        # and easy bidirectional generation.
        dist_map = {}

        def add_dist(c1, c2, d):
            key = tuple(sorted((c1, c2)))
            dist_map[key] = d

        # Major Routes (Approximate real world driving distances in km)
        # Cities: Mumbai, Delhi, Bengaluru, Chennai, Kolkata, Hyderabad, Ahmedabad, Pune, Surat, Jaipur, 
        # Lucknow, Kanpur, Nagpur, Indore, Bhopal, Visakhapatnam, Patna, Vadodara, Ghaziabad, Ludhiana

        # Mumbai
        add_dist("Mumbai", "Delhi", 1415); add_dist("Mumbai", "Bengaluru", 984); add_dist("Mumbai", "Chennai", 1338)
        add_dist("Mumbai", "Kolkata", 1945); add_dist("Mumbai", "Hyderabad", 710); add_dist("Mumbai", "Ahmedabad", 525)
        add_dist("Mumbai", "Pune", 148); add_dist("Mumbai", "Surat", 279); add_dist("Mumbai", "Jaipur", 1148)
        add_dist("Mumbai", "Lucknow", 1375); add_dist("Mumbai", "Kanpur", 1295); add_dist("Mumbai", "Nagpur", 815)
        add_dist("Mumbai", "Indore", 585); add_dist("Mumbai", "Bhopal", 775); add_dist("Mumbai", "Visakhapatnam", 1345)
        add_dist("Mumbai", "Patna", 1750); add_dist("Mumbai", "Vadodara", 412); add_dist("Mumbai", "Ghaziabad", 1440)
        add_dist("Mumbai", "Ludhiana", 1650)

        # Delhi
        add_dist("Delhi", "Bengaluru", 2165); add_dist("Delhi", "Chennai", 2200); add_dist("Delhi", "Kolkata", 1530)
        add_dist("Delhi", "Hyderabad", 1575); add_dist("Delhi", "Ahmedabad", 935); add_dist("Delhi", "Pune", 1450)
        add_dist("Delhi", "Surat", 1160); add_dist("Delhi", "Jaipur", 280); add_dist("Delhi", "Lucknow", 550)
        add_dist("Delhi", "Kanpur", 495); add_dist("Delhi", "Nagpur", 1085); add_dist("Delhi", "Indore", 835)
        add_dist("Delhi", "Bhopal", 785); add_dist("Delhi", "Visakhapatnam", 1785); add_dist("Delhi", "Patna", 1085)
        add_dist("Delhi", "Vadodara", 1010); add_dist("Delhi", "Ghaziabad", 30); add_dist("Delhi", "Ludhiana", 310)

        # Bengaluru
        add_dist("Bengaluru", "Chennai", 345); add_dist("Bengaluru", "Kolkata", 1870); add_dist("Bengaluru", "Hyderabad", 570)
        add_dist("Bengaluru", "Ahmedabad", 1495); add_dist("Bengaluru", "Pune", 840); add_dist("Bengaluru", "Surat", 1260)
        add_dist("Bengaluru", "Jaipur", 2030); add_dist("Bengaluru", "Lucknow", 1860); add_dist("Bengaluru", "Kanpur", 1780)
        add_dist("Bengaluru", "Nagpur", 1090); add_dist("Bengaluru", "Indore", 1320); add_dist("Bengaluru", "Bhopal", 1440)
        add_dist("Bengaluru", "Visakhapatnam", 1000); add_dist("Bengaluru", "Patna", 2060); add_dist("Bengaluru", "Vadodara", 1380)
        add_dist("Bengaluru", "Ghaziabad", 2170); add_dist("Bengaluru", "Ludhiana", 2450)

        # Chennai
        add_dist("Chennai", "Kolkata", 1660); add_dist("Chennai", "Hyderabad", 625); add_dist("Chennai", "Ahmedabad", 1840)
        add_dist("Chennai", "Pune", 1190); add_dist("Chennai", "Surat", 1600); add_dist("Chennai", "Jaipur", 2100)
        add_dist("Chennai", "Lucknow", 1950); add_dist("Chennai", "Kanpur", 1870); add_dist("Chennai", "Nagpur", 1110)
        add_dist("Chennai", "Indore", 1460); add_dist("Chennai", "Bhopal", 1470); add_dist("Chennai", "Visakhapatnam", 800)
        add_dist("Chennai", "Patna", 1900); add_dist("Chennai", "Vadodara", 1720); add_dist("Chennai", "Ghaziabad", 2200)
        add_dist("Chennai", "Ludhiana", 2500)

        # Kolkata
        add_dist("Kolkata", "Hyderabad", 1490); add_dist("Kolkata", "Ahmedabad", 2070); add_dist("Kolkata", "Pune", 1750)
        add_dist("Kolkata", "Surat", 1930); add_dist("Kolkata", "Jaipur", 1520); add_dist("Kolkata", "Lucknow", 980)
        add_dist("Kolkata", "Kanpur", 1010); add_dist("Kolkata", "Nagpur", 1120); add_dist("Kolkata", "Indore", 1540)
        add_dist("Kolkata", "Bhopal", 1360); add_dist("Kolkata", "Visakhapatnam", 880); add_dist("Kolkata", "Patna", 580)
        add_dist("Kolkata", "Vadodara", 1950); add_dist("Kolkata", "Ghaziabad", 1500); add_dist("Kolkata", "Ludhiana", 1770)

        # Hyderabad
        add_dist("Hyderabad", "Ahmedabad", 1200); add_dist("Hyderabad", "Pune", 560); add_dist("Hyderabad", "Surat", 970)
        add_dist("Hyderabad", "Jaipur", 1480); add_dist("Hyderabad", "Lucknow", 1280); add_dist("Hyderabad", "Kanpur", 1200)
        add_dist("Hyderabad", "Nagpur", 500); add_dist("Hyderabad", "Indore", 850); add_dist("Hyderabad", "Bhopal", 850)
        add_dist("Hyderabad", "Visakhapatnam", 620); add_dist("Hyderabad", "Patna", 1450); add_dist("Hyderabad", "Vadodara", 1100)
        add_dist("Hyderabad", "Ghaziabad", 1550); add_dist("Hyderabad", "Ludhiana", 1850)

        # Ahmedabad
        add_dist("Ahmedabad", "Pune", 660); add_dist("Ahmedabad", "Surat", 265); add_dist("Ahmedabad", "Jaipur", 675)
        add_dist("Ahmedabad", "Lucknow", 1150); add_dist("Ahmedabad", "Kanpur", 1070); add_dist("Ahmedabad", "Nagpur", 870)
        add_dist("Ahmedabad", "Indore", 390); add_dist("Ahmedabad", "Bhopal", 580); add_dist("Ahmedabad", "Visakhapatnam", 1600)
        add_dist("Ahmedabad", "Patna", 1570); add_dist("Ahmedabad", "Vadodara", 110); add_dist("Ahmedabad", "Ghaziabad", 920)
        add_dist("Ahmedabad", "Ludhiana", 1180)

        # Pune
        add_dist("Pune", "Surat", 415); add_dist("Pune", "Jaipur", 1270); add_dist("Pune", "Lucknow", 1450)
        add_dist("Pune", "Kanpur", 1370); add_dist("Pune", "Nagpur", 720); add_dist("Pune", "Indore", 590)
        add_dist("Pune", "Bhopal", 780); add_dist("Pune", "Visakhapatnam", 1200); add_dist("Pune", "Patna", 1650)
        add_dist("Pune", "Vadodara", 540); add_dist("Pune", "Ghaziabad", 1460); add_dist("Pune", "Ludhiana", 1700)

        # Surat
        add_dist("Surat", "Jaipur", 930); add_dist("Surat", "Lucknow", 1300); add_dist("Surat", "Kanpur", 1220)
        add_dist("Surat", "Nagpur", 760); add_dist("Surat", "Indore", 450); add_dist("Surat", "Bhopal", 640)
        add_dist("Surat", "Visakhapatnam", 1500); add_dist("Surat", "Patna", 1700); add_dist("Surat", "Vadodara", 150)
        add_dist("Surat", "Ghaziabad", 1170); add_dist("Surat", "Ludhiana", 1400)

        # Jaipur
        add_dist("Jaipur", "Lucknow", 570); add_dist("Jaipur", "Kanpur", 500); add_dist("Jaipur", "Nagpur", 950)
        add_dist("Jaipur", "Indore", 600); add_dist("Jaipur", "Bhopal", 600); add_dist("Jaipur", "Visakhapatnam", 1650)
        add_dist("Jaipur", "Patna", 1050); add_dist("Jaipur", "Vadodara", 570); add_dist("Jaipur", "Ghaziabad", 290)
        add_dist("Jaipur", "Ludhiana", 500)

        # Lucknow
        add_dist("Lucknow", "Kanpur", 90); add_dist("Lucknow", "Nagpur", 750); add_dist("Lucknow", "Indore", 800)
        add_dist("Lucknow", "Bhopal", 600); add_dist("Lucknow", "Visakhapatnam", 1350); add_dist("Lucknow", "Patna", 530)
        add_dist("Lucknow", "Vadodara", 1050); add_dist("Lucknow", "Ghaziabad", 480); add_dist("Lucknow", "Ludhiana", 780)

        # Kanpur
        add_dist("Kanpur", "Nagpur", 770); add_dist("Kanpur", "Indore", 700); add_dist("Kanpur", "Bhopal", 530)
        add_dist("Kanpur", "Visakhapatnam", 1300); add_dist("Kanpur", "Patna", 570); add_dist("Kanpur", "Vadodara", 950)
        add_dist("Kanpur", "Ghaziabad", 420); add_dist("Kanpur", "Ludhiana", 720)

        # Nagpur
        add_dist("Nagpur", "Indore", 450); add_dist("Nagpur", "Bhopal", 350); add_dist("Nagpur", "Visakhapatnam", 800)
        add_dist("Nagpur", "Patna", 980); add_dist("Nagpur", "Vadodara", 750); add_dist("Nagpur", "Ghaziabad", 1070)
        add_dist("Nagpur", "Ludhiana", 1380)

        # Indore
        add_dist("Indore", "Bhopal", 195); add_dist("Indore", "Visakhapatnam", 1250); add_dist("Indore", "Patna", 1150)
        add_dist("Indore", "Vadodara", 340); add_dist("Indore", "Ghaziabad", 820); add_dist("Indore", "Ludhiana", 1100)

        # Bhopal
        add_dist("Bhopal", "Visakhapatnam", 1100); add_dist("Bhopal", "Patna", 1000); add_dist("Bhopal", "Vadodara", 530)
        add_dist("Bhopal", "Ghaziabad", 760); add_dist("Bhopal", "Ludhiana", 1050)

        # Visakhapatnam
        add_dist("Visakhapatnam", "Patna", 950); add_dist("Visakhapatnam", "Vadodara", 1450); add_dist("Visakhapatnam", "Ghaziabad", 1750)
        add_dist("Visakhapatnam", "Ludhiana", 2050)

        # Patna
        add_dist("Patna", "Vadodara", 1450); add_dist("Patna", "Ghaziabad", 1000); add_dist("Patna", "Ludhiana", 1300)

        # Vadodara
        add_dist("Vadodara", "Ghaziabad", 990); add_dist("Vadodara", "Ludhiana", 1250)

        # Ghaziabad
        add_dist("Ghaziabad", "Ludhiana", 300)

        print(f"Seeding {len(dist_map) * 2} distance records...")

        for (c1, c2), dist in dist_map.items():
            # Add both directions
            record = models.Distance(
                origin_city=c1,
                destination_city=c2,
                distance_km=dist
            )
            db.add(record)
            record_rev = models.Distance(
                origin_city=c2,
                destination_city=c1,
                distance_km=dist
            )
            db.add(record_rev)
        
        db.commit()
        print("Distances seeded successfully!")

    except Exception as e:
        print(f"Error seeding distances: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_distances()