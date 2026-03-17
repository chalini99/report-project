import os

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "medical-insight-ai-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# File upload
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")

# AI model
MODEL_NAME = "t5-small"
