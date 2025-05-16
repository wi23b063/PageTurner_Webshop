document.addEventListener("DOMContentLoaded", async () => {
    try {
      const response = await fetch('../../backend/api.php?checkSession');
      const data = await response.json();
  
      if (data.status === 'success' && data.user) {
        // Prefill fields (leave out passwords)
        document.getElementById('firstname').value = data.user.firstname || '';
        document.getElementById('lastname').value = data.user.lastname || '';
        document.getElementById('username').value = data.user.username || '';
        document.getElementById('email').value = data.user.email || '';
        document.getElementById('address').value = data.user.address || '';
        document.getElementById('city').value = data.user.city || '';
        document.getElementById('postal_code').value = data.user.postal_code || '';
      }
    } catch (err) {
      console.error('Error fetching session data:', err);
    }
  });
  
  document.getElementById('profileForm').addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const formData = {
      firstname: document.getElementById('firstname').value,
      lastname: document.getElementById('lastname').value,
      username: document.getElementById('username').value,
      email: document.getElementById('email').value,
      address: document.getElementById('address').value,
      city: document.getElementById('city').value,
      postal_code: document.getElementById('postal_code').value,
    };
  
    const currentPassword = document.getElementById('current_password').value.trim();
    const newPassword = document.getElementById('password').value.trim();
  
    // If user wants to change password or email, require current password
    const isSensitiveChange = newPassword.length > 0;
  
    if (isSensitiveChange && currentPassword === "") {
      document.getElementById('message').innerText = 'Please enter your current password to change your password.';
      return;
    }
  
    // Add password fields only if needed
    if (isSensitiveChange) {
      formData.current_password = currentPassword;
      formData.new_password = newPassword;
    }
  
    try {
  const updateResponse = await fetch('../../backend/api.php?updateProfile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  const rawText = await updateResponse.text(); // Read raw response
  console.log("Raw response:", rawText); // Log raw response

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
  } else {
    document.getElementById('message').innerText = result.message || 'Failed to update profile.';
  }
} catch (err) {
  console.error('Error updating profile:', err);
  document.getElementById('message').innerText = 'Error updating profile.';
}
  });
  