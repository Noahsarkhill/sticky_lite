from fastapi import FastAPI
from db import *
from pydantic import BaseModel

app = FastAPI()


create_notes_table()


class NoteData(BaseModel):
    title: str
    content: str


@app.post("/notes")
def post_note(note: NoteData):
    clean_title = note.title.strip()
    clean_content = note.content.strip()

    if clean_title == "":
        return {"message": "Title cannot be empty"}
    if clean_content == "":
        return {"message": "Content cannot be empty"}

    new_note_id = save_note_db(clean_title, clean_content)

    return {
        "message": "Note created successfully",
        "note": {
            "id": new_note_id,
            "title": clean_title,
            "content": clean_content

        }
    }


@app.get("/notes")
def get_notes():
    rows = load_notes_db()

    notes = []

    for row in rows:
        note = {
            "id": row[0],
            "title": row[1],
            "content": row[2]
                }
                
        notes.append(note)

    return notes

@app.get("/notes/{note_id}")
def get_one(note_id: int):
    row = load_note_db(note_id)

    if row is None:
        return {"message": "Note not found"}

    note = {
        "id": row[0],
        "title": row[1],
        "content": row[2]
    }

    return note

@app.delete("/notes/{note_id}")
def delete_one(note_id: int):
    row = delete_note_db(note_id)

    if row is None:
        return {"message": "Note not found"}
    
    deleted_note = {
        "id": row[0],
        "title": row[1]
    }

    return {"message": f"You have deleted {deleted_note}"}


@app.put("/notes/{note_id}")
def edit_note(note_id: int, note: NoteData):
    title = note.title.strip()
    content = note.content.strip()

    if title == "":
        return {"message": "Title cannot be empty"}
    if content == "":
        return {"message": "Content cannot be empty"}

    updated_row = update_note_db(note_id, title, content)

    if updated_row is None:
        return {"message": "Note not found"}

    updated_note = {
        "id": updated_row[0],
        "title": updated_row[1],
        "content": updated_row[2]
    }

    return {
        "message": "Note updated successfully", 
        "note": updated_note
    }