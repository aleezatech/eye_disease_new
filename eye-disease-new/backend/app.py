from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from PIL import Image
import numpy as np
import tensorflow as tf
import os
import re
import mysql.connector
import time
import traceback

# =============================
# 🔹 App Init
# =============================
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
bcrypt = Bcrypt(app)

# =============================
# 🔹 MySQL Config
# =============================
def get_db():
    try:
        return mysql.connector.connect(
            host="localhost",
            user="root",
            password="aleeza@5",
            database="eye_disease_app",
            charset='utf8mb4',
            collation='utf8mb4_general_ci'
        )
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        raise

# =============================
# 🔹 Upload Config
# =============================
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}
MAX_IMAGE_SIZE_MB = 5

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# =============================
# 🔹 Model Config
# =============================
print("=" * 60)
print("🔄 Loading AI Model...")
print(f"📊 TensorFlow Version: {tf.__version__}")

CLASSES = ['Diabetic_Retinopathy', 'Glaucoma', 'Cataract', 'Myopia']
model = None
serving_fn = None

try:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    MODEL_PATH = os.path.join(BASE_DIR, "model", "saved_model_export")
    
    print(f"📂 Loading from: {MODEL_PATH}")
    model = tf.saved_model.load(MODEL_PATH)
    serving_fn = model.signatures['serving_default']
    
    print("✅ Model loaded successfully")
    print(f"🎯 Classes: {CLASSES}")
except Exception as e:
    print(f"❌ Model load failed: {e}")

print("=" * 60)

# =============================
# 🔹 Helpers
# =============================
def valid_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def preprocess_image(filepath):
    img = Image.open(filepath).convert("RGB")
    img = img.resize((224, 224))
    img_array = np.array(img, dtype=np.float32) / 255.0
    img_array = (img_array - 0.5) * 2.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

# =============================
# 🔹 Routes
# =============================
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Eye Disease Prediction API",
        "status": "active",
        "tensorflow": tf.__version__,
        "model_loaded": model is not None,
        "classes": CLASSES
    })

