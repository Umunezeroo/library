const usernameInput = document.getElementById("userName");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const signUpForm = document.getElementById("signUpForm");
const error = document.getElementById("error");
const formInput = document.getElementById("formInput");

const API_BASE = "http://localhost:3000/api";

emailInput.addEventListener("focus", () => {
  error.innerText = "";
  formInput.classList.remove("error");
});

const handleSubmitForm = async (e) => {
  e.preventDefault();

  const username = usernameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;
  const confirm = confirmPasswordInput.value;

  console.log({
    username,
    password,
    email,
    confirm,
  });

  if (password !== confirm) {
    return alert(`password doesn't match`);
  }

  const response = await fetch(`${API_BASE}/auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      email,
      password,
    }),
  });
  if (response.ok) {
    window.location.href = "/frontend/sign-in/sign-in.html";
  } else {
    const data = await response.json();

    error.innerText = data.message;
    error.style.display = "block";
    formInput.classList.add("error");
  }
};

signUpForm.addEventListener("submit", handleSubmitForm);
