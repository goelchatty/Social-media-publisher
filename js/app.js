const PREVIEW_WEBHOOK_URL = "http://localhost:5678/webhook/5e0c76fc-8038-4a71-866d-b268d36ce797";
const PUBLISH_WEBHOOK_URL = "http://localhost:5678/webhook/c260f7e0-4579-4b90-b2c6-43db3949ca39";

let isSignUpMode = false;
let currentUser = null;
let currentImageUrl = "";

window.onload = function() {
  const activeSession = sessionStorage.getItem("app_current_session") || localStorage.getItem("app_current_session");
  if (activeSession) {
    loginUser(activeSession, false);
  }
};

function switchTab(tab) {
  const isStudio = tab === 'studio';
  document.getElementById('tabStudio').style.display = isStudio ? 'block' : 'none';
  document.getElementById('tabSettings').style.display = isStudio ? 'none' : 'block';
  document.getElementById('tabStudioBtn').classList.toggle('active', isStudio);
  document.getElementById('tabSettingsBtn').classList.toggle('active', !isStudio);
}

function toggleAuthMode() {
  isSignUpMode = !isSignUpMode;
  document.getElementById("authTitle").innerText = isSignUpMode ? "Create Account" : "Social Media Publisher";
  document.getElementById("authSubtitle").innerText = isSignUpMode ? "Register to configure your workspace." : "Sign in to access your publishing workspace.";
  document.getElementById("authSubmitBtn").innerText = isSignUpMode ? "Create Account" : "Sign In";
  document.getElementById("authToggleText").innerText = isSignUpMode ? "Already have an account? Sign In" : "Don't have an account? Create one";
  document.getElementById("signupFields").style.display = isSignUpMode ? "block" : "none";
  document.getElementById("authError").style.display = "none";
  
  if (isSignUpMode) {
    handlePasswordInputs();
  }
}

function handlePasswordInputs() {
  if (!isSignUpMode) return;
  validatePasswordRequirements();
  validatePasswordMatch();
}

function validatePasswordRequirements() {
  const pass = document.getElementById("authPassword").value;

  const hasLength = pass.length >= 8;
  const hasUpper = /[A-Z]/.test(pass);
  const hasNumber = /[0-9]/.test(pass);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);

  setReqStatus("reqLength", hasLength);
  setReqStatus("reqUpper", hasUpper);
  setReqStatus("reqNumber", hasNumber);
  setReqStatus("reqSpecial", hasSpecial);

  return {
    isValid: hasLength && hasUpper && hasNumber && hasSpecial
  };
}

function validatePasswordMatch() {
  const pass = document.getElementById("authPassword").value;
  const confirmInput = document.getElementById("authConfirmPassword");
  const confirmPass = confirmInput.value;
  const matchEl = document.getElementById("matchStatus");

  if (!confirmPass) {
    matchEl.style.display = "none";
    confirmInput.style.borderColor = "var(--border-subtle)";
    return false;
  }

  if (pass === confirmPass) {
    matchEl.className = "match-status match";
    matchEl.innerText = "✓ Passwords match";
    confirmInput.style.borderColor = "var(--accent-success)";
    return true;
  } else {
    matchEl.className = "match-status mismatch";
    matchEl.innerText = "✕ Passwords do not match";
    confirmInput.style.borderColor = "var(--accent-danger)";
    return false;
  }
}

function setReqStatus(elementId, isValid) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.className = `req-item ${isValid ? "valid" : "invalid"}`;
}

function handleAuthSubmit() {
  const email = document.getElementById("authEmail").value.trim().toLowerCase();
  const password = document.getElementById("authPassword").value;
  const rememberMe = document.getElementById("rememberMe").checked;
  const errEl = document.getElementById("authError");

  if (!email || !password) {
    errEl.innerText = "Please provide both an email and password.";
    errEl.style.display = "block";
    return;
  }

  const users = JSON.parse(localStorage.getItem("app_registered_users") || "{}");

  if (isSignUpMode) {
    const validation = validatePasswordRequirements();
    const isMatch = validatePasswordMatch();

    if (!validation.isValid) {
      errEl.innerText = "Please satisfy all password complexity requirements.";
      errEl.style.display = "block";
      return;
    }

    if (!isMatch) {
      errEl.innerText = "Passwords do not match. Please ensure both fields match.";
      errEl.style.display = "block";
      return;
    }

    if (users[email]) {
      errEl.innerText = "An account with this email already exists.";
      errEl.style.display = "block";
      return;
    }

    users[email] = { password: password };
    localStorage.setItem("app_registered_users", JSON.stringify(users));
    loginUser(email, rememberMe);
  } else {
    if (!users[email] || users[email].password !== password) {
      errEl.innerText = "Invalid email or password.";
      errEl.style.display = "block";
      return;
    }
    loginUser(email, rememberMe);
  }
}