@app.route("/test-db", methods=["GET"])
def test_db():
    try:
        db = get_db()
        cur = db.cursor()
        cur.execute("SELECT VERSION()")
        version = cur.fetchone()
        cur.close()
        db.close()
        return jsonify({
            "message": "Database connected!",
            "mysql_version": version[0]
        })
    except Exception as e:
        return jsonify({
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500

# =============================
# 🔹 FR-1: User Authentication
# =============================
@app.route("/register", methods=["POST"])
def register():
    try:
        print("\n" + "="*60)
        print("📥 Registration Request Received")
        
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        
        print(f"Name: {name}, Email: {email}")
        
        if not all([name, email, password]):
            return jsonify({"error": "All fields required"}), 400

        if not valid_email(email):
            return jsonify({"error": "Invalid email format"}), 400

        if len(password) < 6:
            return jsonify({"error": "Password must be 6+ characters"}), 400

        hashed = bcrypt.generate_password_hash(password).decode("utf-8")
        
        db = get_db()
        cur = db.cursor()
        
        cur.execute(
            "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
            (name, email, hashed)
        )
        
        db.commit()
        user_id = cur.lastrowid
        
        cur.close()
        db.close()
        
        print(f"✅ User registered successfully! ID: {user_id}")
        print("="*60 + "\n")
        
        return jsonify({
            "message": "Registration successful",
            "user_id": user_id
        }), 201
        
    except mysql.connector.IntegrityError:
        return jsonify({"error": "Email already exists"}), 400
        
    except Exception as e:
        print(f"❌ Registration error: {e}")
        return jsonify({
            "error": "Registration failed",
            "details": str(e)
        }), 500

@app.route("/login", methods=["POST"])
def login():
    try:
        print("\n" + "="*60)
        print("📥 Login Request Received")
        
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        email = data.get("email")
        password = data.get("password")
        
        print(f"Email: {email}")
        
        if not email or not password:
            return jsonify({"error": "Email and password required"}), 400

        db = get_db()
        cur = db.cursor(dictionary=True)
        cur.execute("SELECT * FROM users WHERE email=%s", (email,))
        user = cur.fetchone()
        cur.close()
        db.close()

        if user and bcrypt.check_password_hash(user["password"], password):
            print(f"✅ Login successful for: {email}")
            print("="*60 + "\n")
            
            return jsonify({
                "message": "Login successful",
                "user": {
                    "id": user["id"],
                    "name": user["name"],
                    "email": user["email"]
                }
            })

        print(f"❌ Invalid credentials for: {email}")
        return jsonify({"error": "Invalid credentials"}), 401
        
    except Exception as e:
        print(f"❌ Login error: {e}")
        return jsonify({
            "error": "Login failed",
            "details": str(e)
        }), 500

# =============================
# 🔹 FR-2: Image Upload
# =============================
@app.route("/upload-retina", methods=["POST"])
def upload_retina():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Only JPG/PNG allowed"}), 400

    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)

    if size > MAX_IMAGE_SIZE_MB * 1024 * 1024:
        return jsonify({"error": f"Max {MAX_IMAGE_SIZE_MB}MB"}), 400

    try:
        img = Image.open(file)
        img.verify()

        filename = f"{int(time.time())}_{file.filename}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)

        file.seek(0)
        file.save(filepath)

        return jsonify({
            "message": "Upload successful",
            "filename": filename
        })
    except:
        return jsonify({"error": "Invalid image"}), 400

# =============================
# 🔹 FR-3: Disease Prediction + FR-5: Save to History
# =============================
@app.route("/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500

    data = request.get_json()
    filename = data.get("filename")
    user_id = data.get("user_id")

    if not filename:
        return jsonify({"error": "Filename required"}), 400
    
    if not user_id:
        return jsonify({"error": "User ID required for history tracking"}), 400

    filepath = os.path.join(UPLOAD_FOLDER, filename)

    if not os.path.exists(filepath):
        return jsonify({"error": "Image not found"}), 404

    try:
        print("\n" + "="*60)
        print("🔮 Prediction Request")
        print(f"User ID: {user_id}, File: {filename}")
        
        img_array = preprocess_image(filepath)

        if serving_fn is not None:
            input_tensor = tf.constant(img_array, dtype=tf.float32)
            predictions = serving_fn(input_tensor)
            output_key = list(predictions.keys())[0]
            predictions = predictions[output_key].numpy()
        else:
            predictions = model.predict(img_array, verbose=0)

        confidence = float(np.max(predictions))
        predicted_idx = int(np.argmax(predictions))
        disease = CLASSES[predicted_idx]

        all_preds = {
            CLASSES[i]: round(float(predictions[0][i]) * 100, 2)
            for i in range(len(CLASSES))
        }

        print(f"✅ Prediction: {disease} ({confidence*100:.2f}%)")
        
        history_id = None
        try:
            db = get_db()
            cur = db.cursor()
            cur.execute(
                "INSERT INTO prediction_history (user_id, disease_predicted, confidence_score, image_filename) VALUES (%s, %s, %s, %s)",
                (user_id, disease, round(confidence * 100, 2), filename)
            )
            db.commit()
            history_id = cur.lastrowid
            cur.close()
            db.close()
            print(f"✅ Saved to history (ID: {history_id})")
        except Exception as e:
            print(f"⚠️  Failed to save history: {e}")
        
        print("="*60 + "\n")

        return jsonify({
            "success": True,
            "disease": disease,
            "confidence": round(confidence * 100, 2),
            "all_predictions": all_preds,
            "history_id": history_id
        })
        
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        print(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": "Prediction failed",
            "details": str(e)
        }), 500

# =============================
# 🔹 FR-4: Disease Info & Prevention Tips
# =============================
@app.route("/disease-info/<disease_name>", methods=["GET"])
def get_disease_info(disease_name):
    try:
        print(f"\n📚 Fetching info for: {disease_name}")
        
        db = get_db()
        cur = db.cursor(dictionary=True)
        
        cur.execute(
            "SELECT * FROM disease_info WHERE disease_name = %s",
            (disease_name,)
        )
        
        disease_data = cur.fetchone()
        cur.close()
        db.close()
        
        if not disease_data:
            return jsonify({"error": "Disease information not found"}), 404
        
        prevention_tips = disease_data['prevention_tips'].split('\n')
        
        print(f"✅ Info retrieved for: {disease_name}")
        
        return jsonify({
            "success": True,
            "disease_name": disease_data['disease_name'],
            "description": disease_data['description'],
            "symptoms": disease_data['symptoms'],
            "prevention_tips": prevention_tips,
            "treatment_advice": disease_data['treatment_advice'],
            "severity_level": disease_data['severity_level']
        })
        
    except Exception as e:
        print(f"❌ Error fetching disease info: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to fetch disease information",
            "details": str(e)
        }), 500

