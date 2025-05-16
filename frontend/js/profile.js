document.addEventListener("DOMContentLoaded", async () => {
  console.log("profile.js script loaded");
  try {
    const response = await fetch('../../backend/api.php?checkSession');
    const data = await response.json();

    if (data.user) {
      // Prefill form inputs except password fields
      document.getElementById('firstname').value = data.user.firstname || '';
      document.getElementById('lastname').value = data.user.lastname || '';
      document.getElementById('username').value = data.user.username || '';
      document.getElementById('email').value = data.user.email || '';
      document.getElementById('address').value = data.user.address || '';
      document.getElementById('city').value = data.user.city || '';
      document.getElementById('postal_code').value = data.user.postal_code || '';
    }
  } catch (error) {
    console.error('Error fetching session data:', error);
  }
});

document.getElementById('profileForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = {
    firstname: document.getElementById('firstname').value.trim(),
    lastname: document.getElementById('lastname').value.trim(),
    username: document.getElementById('username').value.trim(),
    email: document.getElementById('email').value.trim(),
    address: document.getElementById('address').value.trim(),
    city: document.getElementById('city').value.trim(),
    postal_code: document.getElementById('postal_code').value.trim(),
  };

  const currentPassword = document.getElementById('current_password').value.trim();
  const newPassword = document.getElementById('password').value.trim();

  // Check if sensitive data (password or email) is being changed
  const isSensitiveChange = newPassword.length > 0 || formData.email.length > 0;

  if (isSensitiveChange && currentPassword === "") {
    document.getElementById('message').innerText = 'Please enter your current password to change your email or password.';
    return;
  }

  // Add password fields only if changing password
  if (newPassword.length > 0) {
    formData.current_password = currentPassword;
    formData.new_password = newPassword;
  } else if (formData.email.length > 0) {
    // If only email changed, still send current_password for verification
    formData.current_password = currentPassword;
  }

  try {
    const updateResponse = await fetch('../../backend/api.php?updateProfile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const rawText = await updateResponse.text();
    console.log("Raw response:", rawText);

    let result;
    try {
      result = JSON.parse(rawText);
    } catch (e) {
      console.error("Invalid JSON from server:", rawText);
      document.getElementById('message').innerText = 'Server returned invalid JSON.';
      return;
    }

    if (result.status === 'success') {
      document.getElementById('message').innerText = 'Profile updated successfully!';
      // Clear password fields after successful update
      document.getElementById('current_password').value = '';
      document.getElementById('password').value = '';
    } else {
      document.getElementById('message').innerText = result.message || 'Failed to update profile.';
    }
  } catch (err) {
    console.error('Error updating profile:', err);
    document.getElementById('message').innerText = 'Error updating profile.';
  }
});
