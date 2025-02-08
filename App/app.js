// const CLIENT_ID = 'your-client-id';
// const API_KEY = 'your-api-key';
// const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
// const SCOPES = "https://www.googleapis.com/auth/drive.file";

// let authInstance;

// function loadGoogleApi() {
//   gapi.load('client:auth2', async () => {
//     await gapi.client.init({
//       apiKey: API_KEY,
//       clientId: CLIENT_ID,
//       discoveryDocs: DISCOVERY_DOCS,
//       scope: SCOPES,
//     });
//     authInstance = gapi.auth2.getAuthInstance();
//   });
// }
// //
// document.addEventListener("DOMContentLoaded", function () {
//   ZOHO.CREATOR.init()
//     .then(function () {
//       const apiCredentials = {
//         appName: "widget", // Your Zoho Creator application name
//         reportName: "Configurations" // The report name to fetch records from
//       };

//       // Fetch records from the Configuration report
//       ZOHO.CREATOR.API.getAllRecords(apiCredentials)
//         .then(function (response) {
//           console.log("Configurations API Response:", response);

//           // Get the container where records will be displayed
//           const recordsContainer = document.getElementById("show-credentials");

//           if (response.data && response.data.length > 0) {
//             const res = response.data;
//             console.log("response", res);
//           } else {
//             // Display a placeholder when no records are found
//             recordsContainer.innerHTML = `<p>No records available in the Configurations report.</p>`;
//           }
//         })
//         .catch(function (error) {
//           console.error("Error fetching configuration records:", error);

//           // Display an error message in the container
//           const recordsContainer = document.getElementById("show-credentials");
//           recordsContainer.innerHTML = `<p>Failed to load configurations. Please try again later.</p>`;
//         });
//     });
//     });


//   //
//   async function uploadFiles() {
//     const fileInput = document.getElementById('fileInput');
//     const statusMessage = document.getElementById('statusMessage');
//     const uploadedFileDetails = document.getElementById('uploadedFileDetails');
//     const files = fileInput.files;

//     if (files.length === 0) {
//       statusMessage.textContent = 'Please select files to upload.';
//       return;
//     }

//     statusMessage.textContent = 'Uploading files...';
//     uploadedFileDetails.innerHTML = '';

//     const accessToken = 'ya29.a0ARW5m77aoOYss-pE2EvWwAKFtI9PndaazhlF1x5Pp4dKIfdBwBx244ZulrgSNdnZH4VS_zKP1PQtvJtokd09qOscSwIjAfSXAX5KxvpIEwWckNx4IK-x9nNNnsVp_Tnwg4-ZSKLJxxARcjuq9wVRscqBaRSYI1V1SeoNb-XNJAaCgYKAaQSARESFQHGX2Miiqoc-RPgq2NY05TmzTSvOA0177';

//     for (const file of files) {
//       try {
//         const fileMetadata = {
//           name: file.name,
//         };
//         const form = new FormData();
//         form.append(
//           "metadata",
//           new Blob([JSON.stringify(fileMetadata)], { type: "application/json" })
//         );
//         form.append("file", file);

//         const response = await fetch(
//           "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
//           {
//             method: "POST",
//             headers: {
//               "Authorization": `Bearer ${accessToken}`,
//             },
//             body: form,
//           }
//         );

//         if (response.ok) {
//           const data = await response.json();
//           uploadedFileDetails.innerHTML += `
//           <h3>Uploaded File Details:</h3>
//           <p><strong>Name:</strong> ${data.name}</p>
//           <p><strong>ID:</strong> ${data.id}</p>
//           <p><strong>Link:</strong> <a href="https://drive.google.com/file/d/${data.id}/view" target="_blank">View File</a></p>
//         `;
//         } else {
//           const error = await response.json();
//           statusMessage.textContent = `Failed to upload file: ${error.message}`;
//         }
//       } catch (err) {
//         console.error('Error uploading file:', err);
//         statusMessage.textContent = 'An error occurred while uploading one or more files.';
//       }
//     }

//     statusMessage.textContent = 'File upload process completed.';
//   }

//   document.getElementById('uploadButton').addEventListener('click', uploadFiles);
//   window.onload = loadGoogleApi;
// new code 
document.addEventListener("DOMContentLoaded", function () {

  ZOHO.CREATOR.init().then(function () {
    const apiCredentials = {
      appName: "widget", 
      reportName: "Configurations" 
    };

    ZOHO.CREATOR.API.getAllRecords(apiCredentials)
      .then(function (response) {
        console.log("Configurations API Response:", response);

        if (response.data && response.data.length > 0) {
          const config = response.data[0];
          const CLIENT_ID = config.CLIENT_ID; 
          const API_KEY = config.API_KEY;     
          const ACCESS_TOKEN = config.ACCESS_TOKEN;
          console.log("Access Token:", ACCESS_TOKEN);
          
          bindUploadButton(ACCESS_TOKEN);
          loadGoogleApi(CLIENT_ID, API_KEY, ACCESS_TOKEN);
          
          
          listDriveFiles(ACCESS_TOKEN).then(files => {
            renderDriveUI(files);  
          });

        } else {
          console.error("No configuration records found.");
          alert("Failed to fetch API credentials. Please check the Configuration report.");
        }
      })
      .catch(function (error) {
        console.error("Error fetching configuration records:", error);
        alert("Error fetching API credentials. Please try again later.");
      });
  });
});

