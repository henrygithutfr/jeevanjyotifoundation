const counters = document.querySelectorAll(".count");
const speed = 200; // lower = faster

const runCounter = (counter) => {
    const target = +counter.getAttribute("data-target");
    let count = +counter.innerText;
    const increment = target / speed;

    const update = () => {
        count += increment;
        if (count < target) {
            counter.innerText = Math.ceil(count);
            requestAnimationFrame(update);
        } else {
            counter.innerText = target;
        }
    };
    update();
};

// Observe each counter individually
const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            runCounter(entry.target);
            observer.unobserve(entry.target); // stop observing after animation
        }
    });
}, { threshold: 0.5 });

counters.forEach(counter => observer.observe(counter));



// Footer Section 
        document.addEventListener('DOMContentLoaded', function() {
            const contactForm = document.getElementById('contactForm');
            
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Get form values
                const name = document.getElementById('name').value;
                const email = document.getElementById('email').value;
                const subject = document.getElementById('subject').value;
                
                // In a real application, you would send this data to a server
                // For this example, we'll just show an alert
                alert(`Thank you ${name}! Your message has been sent successfully. We'll get back to you at ${email} regarding your ${subject} inquiry.`);
                
                // Reset the form
                contactForm.reset();
            });
        });