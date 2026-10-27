
let recipes = JSON.parse(localStorage.getItem("recipes")) || [];


const form = document.getElementById("recipeForm");
const recipeList = document.getElementById("recipeList");
const searchInput = document.getElementById("search");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");


function saveRecipes() {
  localStorage.setItem("recipes", JSON.stringify(recipes));
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
function validateForm() {
  let valid = true;
  const fields = ["title", "ingredients", "instructions"];

  fields.forEach(function (field) {
    const value = document.getElementById(field).value.trim();
    const error = document.getElementById(field + "Error");
    if (value === "") {
      error.textContent = "This field is required.";
      valid = false;
    } else if (field === "title" && value.length < 3) {
      error.textContent = "Title must be at least 3 characters.";
      valid = false;
    } else {
      error.textContent = "";
    }
  });

  const file = document.getElementById("image").files[0];
  const imageError = document.getElementById("imageError");
  imageError.textContent = "";
  if (file && file.size > 500 * 1024) {
    imageError.textContent = "Image must be smaller than 500KB.";
    valid = false;
  }
  return valid;
}


function addRecipe(title, ingredients, instructions, image) {
  recipes.push({
    id: Date.now(),
    title: title,
    ingredients: ingredients,
    instructions: instructions,
    image: image
  });
  saveRecipes();
  displayRecipes();
}


function displayRecipes() {
  const keyword = searchInput.value.toLowerCase();
  const filtered = recipes.filter(function (r) {
    return r.title.toLowerCase().includes(keyword) ||
           r.ingredients.toLowerCase().includes(keyword);
  });

  recipeList.innerHTML = "";

  if (filtered.length === 0) {
    recipeList.innerHTML = '<p class="empty">No recipes found.</p>';
    return;
  }

  filtered.forEach(function (r) {
    const pic = r.image
      ? '<img src="' + r.image + '" alt="' + escapeHtml(r.title) + '">'
      : '<div class="no-img">🍽️</div>';

    const card = document.createElement("div");
    card.className = "recipe-card";
    card.innerHTML =
      pic +
      '<div class="info">' +
      "<h3>" + escapeHtml(r.title) + "</h3>" +
      '<button class="blue" onclick="viewRecipe(' + r.id + ')">View</button>' +
      '<button onclick="editRecipe(' + r.id + ')">Edit</button>' +
      '<button class="red" onclick="deleteRecipe(' + r.id + ')">Delete</button>' +
      "</div>";
    recipeList.appendChild(card);
  });
}


function viewRecipe(id) {
  const r = recipes.find(function (item) { return item.id === id; });
  const img = r.image ? '<img src="' + r.image + '" alt="">' : "";
  modalBody.innerHTML =
    img +
    "<h2>" + escapeHtml(r.title) + "</h2>" +
    "<h3>Ingredients</h3><p>" + escapeHtml(r.ingredients).replace(/\n/g, "<br>") + "</p>" +
    "<h3>Instructions</h3><p>" + escapeHtml(r.instructions).replace(/\n/g, "<br>") + "</p>";
  modal.classList.add("show");
}


function editRecipe(id) {
  const r = recipes.find(function (item) { return item.id === id; });
  document.getElementById("recipeId").value = r.id;
  document.getElementById("title").value = r.title;
  document.getElementById("ingredients").value = r.ingredients;
  document.getElementById("instructions").value = r.instructions;
  document.getElementById("formTitle").textContent = "Edit Recipe";
  document.getElementById("submitBtn").textContent = "Update Recipe";
  document.getElementById("cancelBtn").style.display = "inline-block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateRecipe(id, title, ingredients, instructions, image) {
  const r = recipes.find(function (item) { return item.id === id; });
  r.title = title;
  r.ingredients = ingredients;
  r.instructions = instructions;
  if (image) r.image = image; 
  saveRecipes();
  displayRecipes();
}

function deleteRecipe(id) {
  if (confirm("Are you sure you want to delete this recipe?")) {
    recipes = recipes.filter(function (r) { return r.id !== id; });
    saveRecipes();
    displayRecipes();
  }
}

function resetForm() {
  form.reset();
  document.getElementById("recipeId").value = "";
  document.getElementById("formTitle").textContent = "Add New Recipe";
  document.getElementById("submitBtn").textContent = "Add Recipe";
  document.getElementById("cancelBtn").style.display = "none";
  document.querySelectorAll(".error").forEach(function (e) { e.textContent = ""; });
}

form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (!validateForm()) return;

  const id = document.getElementById("recipeId").value;
  const title = document.getElementById("title").value.trim();
  const ingredients = document.getElementById("ingredients").value.trim();
  const instructions = document.getElementById("instructions").value.trim();
  const file = document.getElementById("image").files[0];

  function finish(image) {
    if (id) {
      updateRecipe(Number(id), title, ingredients, instructions, image);
    } else {
      addRecipe(title, ingredients, instructions, image);
    }
    resetForm();
  }

  if (file) {
    const reader = new FileReader();
    reader.onload = function () { finish(reader.result); };
    reader.readAsDataURL(file);
  } else {
    finish("");
  }
});

document.getElementById("cancelBtn").addEventListener("click", resetForm);
searchInput.addEventListener("input", displayRecipes);
document.getElementById("closeModal").addEventListener("click", function () {
  modal.classList.remove("show");
});
modal.addEventListener("click", function (e) {
  if (e.target === modal) modal.classList.remove("show");
});


displayRecipes();