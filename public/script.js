const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");
const message = document.getElementById("message");


// =================================
// GET FILES FROM BACKEND
// =================================

async function loadFiles() {

    try {

        const response = await fetch("/api/files");

        const files = await response.json();

        fileList.innerHTML = "";

        files.forEach(file => {

            const div = document.createElement("div");

            div.className = "file";

            div.innerHTML = `
                <div class="file-name">
                    📄 ${file.name}
                </div>

                <div class="actions">

                    <button
                        class="download"
                        onclick="downloadFile('${file.name}')">
                        Download
                    </button>

                    <button
                        class="delete"
                        onclick="deleteFile('${file.name}')">
                        Delete
                    </button>

                </div>
            `;

            fileList.appendChild(div);

        });

    } catch (error) {

        console.log(error);

        message.innerText = "Unable to load files";
    }
}


// =================================
// UPLOAD FILE
// =================================

async function uploadFile() {

    const file = fileInput.files[0];

    if (!file) {

        message.innerText = "Please select a file";

        return;
    }

    const formData = new FormData();

    formData.append("file", file);


    try {

        const response = await fetch("/api/upload", {

            method: "POST",

            body: formData
        });


        const data = await response.json();

        message.innerText = data.message;

        fileInput.value = "";

        loadFiles();

    } catch (error) {

        console.log(error);

        message.innerText = "Upload failed";
    }
}


// =================================
// DOWNLOAD FILE
// =================================

function downloadFile(filename) {

    window.location.href =
        `/api/download/${encodeURIComponent(filename)}`;
}


// =================================
// DELETE FILE
// =================================

async function deleteFile(filename) {

    const confirmDelete =
        confirm(`Delete ${filename}?`);

    if (!confirmDelete) {
        return;
    }


    try {

        const response = await fetch(
            `/api/files/${encodeURIComponent(filename)}`,
            {
                method: "DELETE"
            }
        );


        const data = await response.json();

        message.innerText = data.message;

        loadFiles();

    } catch (error) {

        console.log(error);

        message.innerText = "Delete failed";
    }
}


// =================================
// LOAD FILES WHEN PAGE OPENS
// =================================

loadFiles();n 