function loginUser(email, rememberMe = false) {
  currentUser = email;
  if (rememberMe) {
    localStorage.setItem("app_current_session", email);
    sessionStorage.removeItem("app_current_session");
  } else {
    sessionStorage.setItem("app_current_session", email);
    localStorage.removeItem("app_current_session");
  }
  
  document.getElementById("displayUserEmail").innerText = email;
  document.getElementById("previewAuthor").innerText = email.split('@')[0];
  document.getElementById("authScreen").style.display = "none";
  document.getElementById("appScreen").style.display = "block";
  loadUserSettings();
}

function logout() {
  localStorage.removeItem("app_current_session");
  sessionStorage.removeItem("app_current_session");
  currentUser = null;
  document.getElementById("authEmail").value = "";
  document.getElementById("authPassword").value = "";
  const confirmPass = document.getElementById("authConfirmPassword");
  if (confirmPass) confirmPass.value = "";
  document.getElementById("matchStatus").style.display = "none";
  document.getElementById("rememberMe").checked = false;
  document.getElementById("appScreen").style.display = "none";
  document.getElementById("authScreen").style.display = "flex";
}

function getUserKeyPrefix() {
  return `user_${currentUser}_`;
}

function loadUserSettings() {
  const prefix = getUserKeyPrefix();
  document.getElementById("apiKey").value = localStorage.getItem(prefix + "api_key") || "";
  document.getElementById("apiUrl").value = localStorage.getItem(prefix + "api_url") || "https://api.groq.com/openai/v1/chat/completions";
  document.getElementById("modelName").value = localStorage.getItem(prefix + "model_name") || "openai/gpt-oss-20b";
  
  document.getElementById("imageApiKey").value = localStorage.getItem(prefix + "image_api_key") || "";
  document.getElementById("imageApiUrl").value = localStorage.getItem(prefix + "image_api_url") || "https://api.openai.com/v1/images/generations";
  document.getElementById("imageModel").value = localStorage.getItem(prefix + "image_model") || "dall-e-3";
  document.getElementById("imgbbKey").value = localStorage.getItem(prefix + "imgbb_key") || "";
}

function saveSettings() {
  const prefix = getUserKeyPrefix();
  localStorage.setItem(prefix + "api_key", document.getElementById("apiKey").value);
  localStorage.setItem(prefix + "api_url", document.getElementById("apiUrl").value);
  localStorage.setItem(prefix + "model_name", document.getElementById("modelName").value);
  
  localStorage.setItem(prefix + "image_api_key", document.getElementById("imageApiKey").value);
  localStorage.setItem(prefix + "image_api_url", document.getElementById("imageApiUrl").value);
  localStorage.setItem(prefix + "image_model", document.getElementById("imageModel").value);
  localStorage.setItem(prefix + "imgbb_key", document.getElementById("imgbbKey").value);

  const notification = document.getElementById("saveNotification");
  notification.innerText = "Configuration saved successfully.";
  notification.style.display = "block";
  setTimeout(() => { notification.style.display = "none"; }, 3500);
}

async function generatePreview() {
  const btn = document.getElementById("generateBtn");
  const approveBtn = document.getElementById("approveBtn");
  const imgEl = document.getElementById("postImage");
  const imgWrapper = document.getElementById("imageWrapper");
  const prefix = getUserKeyPrefix();

  btn.disabled = true;
  btn.innerText = "Synthesizing Content...";

  try {
    const res = await fetch(PREVIEW_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: localStorage.getItem(prefix + "api_key") || document.getElementById("apiKey").value,
        apiUrl: localStorage.getItem(prefix + "api_url") || document.getElementById("apiUrl").value,
        modelName: localStorage.getItem(prefix + "model_name") || document.getElementById("modelName").value,
        imageApiKey: localStorage.getItem(prefix + "image_api_key") || document.getElementById("imageApiKey").value,
        imageApiUrl: localStorage.getItem(prefix + "image_api_url") || document.getElementById("imageApiUrl").value,
        imageModel: localStorage.getItem(prefix + "image_model") || document.getElementById("imageModel").value,
        imgbbKey: localStorage.getItem(prefix + "imgbb_key") || document.getElementById("imgbbKey").value
      })
    });
    const data = await res.json();

    document.getElementById("summaryText").value = data.summary || "";
    document.getElementById("captionText").value = data.caption || "";
    
    currentImageUrl = data.imageUrl || "";
    if (currentImageUrl) {
      imgEl.src = currentImageUrl;
      imgWrapper.style.display = "block";
    }

    approveBtn.disabled = false;
  } catch (err) {
    alert("Pipeline Execution Error: " + err.message);
  } finally {
    btn.disabled = false;
    btn.innerText = "Generate Post Preview";
  }
}

async function publishPost() {
  const btn = document.getElementById("approveBtn");
  const statusBox = document.getElementById("publishNotification");
  const caption = document.getElementById("captionText").value;

  btn.disabled = true;
  btn.innerText = "Publishing to Social Media...";

  try {
    const res = await fetch(PUBLISH_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caption: caption,
        imageUrl: currentImageUrl
      })
    });

    const data = await res.json();
    statusBox.innerText = data.status || "Posts published successfully.";
    statusBox.style.display = "block";
  } catch (err) {
    alert("Publishing Dispatch Error: " + err.message);
  } finally {
    btn.disabled = false;
    btn.innerText = "Approve & Publish Post";
  }
}