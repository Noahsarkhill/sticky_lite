import sqlite3

DB_NAME = "sticky_lite.db"

def create_connection():
    conn = None

    try:
        conn = sqlite3.connect(DB_NAME)

    except sqlite3.Error as e:
        print(e)

    return conn


def create_notes_table():
    conn = create_connection()

    if conn is not None:
        try:
            cursor = conn.cursor()
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS notes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL
                )
            ''')
            conn.commit()
        except sqlite3.Error as e:
            print(e)
        finally:
            conn.close()


def save_note_db(title, content):
    new_id = None

    conn = create_connection()

    if conn is not None:
        try:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO notes (title, content) VALUES (?, ?)", (title, content))
            conn.commit()
            new_id = cursor.lastrowid
        except sqlite3.Error as e:
            print(e)
        finally:
            conn.close()

    return new_id

def load_notes_db():
    rows = []
    conn = create_connection()
            
    if conn is not None:
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT id, title, content FROM notes")
            rows = cursor.fetchall()

        except sqlite3.Error as e:
            print(e)
        
        finally:
            conn.close()
        
    return rows

def load_note_db(note_id):
    row = None
    conn = create_connection()

    if conn is not None:
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT id, title, content FROM notes WHERE id = ?", (note_id,))
            row = cursor.fetchone()

        except sqlite3.Error as e:
            print(e)

        finally:
            conn.close()

    return row


def delete_note_db(note_id):
    row = None
    conn = create_connection()

    
    if conn is not None:
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT id, title, content FROM notes WHERE id = ?", (note_id,))

            row = cursor.fetchone()

            if row is not None:
                cursor.execute("DELETE FROM notes WHERE id = ?", (note_id,))
                conn.commit()

        except sqlite3.Error as e:
            print(e)

        finally:
            conn.close()

    return row
    