# =============================
# 🔹 FR-5: User History Management
# =============================
@app.route("/prediction-history/<int:user_id>", methods=["GET"])
def get_prediction_history(user_id):
    try:
        print(f"\n📜 Fetching history for user ID: {user_id}")
        
        db = get_db()
        cur = db.cursor(dictionary=True)
        
        cur.execute(
            "SELECT id, disease_predicted, confidence_score, image_filename, prediction_date FROM prediction_history WHERE user_id = %s ORDER BY prediction_date DESC",
            (user_id,)
        )
        
        history = cur.fetchall()
        
        for record in history:
            if record['prediction_date']:
                record['prediction_date'] = record['prediction_date'].strftime('%Y-%m-%d %H:%M:%S')
        
        cur.close()
        db.close()
        
        print(f"✅ Found {len(history)} records")
        
        return jsonify({
            "success": True,
            "history": history,
            "count": len(history)
        })
        
    except Exception as e:
        print(f"❌ Error fetching history: {e}")
        print(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": "Failed to fetch history",
            "details": str(e)
        }), 500

@app.route("/prediction-history/<int:user_id>/<int:record_id>", methods=["DELETE"])
def delete_history_record(user_id, record_id):
    try:
        print(f"\n🗑️  Deleting record {record_id} for user {user_id}")
        
        db = get_db()
        cur = db.cursor()
        
        cur.execute(
            "DELETE FROM prediction_history WHERE id = %s AND user_id = %s",
            (record_id, user_id)
        )
        
        affected_rows = cur.rowcount
        db.commit()
        cur.close()
        db.close()
        
        if affected_rows > 0:
            print(f"✅ Record deleted successfully")
            return jsonify({
                "success": True,
                "message": "Record deleted successfully"
            })
        else:
            return jsonify({
                "success": False,
                "error": "Record not found or unauthorized"
            }), 404
        
    except Exception as e:
        print(f"❌ Error deleting record: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to delete record",
            "details": str(e)
        }), 500

@app.route("/prediction-history/clear/<int:user_id>", methods=["DELETE"])
def clear_all_history(user_id):
    try:
        print(f"\n🗑️  Clearing all history for user {user_id}")
        
        db = get_db()
        cur = db.cursor()
        
        cur.execute(
            "DELETE FROM prediction_history WHERE user_id = %s",
            (user_id,)
        )
        
        affected_rows = cur.rowcount
        db.commit()
        cur.close()
        db.close()
        
        print(f"✅ Deleted {affected_rows} records")
        
        return jsonify({
            "success": True,
            "message": f"Cleared {affected_rows} records",
            "deleted_count": affected_rows
        })
        
    except Exception as e:
        print(f"❌ Error clearing history: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to clear history",
            "details": str(e)
        }), 500

