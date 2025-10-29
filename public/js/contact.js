document.getElementById("contactForm").addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent immediate submission

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const subject = document.getElementById("subject").value;
    const message = document.getElementById("message").value.trim();

    // Basic validation
    if (!name || !email || !subject || !message) {
        alert("Please fill in all required fields.");
        return;
    }

    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    // Optional: Phone validation if filled
    if (phone && !/^[0-9+\-\s]{8,15}$/.test(phone)) {
        alert("Please enter a valid phone number (8–15 digits).");
        return;
    }

    // If everything looks fine, submit the form
    this.submit();
});
