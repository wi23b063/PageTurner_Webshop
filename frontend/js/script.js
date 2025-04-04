document.getElementbyId("registerForm").addEventListener("submit", function(event){ //Registration Form
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


document.getElementbyId("loginForm").addEventListener("submit", function(event){ //Login Form
        event.preventDefault();

        $(".error").text("");
        $("#error_message").hide();

        let username = $("#username").val().trim();
        let password = $("#password").val().trim();
        let isValid = true;

        if (username === "") {
            $("#username_error").text("Please enter your username.");
            isValid = false;
        }
        if (password === "") {
            $("#password_error").text("Please enter your password.");
            isValid = false;
        }

        if (!isValid) return;

        $.ajax({
            url: "UserLogin.php",
            type: "POST",
            data: { username: username, password: password },
            dataType: "json",
            success: function(response) {
                if (response.success) {
                    window.location.href = "index.php";
                } else {
                    $("#error_message").text(response.message).show();
                }
            },
            error: function() {
                $("#error_message").text("An error occured.").show();
            }
        });
});