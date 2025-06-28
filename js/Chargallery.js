document.addEventListener("DOMContentLoaded", function () {
    fetch("../json/Chargallery.json")
      .then(response => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(data => {
        const gallery = document.getElementById("gallery");
  
        data.forEach(item => {
          const imgDiv = document.createElement("div");
          imgDiv.classList.add("gallery-item");
  
          imgDiv.innerHTML = `
            <a href="${item.link || '#'}">
              <img src="${item.image}" alt="${item.name}">
              <p class="name">${item.name}</p>
            </a>
          `;
  
          gallery.appendChild(imgDiv);
        });
      })
      .catch(error => {
        console.error("Error loading gallery:", error);
      });
  });
  