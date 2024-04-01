document.addEventListener('DOMContentLoaded', function() {
  fetch('videogame.json')
  .then(response => response.json())
  .then(data => loadImages(data))
  .catch(error => console.error('Error loading video game data:', error));

  document.getElementById('showAddItemModal').addEventListener('click', function(event) {
      event.preventDefault();
      resetAddItemForm(); // Ensure the form is reset to its initial state
      document.getElementById('addItemModal').style.display = 'block';
  });

  document.getElementsByClassName('close')[1].addEventListener('click', function() {
      document.getElementById('addItemModal').style.display = 'none';
  });

  document.getElementById('cancelAddItem').addEventListener('click', function() {
      document.getElementById('addItemModal').style.display = 'none';
  });

  document.getElementById('addSupply').addEventListener('click', function() {
      const newInput = document.createElement('input');
      newInput.type = 'text';
      newInput.name = 'items[]';
      document.getElementById('suppliesContainer').appendChild(newInput);
  });

  document.getElementById('itemImage').addEventListener('change', function() {
      const [file] = this.files;
      if (file) {
          document.getElementById('imagePreview').src = URL.createObjectURL(file);
          document.getElementById('imagePreview').style.display = 'block';
      }
  });

  document.getElementById('addItemForm').addEventListener('submit', function(event) {
    event.preventDefault();

    var formData = new FormData(this);

    fetch('/add-game', {
        method: 'POST',
        body: formData,
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        document.getElementById('addItemModal').style.display = 'none';
        return fetch('videogame.json');
    })
    .then(response => response.json())
    .then(data => {
        loadImages(data); // Reload the images with the updated data
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});
});

function loadImages(games) {
  const gallery = document.getElementById('imageGallery');
  games.forEach(game => {
      const div = document.createElement('div');
      div.className = 'w3-quarter w3-container';
      const img = document.createElement('img');
      img.src = `images/${game.image}`;
      img.alt = game.name;
      img.style.width = '100%';
      img.classList.add("w3-hover-opacity");
      img.onclick = function() { openModal(game); };
      div.appendChild(img);
      gallery.appendChild(div);
  });
}

function openModal(game) {
  const modal = document.getElementById('myModal');
  const span = document.getElementsByClassName("close")[0];
  const info = document.getElementById('modalInfo');

  info.innerHTML = `<h3>${game.name}</h3>
                    <img src="images/${game.image}" style="max-width:100%;"><br>
                    <p><strong>Description:</strong> ${game.description}</p>
                    <p><strong>Items:</strong> ${game.items.join(', ')}</p>`;
  modal.style.display = "block";

  span.onclick = function() {
      modal.style.display = "none";
  }

  window.onclick = function(event) {
      if (event.target == modal) {
          modal.style.display = "none";
      }
  }
}

function resetAddItemForm() {
  document.getElementById('addItemForm').reset();
  const extraInputs = document.querySelectorAll('#suppliesContainer input[name="items[]"]:not(:first-of-type)');
  extraInputs.forEach(input => input.remove());
  document.getElementById('imagePreview').style.display = 'none';
  document.getElementById('imagePreview').src = '';
}