window.onload = function() {
  const gridContainer = document.querySelector('.grid');

  // Loop through mediaData and create HTML elements
  mediaData.media.forEach(item => {
    const mediaElement = document.createElement(item.type === 'image' ? 'img' : 'video');
    mediaElement.src = item.url;
    mediaElement.alt = item.title;
    mediaElement.addEventListener('click', () => openModal(item.id, item.type));
    
    // Add the media element to the grid container
    gridContainer.appendChild(mediaElement);
  });
};

function openModal(id, type) {
  const modal = document.getElementById("myModal");
  const modalContent = document.getElementById("modalContent");
  const modalBody = document.getElementById("modalBody");

  // Find the media item by id
  const item = mediaData.media.find(item => item.id === id);
  
  // Set modal content (image/video + details)
  if (item.type === 'image') {
    modalContent.innerHTML = `<img src="${item.url}" alt="${item.title}" />`;
  } else if (item.type === 'video') {
    modalContent.innerHTML = `<video autoplay loop muted><source src="${item.url}" type="video/mp4" /></video>`;
  }

  // Set modal body content (title, description, highlights, etc.)
  modalBody.innerHTML = `
    <h2>${item.title}</h2>
    <p>${item.description}</p>
    <ul>
      ${item.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
    </ul>
    <div>
      <a href="${item.playstoreLink}" target="_blank">Download from Playstore</a>
      <a href="${item.appstoreLink}" target="_blank">Download from Appstore</a>
    </div>
  `;

  // Show the modal
  modal.style.display = "flex";
}

function closeModal() {
  document.getElementById("myModal").style.display = "none";
}


// Function to render testimonials dynamically
function renderTestimonials() {
    const testimonyContent = document.getElementById('testimony-content');
    
    // Clear any existing content in case it's rendered again
    testimonyContent.innerHTML = '';

    // Loop through each testimony and create HTML elements
    testimonials.forEach(testimony => {
        const testimonyItem = document.createElement('div');
        testimonyItem.classList.add('testimony-item');

        const testimonyText = document.createElement('p');
        testimonyText.classList.add('testimony-text');
        testimonyText.textContent = testimony.text;

        const authorName = document.createElement('p');
        authorName.classList.add('author-name');
        authorName.textContent = testimony.author;

        testimonyItem.appendChild(testimonyText);
        testimonyItem.appendChild(authorName);

        testimonyContent.appendChild(testimonyItem);
    });

    // Add the ability to scroll the testimonies
    let currentTestimonyIndex = 0;
    const totalTestimonies = testimonials.length;

    function scrollTestimonies() {
        const containerWidth = document.querySelector('.testimony-section').offsetWidth;
        const itemWidth = document.querySelector('.testimony-item').offsetWidth;

        // Scroll to the next testimony
        currentTestimonyIndex = (currentTestimonyIndex + 1) % totalTestimonies;

        // Make sure the scroll is looping back to the first item once the last one is reached
        const scrollAmount = currentTestimonyIndex * itemWidth;

        // Smooth transition for scrolling
        document.querySelector('.testimony-content').style.transition = 'transform 0.5s ease-in-out';
        document.querySelector('.testimony-content').style.transform = `translateX(-${scrollAmount}px)`;
    }

    // Set interval to auto-scroll the testimonies every 3 seconds
    setInterval(scrollTestimonies, 3000);
}

// Call the renderTestimonials function to load testimonies on page load
document.addEventListener('DOMContentLoaded', renderTestimonials);