@app.route("/prediction-statistics/<int:user_id>", methods=["GET"])
def get_user_statistics(user_id):
    try:
        db = get_db()
        cur = db.cursor(dictionary=True)
        
        cur.execute(
            "SELECT COUNT(*) as total FROM prediction_history WHERE user_id = %s",
            (user_id,)
        )
        total = cur.fetchone()['total']
        
        cur.execute(
            "SELECT disease_predicted, COUNT(*) as count, AVG(confidence_score) as avg_confidence FROM prediction_history WHERE user_id = %s GROUP BY disease_predicted ORDER BY count DESC",
            (user_id,)
        )
        disease_stats = cur.fetchall()
        
        cur.execute(
            "SELECT COUNT(*) as recent_count FROM prediction_history WHERE user_id = %s AND prediction_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)",
            (user_id,)
        )
        recent = cur.fetchone()['recent_count']
        
        cur.close()
        db.close()
        
        return jsonify({
            "success": True,
            "statistics": {
                "total_predictions": total,
                "recent_predictions": recent,
                "disease_distribution": disease_stats
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Failed to fetch statistics",
            "details": str(e)
        }), 500
       # =============================
# 🔹 FR-6: Feedback System (COMPLETELY FIXED)
# =============================

@app.route("/feedback", methods=["POST"])
def submit_feedback():
    """
    FR-6: Submit user feedback
    """
    try:
        print("\n" + "="*60)
        print("📝 Feedback Submission Request")
        
        data = request.get_json()
        
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        
        user_id = data.get("user_id")
        rating = data.get("rating")
        feedback_text = data.get("feedback_text")
        category = data.get("category", "General Feedback")
        
        print(f"User ID: {user_id}, Rating: {rating}, Category: {category}")
        
        if not user_id:
            return jsonify({"success": False, "error": "User ID required"}), 400
        
        if not rating:
            return jsonify({"success": False, "error": "Rating required"}), 400
        
        try:
            rating = int(rating)
            if rating < 1 or rating > 5:
                return jsonify({"success": False, "error": "Rating must be between 1 and 5"}), 400
        except ValueError:
            return jsonify({"success": False, "error": "Invalid rating value"}), 400
        
        if not feedback_text or not feedback_text.strip():
            return jsonify({"success": False, "error": "Feedback text cannot be empty"}), 400
        
        if len(feedback_text) > 1000:
            return jsonify({"success": False, "error": "Feedback text too long (max 1000 characters)"}), 400
        
        db = get_db()
        cur = db.cursor()
        
        cur.execute(
            """
            INSERT INTO feedback 
            (user_id, rating, feedback_text, category) 
            VALUES (%s, %s, %s, %s)
            """,
            (user_id, rating, feedback_text.strip(), category)
        )
        
        db.commit()
        feedback_id = cur.lastrowid
        cur.close()
        db.close()
        
        print(f"✅ Feedback submitted successfully! ID: {feedback_id}")
        print("="*60 + "\n")
        
        return jsonify({
            "success": True,
            "message": "Feedback submitted successfully! Thank you for your input.",
            "feedback_id": feedback_id
        }), 201
        
    except Exception as e:
        print(f"❌ Feedback submission error: {e}")
        print(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": "Failed to submit feedback",
            "details": str(e)
        }), 500

@app.route("/feedback/all", methods=["GET"])
def get_all_feedback():
    """
    FR-6: Get all feedback (Admin view)
    """
    try:
        db = get_db()
        cur = db.cursor(dictionary=True)
        
        status_filter = request.args.get('status')
        rating_filter = request.args.get('rating')
        
        query = """
            SELECT 
                f.id,
                f.user_id,
                u.name as user_name,
                u.email as user_email,
                f.rating,
                f.feedback_text,
                f.category,
                f.status,
                f.admin_response,
                DATE_FORMAT(f.created_at, '%Y-%m-%d %H:%i:%s') as created_at
            FROM feedback f
            JOIN users u ON f.user_id = u.id
        """
        
        conditions = []
        params = []
        
        if status_filter:
            conditions.append("f.status = %s")
            params.append(status_filter)
        
        if rating_filter:
            conditions.append("f.rating = %s")
            params.append(int(rating_filter))
        
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        
        query += " ORDER BY f.created_at DESC LIMIT 100"
        
        cur.execute(query, params)
        feedback_list = cur.fetchall()
        cur.close()
        db.close()
        
        return jsonify({
            "success": True,
            "feedback": feedback_list,
            "count": len(feedback_list)
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Failed to fetch feedback",
            "details": str(e)
        }), 500

