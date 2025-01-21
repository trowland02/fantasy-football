from fastapi import FastAPI
from app.routers import fantasy

tags_metadata = [
    {
        "name": "RSM Fantasy Football",
        "description": "Create your team and win the competititon!",
    },
]

app = FastAPI(
    openapi_tags=tags_metadata,
    title="RSM Fantasy Football",
    description="Create your team and win the competititon!", 
    version="0.0.1",
)

app.include_router(
    fantasy.router,
)

print("Fantasy Football Started")