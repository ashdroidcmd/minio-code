# MinIO File Upload Service

This service provides a simple API for uploading, retrieving, and deleting files from a **MinIO S3-compatible storage**.

---

## 🚀 Features
- Upload single files to specific buckets and types
- Upload multiple files in one request
- Retrieve uploaded files via direct URL
- Delete multiple files at once
- Configurable via `.env` file

---

## 📦 Installation

Clone the repository:
```bash
git clone <your-repo-url>
cd <your-repo-name>
```

Install dependencies:
```bash
yarn install
```

Create a `.env` file in the project root:
```env
ENDPOINT=s3.acemcbohol.dev
ACCESS_KEY=<ACCESS KEY>
SECRET_KEY=<SECRET KEY>
MINIO_SSL=true
MINIO_PORT=443
PORT=3002
```

Start the server:
```bash
yarn start:dev
```

---

## 🌐 API Endpoints

### 1. Upload Single File
**POST** `http://localhost:3002/files/upload/:bucket/:type`

**Parameters:**
- `:bucket` → Target S3 bucket name
- `:type` → File category (e.g., `avatar`, `documents`)

**Body:** `multipart/form-data` with a `file` field

---

### 2. Upload Multiple Files
**POST** `http://localhost:3002/files/upload-multiple/:bucket/:type`

**Parameters:**
- `:bucket` → Target S3 bucket name
- `:type` → File category

**Body:** `multipart/form-data` with multiple `files` fields

---

### 3. Get Files
**GET** `http://localhost:3002/files/:bucket/:type/:filename`

---

### 4. Delete Single File
**DELETE** `http://localhost:3002/files/delete/:bucket/:type/:filename`

---

### 4. Delete Multiple Files
**POST** `http://localhost:3002/files/delete-multiple`

**Raw Body (JSON):**
```json
{
  "bucket": "acebook",
  "files": [
    "avatar/2025-08-30-13-41-10-acebuilding.webp",
    "avatar/2025-08-30-14-00-20-example.webp"
  ]
}
```
---

## ⚙️ Configuration

Environment variables in `.env` file:

- **ENDPOINT** → MinIO/S3 endpoint
- **ACCESS_KEY** → MinIO access key
- **SECRET_KEY** → MinIO secret key
- **MINIO_SSL** → `true` if SSL is enabled, otherwise `false`
- **MINIO_PORT** → MinIO port (e.g., `443` for HTTPS)
- **PORT** → API service port