@app.route("/feedback/stats/<int:user_id>", methods=["GET"])
def get_feedback_stats(user_id):
    """
    FR-6: Get user's feedback statistics
    """
    try:
        db = get_db()
        cur = db.cursor(dictionary=True)
        
        cur.execute(
            "SELECT COUNT(*) as total FROM feedback WHERE user_id = %s",
            (user_id,)
        )
        total = cur.fetchone()['total']
        
        cur.execute(
            "SELECT AVG(rating) as avg_rating FROM feedback WHERE user_id = %s",
            (user_id,)
        )
        avg_rating_result = cur.fetchone()
        avg_rating = round(avg_rating_result['avg_rating'], 1) if avg_rating_result['avg_rating'] else 0
        
        cur.execute(
            """
            SELECT 
                status, 
                COUNT(*) as count
            FROM feedback 
            WHERE user_id = %s 
            GROUP BY status
            """,
            (user_id,)
        )
        status_dist = cur.fetchall()
        
        cur.close()
        db.close()
        
        return jsonify({
            "success": True,
            "statistics": {
                "total_feedback": total,
                "average_rating": avg_rating,
                "status_distribution": status_dist
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Failed to fetch statistics",
            "details": str(e)
        }), 500

@app.route("/feedback/user/<int:user_id>", methods=["GET"])
def get_user_feedback(user_id):
    """
    FR-6: Get all feedback submitted by a user
    """
    try:
        print(f"\n📜 Fetching feedback for user ID: {user_id}")
        
        db = get_db()
        cur = db.cursor(dictionary=True)
        
        # ✅ FIX: Use %% to escape % in DATE_FORMAT
        cur.execute(
            """
            SELECT 
                id, 
                rating, 
                feedback_text, 
                category,
                status,
                admin_response,
                created_at,
                updated_at
            FROM feedback 
            WHERE user_id = %s 
            ORDER BY created_at DESC
            """,
            (user_id,)
        )
        
        feedback_list = cur.fetchall()
        
        # Format dates in Python instead of SQL
        for fb in feedback_list:
            if fb['created_at']:
                fb['created_at'] = fb['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            if fb['updated_at']:
                fb['updated_at'] = fb['updated_at'].strftime('%Y-%m-%d %H:%M:%S')
        
        cur.close()
        db.close()
        
        print(f"✅ Found {len(feedback_list)} feedback records")
        
        return jsonify({
            "success": True,
            "feedback": feedback_list,
            "count": len(feedback_list)
        })
        
    except Exception as e:
        print(f"❌ Error fetching feedback: {e}")
        print(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": "Failed to fetch feedback",
            "details": str(e)
        }), 500

@app.route("/feedback/<int:feedback_id>/respond", methods=["PUT"])
def respond_to_feedback(feedback_id):
    """
    FR-6: Admin response to feedback
    """
    try:
        data = request.get_json()
        admin_response = data.get("admin_response")
        new_status = data.get("status", "Reviewed")
        
        if not admin_response:
            return jsonify({"success": False, "error": "Admin response required"}), 400
        
        db = get_db()
        cur = db.cursor()
        
        cur.execute(
            """
            UPDATE feedback 
            SET admin_response = %s, status = %s 
            WHERE id = %s
            """,
            (admin_response, new_status, feedback_id)
        )
        
        db.commit()
        affected_rows = cur.rowcount
        cur.close()
        db.close()
        
        if affected_rows > 0:
            return jsonify({
                "success": True,
                "message": "Response added successfully"
            })
        else:
            return jsonify({
                "success": False,
                "error": "Feedback not found"
            }), 404
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Failed to add response",
            "details": str(e)
        }), 500
# =============================
# 🔹 FR-7: Admin Dashboard
# =============================

@app.route("/admin/login", methods=["POST"])
def admin_login():
    """
    FR-7: Admin login
    """
    try:
        print("\n" + "="*60)
        print("🔐 Admin Login Request")
        
        data = request.get_json()
        
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        
        username = data.get("username")
        password = data.get("password")
        
        print(f"Username: {username}")
        
        if not username or not password:
            return jsonify({"success": False, "error": "Username and password required"}), 400

        db = get_db()
        cur = db.cursor(dictionary=True)
        cur.execute("SELECT * FROM admins WHERE username=%s", (username,))
        admin = cur.fetchone()
        
        if admin and bcrypt.check_password_hash(admin["password"], password):
            # Update last login
            cur.execute(
                "UPDATE admins SET last_login = NOW() WHERE id = %s",
                (admin["id"],)
            )
            db.commit()
            cur.close()
            db.close()
            
            print(f"✅ Admin login successful: {username}")
            print("="*60 + "\n")
            
            return jsonify({
                "success": True,
                "message": "Login successful",
                "admin": {
                    "id": admin["id"],
                    "username": admin["username"],
                    "full_name": admin["full_name"],
                    "email": admin["email"],
                    "role": admin["role"]
                }
            })

        print(f"❌ Invalid admin credentials: {username}")
        cur.close()
        db.close()
        return jsonify({"success": False, "error": "Invalid credentials"}), 401
        
    except Exception as e:
        print(f"❌ Admin login error: {e}")
        return jsonify({
            "success": False,
            "error": "Login failed",
            "details": str(e)
        }), 500

