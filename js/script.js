document.addEventListener('DOMContentLoaded', () => {
    // --- Hamburger Menu Functionality ---
    const hamburger = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');
    const dropdownToggles = document.querySelectorAll('.dropdown-nav > a'); // Select direct dropdown links

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('nav-open');
        hamburger.classList.toggle('active');
    });

    // Close mobile menu when a nav link is clicked
    navLinks.querySelectorAll('a:not(.dropdown-arrow)').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('nav-open')) {
                navLinks.classList.remove('nav-open');
                hamburger.classList.remove('active');
            }
        });
    });

    // Handle dropdowns on mobile (toggle instead of hover)
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) { // Apply only on mobile
                e.preventDefault(); // Prevent default link behavior for dropdown toggles
                const parentLi = toggle.closest('.dropdown-nav');
                parentLi.classList.toggle('active'); // Toggle 'active' class on parent li
                const dropdownMenu = parentLi.querySelector('.dropdown-menu');
                if (dropdownMenu) {
                    // Simple toggle display for mobile dropdowns
                    dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
                }
            }
        });
    });

    // Close dropdowns if resized to desktop view
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            navLinks.classList.remove('nav-open');
            hamburger.classList.remove('active');
            dropdownToggles.forEach(toggle => {
                const parentLi = toggle.closest('.dropdown-nav');
                parentLi.classList.remove('active');
                const dropdownMenu = parentLi.querySelector('.dropdown-menu');
                if (dropdownMenu) {
                    dropdownMenu.style.display = ''; // Reset display style
                }
            });
        }
    });


    // --- Reveal on Scroll Animation ---
    const revealElements = document.querySelectorAll('.reveal-on-scroll');

    const observerOptions = {
        root: null, // relative to the viewport
        rootMargin: '0px',
        threshold: 0.1 // Percentage of the target element which is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Stop observing once visible
            }
        });
    }, observerOptions);

    revealElements.forEach(el => {
        observer.observe(el);
    });

    // Optional: Smooth scroll for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});
function copyVPA() {
            const vpaId = document.getElementById('vpaId').innerText; // VPA ID-ஐ பெறுகிறது
            navigator.clipboard.writeText(vpaId).then(() => { // VPA ID-ஐ கிளிப்போர்டுக்கு காப்பி செய்கிறது
                alert('UPI ID copied to clipboard!'); // காப்பி செய்யப்பட்டவுடன் ஒரு அலர்ட் காட்டுகிறது
            }).catch(err => {
                console.error('Failed to copy text: ', err); // காப்பி செய்ய முடியாவிட்டால் எர்ரரைக் காட்டுகிறது
            });
        }