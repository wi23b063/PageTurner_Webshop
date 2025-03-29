document.getElementbyId("registerForm").addEventListener("submit", function(event){
    event.preventDefault(); // prevents the submit without reload

    let username = $("#username").val();
    console.log(username);
    let confirmPassword = $("#confirm_password").val();
    let messageDiv = $("message").val(); //errors
    
    if (password.length < 8) {
        messageDiv.innerHTML = "The password must be at least 8 characters long.";
        messageDiv.className = "error-message";
        return;
    }

    if (password !== confirmPassword) {
        messageDiv.innerHTML = "The passwords do not match.";
        messageDiv.className = "error-message";
        return;
    }


    let formData = new FormData(this); //send form data to backend using fetch api

    fetch("backend/userRegistration.php", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        messageDiv.innerHTML = data.message;
        messageDiv.className = data.status === "success" ? "success-message" : "error-message";

        if (data.status === "success"){
            setTimeout(() => {
                window.location.href = "index.php";
            }, 2000);
        } //if registration successful redirect to index after 2sec
    })

    .catch(error => console.error("Error:", error));

});