@app.route("/admin/dashboard/stats", methods=["GET"])
def get_admin_dashboard_stats():
    """
    FR-7: Get dashboard statistics
    """
    try:
        db = get_db()
        cur = db.cursor(dictionary=True)
        
        # Total users
        cur.execute("SELECT COUNT(*) as total_users FROM users")
        total_users = cur.fetchone()['total_users']
        
        # Total predictions
        cur.execute("SELECT COUNT(*) as total_predictions FROM prediction_history")
        total_predictions = cur.fetchone()['total_predictions']
        
        # Total feedback
        cur.execute("SELECT COUNT(*) as total_feedback FROM feedback")
        total_feedback = cur.fetchone()['total_feedback']
        
        # Pending feedback
        cur.execute("SELECT COUNT(*) as pending_feedback FROM feedback WHERE status = 'Pending'")
        pending_feedback = cur.fetchone()['pending_feedback']
        
        # New users (last 7 days)
        cur.execute(
            "SELECT COUNT(*) as new_users FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
        )
        new_users = cur.fetchone()['new_users']
        
        # Recent predictions (last 7 days)
        cur.execute(
            "SELECT COUNT(*) as recent_predictions FROM prediction_history WHERE prediction_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
        )
        recent_predictions = cur.fetchone()['recent_predictions']
        
        # Disease distribution
        cur.execute(
            """
            SELECT 
                disease_predicted, 
                COUNT(*) as count,
                ROUND(AVG(confidence_score), 2) as avg_confidence
            FROM prediction_history 
            GROUP BY disease_predicted
            ORDER BY count DESC
            """
        )
        disease_distribution = cur.fetchall()
        
        # Average feedback rating
        cur.execute("SELECT ROUND(AVG(rating), 2) as avg_rating FROM feedback")
        avg_rating_result = cur.fetchone()
        avg_rating = avg_rating_result['avg_rating'] if avg_rating_result['avg_rating'] else 0
        
        cur.close()
        db.close()
        
        return jsonify({
            "success": True,
            "stats": {
                "total_users": total_users,
                "total_predictions": total_predictions,
                "total_feedback": total_feedback,
                "pending_feedback": pending_feedback,
                "new_users": new_users,
                "recent_predictions": recent_predictions,
                "disease_distribution": disease_distribution,
                "avg_rating": float(avg_rating)
            }
        })
        
    except Exception as e:
        print(f"❌ Error fetching dashboard stats: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to fetch statistics",
            "details": str(e)
        }), 500

@app.route("/admin/users", methods=["GET"])
def get_all_users():
    """
    FR-7: Get all users with activity
    """
    try:
        db = get_db()
        cur = db.cursor(dictionary=True)
        
        cur.execute(
            """
            SELECT 
                u.id,
                u.name,
                u.email,
                u.created_at,
                COUNT(DISTINCT ph.id) as total_predictions,
                COUNT(DISTINCT f.id) as total_feedback,
                MAX(ph.prediction_date) as last_prediction
            FROM users u
            LEFT JOIN prediction_history ph ON u.id = ph.user_id
            LEFT JOIN feedback f ON u.id = f.user_id
            GROUP BY u.id, u.name, u.email, u.created_at
            ORDER BY u.created_at DESC
            LIMIT 100
            """
        )
        
        users = cur.fetchall()
        
        # Format dates
        for user in users:
            if user['created_at']:
                user['created_at'] = user['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            if user['last_prediction']:
                user['last_prediction'] = user['last_prediction'].strftime('%Y-%m-%d %H:%M:%S')
        
        cur.close()
        db.close()
        
        return jsonify({
            "success": True,
            "users": users,
            "count": len(users)
        })
        
    except Exception as e:
        print(f"❌ Error fetching users: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to fetch users",
            "details": str(e)
        }), 500

