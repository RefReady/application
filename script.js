// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Contact Form Handling
document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    
    // Simple validation
    if (!data.name || !data.email || !data.role || !data.message) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        alert('Please enter a valid email address.');
        return;
    }
    
    // Simulate form submission
    const submitButton = this.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        alert('Thank you for your message! We\'ll get back to you within 24 hours.');
        this.reset();
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }, 2000);
});

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.feature-card, .testimonial-card, .pricing-card, .step, .problem-item');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Phone mockup interactive features
document.addEventListener('DOMContentLoaded', function() {
    const featureItems = document.querySelectorAll('.feature-item');
    let currentIndex = 0;
    
    function highlightFeature() {
        featureItems.forEach((item, index) => {
            item.style.opacity = index === currentIndex ? '1' : '0.7';
            item.style.transform = index === currentIndex ? 'translateX(5px)' : 'translateX(0)';
        });
        
        currentIndex = (currentIndex + 1) % featureItems.length;
    }
    
    // Start the animation
    if (featureItems.length > 0) {
        setInterval(highlightFeature, 2000);
    }
});

// CTA Button Click Tracking
document.querySelectorAll('.btn-primary, .cta-button').forEach(button => {
    button.addEventListener('click', function(e) {
        // Only track if it's a CTA button, not a form submit
        if (this.tagName === 'A') {
            // Add analytics tracking here
            console.log('CTA clicked:', this.textContent);
        }
    });
});

// Pricing Card Hover Effects
document.querySelectorAll('.pricing-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        if (this.classList.contains('featured')) {
            this.style.transform = 'scale(1.05)';
        } else {
            this.style.transform = 'translateY(0) scale(1)';
        }
    });
});

// Statistics Animation
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    
    stats.forEach(stat => {
        const target = parseInt(stat.textContent);
        const increment = target / 100;
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            if (stat.textContent.includes('%')) {
                stat.textContent = Math.floor(current) + '%';
            } else if (stat.textContent.includes('+')) {
                stat.textContent = Math.floor(current) + '+';
            } else {
                stat.textContent = Math.floor(current);
            }
        }, 20);
    });
}

// Trigger stats animation when hero section is visible
const heroSection = document.querySelector('.hero');
const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateStats();
            heroObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

if (heroSection) {
    heroObserver.observe(heroSection);
}

// Handle CTA button clicks - only for actual placeholder links
document.querySelectorAll('a[href="#"]:not(.trial-link)').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        // For demo purposes only - real links should have proper href
        console.log('Demo link clicked:', this.textContent);
    });
});

// Responsive image loading
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
});

// Testimonial rotation
document.addEventListener('DOMContentLoaded', function() {
    const testimonials = document.querySelectorAll('.testimonial-card');
    let currentTestimonial = 0;
    
    function rotateTestimonials() {
        testimonials.forEach((testimonial, index) => {
            if (index === currentTestimonial) {
                testimonial.style.transform = 'scale(1.05)';
                testimonial.style.boxShadow = '0 20px 40px rgba(108, 92, 231, 0.2)';
            } else {
                testimonial.style.transform = 'scale(1)';
                testimonial.style.boxShadow = 'none';
            }
        });
        
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    }
    
    if (testimonials.length > 0) {
        setInterval(rotateTestimonials, 4000);
    }
});

// Social proof notifications
function showSocialProof() {
    const notifications = [
        "🎉 Sarah from Adelaide Netball just started her free trial!",
        "👥 Metro Netball Club upgraded to the full plan!",
        "🏆 15-year-old Emma just earned her Confident Call badge!",
        "📊 Riverside Club saw 60% improvement in referee retention!",
        "🎖️ 50+ new referees joined RefReady this week!"
    ];
    
    const notification = document.createElement('div');
    notification.className = 'social-proof-notification';
    notification.innerHTML = notifications[Math.floor(Math.random() * notifications.length)];
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #6C5CE7, #A29BFE);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 500;
        z-index: 1001;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
        cursor: pointer;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
    
    // Click to dismiss
    notification.addEventListener('click', function() {
        this.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(this);
        }, 300);
    });
}

// Show social proof notifications periodically
setInterval(showSocialProof, 15000);

// Show first notification after 3 seconds
setTimeout(showSocialProof, 3000); 