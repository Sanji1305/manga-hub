document.addEventListener('DOMContentLoaded', function() {
    // Get all filter buttons and cards
    const filterBtns = document.querySelectorAll('.filter-btn');
    const genreFilter = document.querySelector('.genre-filter');
    const sortBy = document.querySelector('.sort-by');
    const mangaCards = document.querySelectorAll('.manga-card');

    // Add click event to filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const filterValue = this.dataset.filter;
            filterCards(filterValue, genreFilter.value);
        });
    });

    // Add change event to genre filter
    genreFilter.addEventListener('change', function() {
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        filterCards(activeFilter, this.value);
    });

    // Add change event to sort dropdown
    sortBy.addEventListener('change', function() {
        sortCards(this.value);
    });

    // Function to filter cards
    function filterCards(type, genre) {
        mangaCards.forEach(card => {
            const cardType = card.dataset.type;
            const cardGenres = card.dataset.genres.split(',');
            
            let showCard = true;
            
            // Check type filter
            if (type !== 'all' && cardType !== type) {
                showCard = false;
            }
            
            // Check genre filter
            if (genre && !cardGenres.includes(genre)) {
                showCard = false;
            }
            
            card.style.display = showCard ? 'block' : 'none';
        });
    }

    // Function to sort cards
    function sortCards(sortType) {
        const cardsArray = Array.from(mangaCards);
        const container = document.querySelector('.popular-grid');
        
        cardsArray.sort((a, b) => {
            switch(sortType) {
                case 'rating':
                    const ratingA = parseFloat(a.querySelector('.manga-rating').textContent);
                    const ratingB = parseFloat(b.querySelector('.manga-rating').textContent);
                    return ratingB - ratingA;
                case 'latest':
                    const chapterA = parseInt(a.querySelector('.manga-chapters').textContent.match(/\d+/)[0]);
                    const chapterB = parseInt(b.querySelector('.manga-chapters').textContent.match(/\d+/)[0]);
                    return chapterB - chapterA;
                case 'name':
                    const nameA = a.querySelector('h3').textContent;
                    const nameB = b.querySelector('h3').textContent;
                    return nameA.localeCompare(nameB);
                default:
                    return 0;
            }
        });
        
        // Clear and re-append sorted cards
        container.innerHTML = '';
        cardsArray.forEach(card => container.appendChild(card));
    }

    // Initialize pagination
    const itemsPerPage = 12;
    const pageButtons = document.querySelectorAll('.page-btn');
    let currentPage = 1;

    pageButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.disabled && !this.classList.contains('active')) {
                const newPage = parseInt(this.textContent) || currentPage + (this.innerHTML.includes('right') ? 1 : -1);
                changePage(newPage);
            }
        });
    });

    function changePage(page) {
        currentPage = page;
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        mangaCards.forEach((card, index) => {
            card.style.display = (index >= start && index < end) ? 'block' : 'none';
        });

        // Update pagination buttons
        pageButtons.forEach(btn => {
            const btnPage = parseInt(btn.textContent);
            if (btnPage) {
                btn.classList.toggle('active', btnPage === page);
            }
        });

        // Update prev/next buttons
        const prevBtn = document.querySelector('.page-btn:first-child');
        const nextBtn = document.querySelector('.page-btn:last-child');
        prevBtn.disabled = page === 1;
        nextBtn.disabled = page === Math.ceil(mangaCards.length / itemsPerPage);
    }

    // Initialize with first page
    changePage(1);
}); 