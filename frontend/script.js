const noteForm = document.getElementById("note-form");
const noteTitle = document.getElementById("note-title");
const noteContent = document.getElementById("note-content");
const notesContainer = document.getElementById("notes-container");
const statusMessage = document.getElementById("status-message");
let editingNoteId = null;

function showStatusMessage(message) {
    statusMessage.textContent = message;

    setTimeout(() => {
        statusMessage.textContent = "";
   }, 3000);
}

console.log(noteForm);
console.log(noteTitle);
console.log(noteContent);
console.log(notesContainer);
console.log(statusMessage);

function displayNote(note) {
    const noteCard = document.createElement("div");
    noteCard.classList.add("note-card");

    noteCard.innerHTML = `
        <h3>${note.title}</h3>
        <p>${note.content}</p>
        <button class="edit-btn" data-id="${note.id}">Edit</button>
        <button class="delete-btn" data-id="${note.id}">Delete</button>
    `;

    const editButton = noteCard.querySelector(".edit-btn");
    const deleteButton = noteCard.querySelector(".delete-btn");


    editButton.addEventListener("click", function() {
        editingNoteId = note.id;


        noteTitle.value = note.title;
        noteContent.value = note.content;
    });


    deleteButton.addEventListener("click", async function() {
        const response = await fetch(`http://127.0.0.1:8000/notes/${note.id}`, {
            method: "DELETE"
        });

        const deletedNote = await response.json();

        console.log(deletedNote);

        showStatusMessage(deletedNote.message);

        noteCard.remove();
    });

    notesContainer.appendChild(noteCard);
}


async function loadNotes() {
    const response = await fetch("http://127.0.0.1:8000/notes");

    const notes = await response.json();

    console.log(notes);

    for (const note of notes) {
        displayNote(note);
    }
}

loadNotes();


noteForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    console.log("Form submitted");


    const title = noteTitle.value;
    const content = noteContent.value;


    if (editingNoteId === null) {
        const response = await fetch("http://127.0.0.1:8000/notes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title,
                content: content
            })
        });

        const savedNote = await response.json();

        console.log(savedNote);

        showStatusMessage(savedNote.message);

        displayNote(savedNote.note);
    } else {
        const response = await fetch(`http://127.0.0.1:8000/notes/${editingNoteId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title,
                content: content
            })
        });

        const updatedNote = await response.json();

        console.log(updatedNote);

        showStatusMessage(updatedNote.message);

        notesContainer.innerHTML = "";
        loadNotes();

        editingNoteId = null;
    }

    noteTitle.value = "";
    noteContent.value = "";

});
