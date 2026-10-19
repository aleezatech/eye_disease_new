from flask_bcrypt import Bcrypt
import mysql.connector

bcrypt = Bcrypt()

# Hash the password
password = "123456"
hashed = bcrypt.generate_password_hash(password).decode("utf-8")

print(f"Password: {password}")
print(f"Hashed: {hashed}")

# Admin data
admins = [
    ('aleeza', hashed, 'Aleeza', 'aleeza986@gmail.com', 'super_admin'),
    ('aneela', hashed, 'Aneela', 'aneela@eyecare.com', 'super_admin'),
]

# Insert into database
try:
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="aleeza@5",
        database="eye_disease_app"
    )
    
    cur = db.cursor()
    
    # Delete existing admins if any
    cur.execute("DELETE FROM admins WHERE username IN ('aleeza', 'aneela')")
    
    # Insert both admins
    for admin_data in admins:
        cur.execute(
            """
            INSERT INTO admins (username, password, full_name, email, role) 
            VALUES (%s, %s, %s, %s, %s)
            """,
            admin_data
        )
        print(f"✅ Admin '{admin_data[0]}' created successfully!")
    
    db.commit()
    
    # Verify
    cur.execute("SELECT id, username, full_name, email FROM admins WHERE username IN ('aleeza', 'aneela')")
    result = cur.fetchall()
    print("\n--- Admins Created ---")
    for row in result:
        print(f"ID: {row[0]}, Username: {row[1]}, Name: {row[2]}, Email: {row[3]}")
    
    cur.close()
    db.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
