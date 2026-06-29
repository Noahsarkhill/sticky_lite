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
                    content TEXT NOT NULL,
                    pinned INTEGER DEFAULT 0
                )
            ''')
            conn.commit()
        except sqlite3.Error as e:
            print(e)
        finally:
            conn.close()


def ensure_pinned_column():
    conn = create_connection()

    if conn is not None:
        try:
            cursor = conn.cursor()
            cursor.execute("PRAGMA table_info(notes)")
            columns = cursor.fetchall()
            column_names = [column[1] for column in columns]

            if "pinned" not in column_names:
                cursor.execute('''
                    ALTER TABLE notes ADD COLUMN pinned INTEGER DEFAULT 0
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
            cursor.execute("SELECT id, title, content, pinned FROM notes ORDER BY pinned DESC, id DESC")
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
            cursor.execute("SELECT id, title, content, pinned FROM notes WHERE id = ?", (note_id,))
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
            cursor.execute("SELECT id, title, content, pinned FROM notes WHERE id = ?", (note_id,))

            row = cursor.fetchone()

            if row is not None:
                cursor.execute("DELETE FROM notes WHERE id = ?", (note_id,))
                conn.commit()

        except sqlite3.Error as e:
            print(e)

        finally:
            conn.close()

    return row
    

def update_note_db(note_id, title, content):
    row = None
    conn = create_connection()

    if conn is not None:
        try:
            cursor = conn.cursor()
            cursor.execute("UPDATE notes SET title = ?, content = ? WHERE id = ?", (title, content, note_id))
            conn.commit()

            if cursor.rowcount == 0:
                return None

            cursor.execute("SELECT id, title, content, pinned FROM notes WHERE id = ?", (note_id,))


            row = cursor.fetchone()

        except sqlite3.Error as e:
            print(e)

        finally:
            conn.close()

    return row


def toggle_pin_db(note_id):
    conn = create_connection()

    if conn is not None:
        try:
            cursor = conn.cursor()

            cursor.execute("SELECT id, title, content, pinned FROM notes WHERE id = ?", (note_id,))

            selected_row = cursor.fetchone()

            if selected_row is None:
                return None
            
            selected_id, title, content, current_pinned = selected_row

            if current_pinned == 1:
                new_pinned = 0
            else:
                new_pinned = 1

            cursor.execute("UPDATE notes SET pinned = ? WHERE id = ?", (new_pinned, note_id))
            conn.commit()

            return {
                "id": selected_id,
                "title": title,
                "content": content,
                "pinned": new_pinned
            }
        
        except sqlite3.Error as e:
            print("TOGGLE PIN ERROR", e)
            return None
        
        finally:
            conn.close()

    return None