@app.route("/admin/predictions/recent", methods=["GET"])
def get_recent_predictions():
    """
    FR-7: Get recent predictions across all users
    """
    try:
        limit = request.args.get('limit', 20)
        
        db = get_db()
        cur = db.cursor(dictionary=True)
        
        cur.execute(
            """
            SELECT 
                ph.id,
                ph.disease_predicted,
                ph.confidence_score,
                ph.image_filename,
                ph.prediction_date,
                u.name as user_name,
                u.email as user_email
            FROM prediction_history ph
            JOIN users u ON ph.user_id = u.id
            ORDER BY ph.prediction_date DESC
            LIMIT %s
            """,
            (limit,)
        )
        
        predictions = cur.fetchall()
        
        # Format dates
        for pred in predictions:
            if pred['prediction_date']:
                pred['prediction_date'] = pred['prediction_date'].strftime('%Y-%m-%d %H:%M:%S')
        
        cur.close()
        db.close()
        
        return jsonify({
            "success": True,
            "predictions": predictions,
            "count": len(predictions)
        })
        
    except Exception as e:
        print(f"❌ Error fetching recent predictions: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to fetch predictions",
            "details": str(e)
        }), 500

@app.route("/admin/feedback/pending", methods=["GET"])
def get_pending_feedback():
    """
    FR-7: Get pending feedback for admin review
    """
    try:
        db = get_db()
        cur = db.cursor(dictionary=True)
        
        cur.execute(
            """
            SELECT 
                f.id,
                f.rating,
                f.feedback_text,
                f.category,
                f.status,
                f.created_at,
                u.name as user_name,
                u.email as user_email
            FROM feedback f
            JOIN users u ON f.user_id = u.id
            WHERE f.status = 'Pending'
            ORDER BY f.created_at DESC
            """
        )
        
        feedback_list = cur.fetchall()
        
        # Format dates
        for fb in feedback_list:
            if fb['created_at']:
                fb['created_at'] = fb['created_at'].strftime('%Y-%m-%d %H:%M:%S')
        
        cur.close()
        db.close()
        
        return jsonify({
            "success": True,
            "feedback": feedback_list,
            "count": len(feedback_list)
        })
        
    except Exception as e:
        print(f"❌ Error fetching pending feedback: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to fetch feedback",
            "details": str(e)
        }), 500

@app.route("/admin/feedback/<int:feedback_id>/update", methods=["PUT"])
def update_feedback_status(feedback_id):
    """
    FR-7: Update feedback status and add admin response
    """
    try:
        data = request.get_json()
        status = data.get("status")
        admin_response = data.get("admin_response")
        
        if not status:
            return jsonify({"success": False, "error": "Status required"}), 400
        
        db = get_db()
        cur = db.cursor()
        
        if admin_response:
            cur.execute(
                "UPDATE feedback SET status = %s, admin_response = %s WHERE id = %s",
                (status, admin_response, feedback_id)
            )
        else:
            cur.execute(
                "UPDATE feedback SET status = %s WHERE id = %s",
                (status, feedback_id)
            )
        
        db.commit()
        affected_rows = cur.rowcount
        cur.close()
        db.close()
        
        if affected_rows > 0:
            return jsonify({
                "success": True,
                "message": "Feedback updated successfully"
            })
        else:
            return jsonify({
                "success": False,
                "error": "Feedback not found"
            }), 404
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Failed to update feedback",
            "details": str(e)
        }), 500
# =============================
# 🔹 Run App
# =============================
if __name__ == "__main__":
    print("\n🚀 Starting server on http://localhost:5000")
    print(f"📱 Mobile access: http://192.168.27.193:5000")
    print("⏹  Press CTRL+C to stop\n")
    app.run(host="0.0.0.0", port=5000, debug=True)