function loadGoogleApi(CLIENT_ID, API_KEY, ACCESS_TOKEN) {
  gapi.load("client:auth2", async () => {
    await gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
      scope: "https://www.googleapis.com/auth/drive.file",
      access_type: "offline", 
    });

    console.log("Google API initialized successfully with dynamic credentials.");

    const authInstance = gapi.auth2.getAuthInstance();

    if (!authInstance.isSignedIn.get()) {
      await authInstance.signIn();
    }

    const currentUser = authInstance.currentUser.get();
    const authResponse = currentUser.getAuthResponse(true);

    let accessToken = authResponse.access_token;
    console.log("Access Token:", accessToken);
  });
}

async function listDriveFiles(accessToken) {
  try {
    const response = await fetch("https://www.googleapis.com/drive/v3/files", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Files retrieved:", data.files);
      return data.files;  
    } else {
      const error = await response.json();
      console.error("Failed to fetch files:", error);
      alert(`Error fetching files: ${error.message}`);
      return [];
    }
  } catch (err) {
    console.error("Error fetching files:", err);
    alert("An error occurred while fetching files.");
    return [];
  }
}

function renderDriveUI(files) {
  const driveUI = document.getElementById("driveUI");
  driveUI.innerHTML = "";
  files.forEach((file) => {
    const card = document.createElement("div");
    card.className = "file-card";

    const icon = document.createElement("div");
    icon.className = "file-icon";

    
    if (file.thumbnailLink) {
      const img = document.createElement("img");
      img.src = file.thumbnailLink;
      img.alt = file.name;
      icon.appendChild(img);
    } else {
      const defaultIcon = document.createElement("span");
      defaultIcon.textContent = "📄"; 
      icon.appendChild(defaultIcon);
    }

    const name = document.createElement("div");
    name.className = "file-name";
    name.textContent = file.name;

    
    card.addEventListener("click", () => {
      window.open(`https://drive.google.com/file/d/${file.id}/view`, "_blank");
    });

    card.appendChild(icon);
    card.appendChild(name);
    driveUI.appendChild(card);
  });
}


function bindUploadButton(accessToken) {
  document.getElementById("uploadButton").addEventListener("click", function () {
    uploadFiles(accessToken); 
    listDriveFiles(accessToken).then(files => {
      renderDriveUI(files); 
    });
  });
}

async function uploadFiles(access_token) {
  const fileInput = document.getElementById("fileInput");
  const statusMessage = document.getElementById("statusMessage");
  const uploadedFileDetails = document.getElementById("uploadedFileDetails");
  const files = fileInput.files;

  console.log("Selected files:", files);

  if (files.length === 0) {
    statusMessage.textContent = "Please select files to upload.";
    return;
  }

  statusMessage.textContent = "Uploading files...";
  uploadedFileDetails.innerHTML = "";

  for (const file of files) {
    console.log("Uploading file:", file.name);

    try {
      const fileMetadata = {
        name: file.name,
      };
      const form = new FormData();
      form.append(
        "metadata",
        new Blob([JSON.stringify(fileMetadata)], { type: "application/json" })
      );
      form.append("file", file);

      const response = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
          body: form,
        }
      );

      console.log("Fetch response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        window.location.reload();
        alert('File uploaded');
      } else {
        const error = await response.json();
        statusMessage.textContent = `Failed to upload file: ${error.message}`;
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      statusMessage.textContent = "An error occurred while uploading one or more files.";
    }
  }

  statusMessage.textContent = "File upload process completed.";
}


// 
// document.addEventListener("DOMContentLoaded", function () {
//   // Initialize Zoho Creator API
//   ZOHO.CREATOR.init().then(function () {
//     const apiCredentials = {
//       appName: "widget",
//       reportName: "Configurations",
//     };

//     ZOHO.CREATOR.API.getAllRecords(apiCredentials)
//       .then(function (response) {
//         console.log("Configurations API Response:", response);

//         if (response.data && response.data.length > 0) {
//           const config = response.data[0];
//           const CLIENT_ID = config.CLIENT_ID;
//           const CLIENT_SECRET = config.CLIENT_SECRET; // Needed for token refresh
//           const ACCESS_TOKEN = config.ACCESS_TOKEN;
//           const REFRESH_TOKEN = config.REFRESH_TOKEN;
//           const recordId = config.ID; // Unique record ID in Zoho Creator

//           console.log("Access Token:", ACCESS_TOKEN);

