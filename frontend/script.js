const noteForm = document.getElementById("note-form");
const noteTitle = document.getElementById("note-title");
const noteContent = document.getElementById("note-content");
const notesContainer = document.getElementById("notes-container");

console.log(noteForm);
console.log(noteTitle);
console.log(noteContent);
console.log(notesContainer);

function displayNote(note) {
    const noteCard = document.createElement("div");
    noteCard.classList.add("note-card");

    noteCard.innerHTML = `
        <h3>${note.title}</h3>
        <p>${note.content}</p>
        <button data-id="${note.id}">Delete</button>
    `;

    const deleteButton = noteCard.querySelector("button");

    deleteButton.addEventListener("click", async function() {
        const response = await fetch(`http://127.0.0.1:8000/notes/${note.id}`, {
            method: "DELETE"
        });

        const deletedNote = await response.json();

        console.log(deletedNote);

        noteCard.remove()
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

    displayNote(savedNote.note);

    noteTitle.value = "";
    noteContent.value = "";

});
