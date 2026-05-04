const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const signInForm = document.getElementById("signInForm");
const message = document.getElementById("message");
const signInBtn = document.getElementById('signInBtn');
const API_BASE = "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", () => {
  const userSession = window.localStorage.getItem("userSession");
  if (userSession) {
    window.location.href = '/frontend';
  }
})

async function handleSubmitForm(e) {
  const email = emailInput.value;
  const password = passwordInput.value;
  e.preventDefault();
  try {
    const response = await fetch(`${API_BASE}/auth/sign-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const userData = await response.json();
      console.log(userData);
      
      window.localStorage.setItem(
        'userSession',
        JSON.stringify({
          userId: userData.data.id,
          email: userData.data.email,
          userName: userData.data.username,
        }));

      window.location.href = "/frontend/";
    } else {
      const data = await response.json();
      message.innerText = data.message;
    }
  } catch (error) {
    console.log(error);
  }
}

signInForm.addEventListener("submit", handleSubmitForm);
