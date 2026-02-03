from fastapi import FastAPI
import uvicorn

app = FastAPI(title="SatVach API")

@app.get("/")
def read_root():
    return {"message": "Welcome to SatVach Hyperlocal API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
