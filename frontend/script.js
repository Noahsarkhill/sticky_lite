const noteForm = document.getElementById("note-form");
const noteTitle = document.getElementById("note-title");
const noteContent = document.getElementById("note-content");
const notesContainer = document.getElementById("notes-container");
const statusMessage = document.getElementById("status-message");
const submitButton = document.getElementById("submit-button");
const cancelEditButton = document.getElementById("cancel-edit-button");
let editingNoteId = null;

// Helper functions
function resetForm() {
  editingNoteId = null;
  noteTitle.value = "";
  noteContent.value = "";
  submitButton.textContent = "Save Note";
  cancelEditButton.style.display = "none";

  document.querySelectorAll(".note-card").forEach((card) => {
    card.classList.remove("selected");
  });
}

function showStatusMessage(message, type = "success") {
  statusMessage.textContent = message;

  if (type === "error") {
    statusMessage.style.color = "red";
  } else {
    statusMessage.style.color = "green";
  }

  setTimeout(() => {
    statusMessage.textContent = "";
  }, 3000);
}

async function handleApiResponse(response, fallbackMessage) {
  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.detail || data.message || fallbackMessage;
    throw new Error(errorMessage);
  }

  return data;
}

console.log(noteForm);
console.log(noteTitle);
console.log(noteContent);
console.log(notesContainer);
console.log(statusMessage);

function displayNote(note) {
  const noteCard = document.createElement("div");
  noteCard.classList.add("note-card");
  noteCard.dataset.id = note.id;

  noteCard.innerHTML = `
      <h3>${note.title}</h3>
      <p>${note.content}</p>
      <button class="pin-btn" data-id="${note.id}">
        ${note.pinned === 1 ? "Unpin" : "Pin"}
      </button>
      <button class="delete-btn" data-id="${note.id}">Delete</button>
  `;

  const deleteButton = noteCard.querySelector(".delete-btn");
  const pinButton = noteCard.querySelector(".pin-btn");

  noteCard.addEventListener("click", function () {
    editingNoteId = note.id;

    noteTitle.value = note.title;
    noteContent.value = note.content;

    submitButton.textContent = "Edit Note";
    cancelEditButton.style.display = "block";

    document.querySelectorAll(".note-card").forEach((card) => {
      card.classList.remove("selected");
    });

    noteCard.classList.add("selected");
  });

  pinButton.addEventListener("click", async function (event) {
    event.stopPropagation();

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/notes/${note.id}/pin`,
        {
          method: "PATCH",
        },
      );

      const pinnedNote = await handleApiResponse(
        response,
        "Could not update pin",
      );

      console.log(pinnedNote);

      showStatusMessage(pinnedNote.message, "success");

      notesContainer.innerHTML = "";
      await loadNotes();
    } catch (error) {
      showStatusMessage(error.message, "error");
    }
  });

  deleteButton.addEventListener("click", async function (event) {
    event.stopPropagation();
    try {
      const response = await fetch(`http://127.0.0.1:8000/notes/${note.id}`, {
        method: "DELETE",
      });

      const deletedNote = await handleApiResponse(
        response,
        "Could not delete note",
      );

      console.log(deletedNote);

      showStatusMessage(deletedNote.message, "success");

      noteCard.remove();

      if (editingNoteId === note.id) {
        resetForm();
      }
    } catch (error) {
      showStatusMessage(error.message, "error");
    }
  });

  notesContainer.appendChild(noteCard);
}

async function loadNotes() {
  try {
    const response = await fetch("http://127.0.0.1:8000/notes");

    const notes = await handleApiResponse(response, "Could not load notes");

    console.log(notes);

    for (const note of notes) {
      displayNote(note);
    }
  } catch (error) {
    showStatusMessage(error.message, "error");
  }
}

loadNotes();

cancelEditButton.addEventListener("click", () => {
  resetForm();
  showStatusMessage("Edit cancelled");
});

noteForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  try {
    console.log("Form submitted");

    const title = noteTitle.value;
    const content = noteContent.value;

    if (editingNoteId === null) {
      const response = await fetch("http://127.0.0.1:8000/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title,
          content: content,
        }),
      });

      const savedNote = await handleApiResponse(
        response,
        "Could not save note",
      );

      console.log(savedNote);

      showStatusMessage(savedNote.message, "success");

      displayNote(savedNote.note);
    } else {
      const response = await fetch(
        `http://127.0.0.1:8000/notes/${editingNoteId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title,
            content: content,
          }),
        },
      );

      const updatedNote = await handleApiResponse(
        response,
        "Could not update note",
      );

      console.log(updatedNote);

      showStatusMessage(updatedNote.message, "success");

      notesContainer.innerHTML = "";
      await loadNotes();

      editingNoteId = null;
    }

    resetForm();
  } catch (error) {
    showStatusMessage(error.message, "error");
  }
});
