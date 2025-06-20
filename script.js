document.addEventListener('DOMContentLoaded', function() {
    const slider = document.querySelector('.slider');
    const slides = document.querySelectorAll('.slide');
    const dotsContainer = document.querySelector('.slider-dots');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    let currentSlide = 0;
    const totalSlides = slides.length;
    
    // Create dots
    slides.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
    
    const dots = document.querySelectorAll('.dot');
    
    // Function to update slide position
    function updateSlide() {
        slider.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        // Update dots
        dots.forEach(dot => dot.classList.remove('active'));
        dots[currentSlide].classList.add('active');
    }
    
    // Function to go to specific slide
    function goToSlide(index) {
        currentSlide = index;
        updateSlide();
    }
    
    // Next slide function
    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateSlide();
    }
    
    // Previous slide function
    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateSlide();
    }
    
    // Event listeners for buttons
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);
    
    // Auto slide every 5 seconds
    let slideInterval = setInterval(nextSlide, 5000);
    
    // Pause auto-slide on hover
    slider.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });
    
    // Resume auto-slide when mouse leaves
    slider.addEventListener('mouseleave', () => {
        slideInterval = setInterval(nextSlide, 5000);
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevSlide();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
        }
    });

    // Theme Toggle Functionality
    function initTheme() {
        const themeToggle = document.getElementById('theme-toggle');
        const themeIcon = themeToggle.querySelector('i');
        
        // Check for saved theme preference or use system preference
        const savedTheme = localStorage.getItem('theme');
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const currentTheme = savedTheme || systemTheme;
        
        // Apply saved theme
        if (currentTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeIcon.classList.replace('fa-moon', 'fa-sun');
        }
        
        // Theme toggle event listener
        themeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            
            if (isDark) {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                themeIcon.classList.replace('fa-sun', 'fa-moon');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                themeIcon.classList.replace('fa-moon', 'fa-sun');
            }
        });
    }

    // Initialize theme when DOM is loaded
    initTheme();

    // Handle Read Now and Add to List buttons
    document.addEventListener('DOMContentLoaded', () => {
        // Read Now buttons
        const readNowButtons = document.querySelectorAll('.read-now');
        readNowButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const category = e.target.closest('.category');
                const title = category.querySelector('h3').textContent;
                // Redirect to the reading page (you can customize the URL)
                window.location.href = `read.html?title=${encodeURIComponent(title)}`;
            });
        });

        // Add to List buttons
        const addListButtons = document.querySelectorAll('.add-list');
        addListButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const category = e.target.closest('.category');
                const title = category.querySelector('h3').textContent;
                const img = category.querySelector('img').src;
                
                // Add to reading list
                addToReadingList(title, img);
                
                // Change button state
                button.innerHTML = '<i class="fas fa-check"></i> Added';
                button.style.background = '#28a745';
                
                // Reset after 2 seconds
                setTimeout(() => {
                    button.innerHTML = '<i class="fas fa-plus"></i> Add to List';
                    button.style.background = '';
                }, 2000);
            });
        });
    });

    // Function to add manga/manhwa to reading list
    function addToReadingList(title, image) {
        // Get existing list from localStorage
        let readingList = JSON.parse(localStorage.getItem('readingList')) || [];
        
        // Check if already in list
        if (!readingList.some(item => item.title === title)) {
            readingList.push({
                title,
                image,
                addedDate: new Date().toISOString()
            });
            
            // Save updated list
            localStorage.setItem('readingList', JSON.stringify(readingList));
            
            // Show success message
            showNotification(`${title} added to your reading list!`);
        } else {
            showNotification(`${title} is already in your reading list!`, 'info');
        }
    }

    // Function to show notifications
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = message;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Add notification styles
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 1rem 2rem;
            border-radius: 5px;
            color: white;
            font-size: 0.9rem;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        }
        
        .notification.success {
            background: #28a745;
        }
        
        .notification.info {
            background: #17a2b8;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}); 