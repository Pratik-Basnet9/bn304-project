import os

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

MANAGEMENT_EMAIL = os.environ.get("MANAGEMENT_EMAIL")
MANAGEMENT_PASSWORD = os.environ.get("MANAGEMENT_PASSWORD")


@app.route("/")
def home():
    return jsonify({
        "message": "ThinkiX backend is running"
    })


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if email == MANAGEMENT_EMAIL and password == MANAGEMENT_PASSWORD:
        return jsonify({
            "success": True,
            "message": "Login successful"
        })

    return jsonify({
        "success": False,
        "message": "Invalid email or password"
    }), 401


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=False
    )