//           initializeDrive(CLIENT_ID, CLIENT_SECRET, ACCESS_TOKEN, REFRESH_TOKEN, recordId);
//         } else {
//           console.error("No configuration records found.");
//           alert("Failed to fetch API credentials. Please check the Configuration report.");
//         }
//       })
//       .catch(function (error) {
//         console.error("Error fetching configuration records:", error);
//         alert("Error fetching API credentials. Please try again later.");
//       });
//   });
// });

// // Initialize Google Drive and handle token refresh
// function initializeDrive(CLIENT_ID, CLIENT_SECRET, ACCESS_TOKEN, REFRESH_TOKEN, recordId) {
//   let accessToken = ACCESS_TOKEN;
//    console.log("datas",CLIENT_ID,CLIENT_SECRET,ACCESS_TOKEN,REFRESH_TOKEN);
//    async function refreshToken() {
//     const tokenUrl = "https://oauth2.googleapis.com/token";
  
//     const params = new URLSearchParams({
//       client_id: CLIENT_ID,
//       client_secret: CLIENT_SECRET,
//       refresh_token: REFRESH_TOKEN,
//       grant_type: "refresh_token",
//     });
  
//     try {
//       console.log("Sending refresh token request with params:", params.toString());
  
//       const response = await fetch(tokenUrl, {
//         method: "POST",
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         body: params,
//       });
  
//       const data = await response.json();
  
//       if (response.ok) {
//         accessToken = data.access_token;
//         console.log("New Access Token:", accessToken);
//         return accessToken;
//       } else {
//         console.error("Failed to refresh token. Server Response:", data);
//         return null;
//       }
//     } catch (err) {
//       console.error("Error refreshing token:", err);
//       console.log("refre",REFRESH_TOKEN);
      
//       return null;
//     }
//   }
  

//   async function uploadFileToDrive(file, retry = true) {
//     const fileMetadata = {
//       name: file.name,
//     };
//     const form = new FormData();
//     form.append(
//       "metadata",
//       new Blob([JSON.stringify(fileMetadata)], { type: "application/json" })
//     );
//     form.append("file", file);
  
//     try {
//       const response = await fetch(
//         "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//           },
//           body: form,
//         }
//       );
  
//       if (response.ok) {
//         const data = await response.json();
//         console.log("File uploaded successfully:", data);
//         return data;
//       } else if (response.status === 401 && retry) {
//         // Token expired, refresh and retry
//         console.log("Access token expired. Refreshing...");
//         const newAccessToken = await refreshToken();
//         if (newAccessToken) {
//           console.log("Retrying file upload with new access token...");
//           return await uploadFileToDrive(file, false); // Retry only once
//         } else {
//           console.error("Failed to refresh access token.");
//           throw new Error("Unable to refresh access token. Upload aborted.");
//         }
//       } else {
//         const errorData = await response.json();
//         console.error("Failed to upload file:", errorData);
//         throw new Error(`Upload failed: ${errorData.message}`);
//       }
//     } catch (err) {
//       console.error("Error during file upload:", err);
//       throw err; // Pass the error up the stack for handling
//     }
//   }
  

//   document.getElementById("uploadButton").addEventListener("click", async function () {
//     const fileInput = document.getElementById("fileInput");
//     const statusMessage = document.getElementById("statusMessage");
//     const uploadedFileDetails = document.getElementById("uploadedFileDetails");
//     const files = fileInput.files;

//     if (files.length === 0) {
//       statusMessage.textContent = "Please select files to upload.";
//       return;
//     }

//     statusMessage.textContent = "Uploading files...";
//     uploadedFileDetails.innerHTML = "";

//     for (const file of files) {
//       const uploadedFile = await uploadFileToDrive(file);
//       if (uploadedFile) {
//         uploadedFileDetails.innerHTML += `
//           <h3>Uploaded File Details:</h3>
//           <p><strong>Name:</strong> ${uploadedFile.name}</p>
//           <p><strong>ID:</strong> ${uploadedFile.id}</p>
//           <p><strong>Link:</strong> <a href="https://drive.google.com/file/d/${uploadedFile.id}/view" target="_blank">View File</a></p>
//         `;
//       }
//     }

//     statusMessage.textContent = "File upload process completed.";
//   });
// }

// // Update the access token in Zoho Creator
// function updateAccessTokenInZoho(recordId, accessToken) {
//   const apiCredentials = {
//     appName: "widget",
//     reportName: "Configurations",
//     id: recordId,
//   };

//   const fieldData = {
//     ACCESS_TOKEN: accessToken,
//   };

//   ZOHO.CREATOR.API.updateRecord(apiCredentials, fieldData)
//     .then(function (response) {
//       if (response.code === 3000) {
//         console.log("Access token updated successfully in Zoho Creator.");
//       } else {
//         console.error("Failed to update access token in Zoho Creator:", response);
//       }
//     })
//     .catch(function (error) {
//       console.error("Error updating access token in Zoho Creator:", error);
//     });
// }


