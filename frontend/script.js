const noteForm = document.getElementById("note-form");
const noteTitle = document.getElementById("note-title");
const noteContent = document.getElementById("note-content");
const notesContainer = document.getElementById("notes-container");

console.log(noteForm);
console.log(noteTitle);
console.log(noteContent);
console.log(notesContainer);

noteForm.addEventListener("submit", function(event) {
    event.preventDefault();

    console.log("Form submitted");


    const title = noteTitle.value;
    const content = noteContent.value;

    console.log(title);
    console.log(content);
    const noteCard = document.createElement("div");
    noteCard.classList.add("note-card");

    noteCard.innerHTML = `
        <h3>${title}</h3>
        <p>${content}</p>
        <button>Delete</button>
        `;

    notesContainer.appendChild(noteCard);

    noteTitle.value = "";
    noteContent.value = "";

});
