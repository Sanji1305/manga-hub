document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Update profile information
    document.getElementById('username').textContent = currentUser.username;
    document.getElementById('userEmail').textContent = currentUser.email;
    
    // Set bio
    const userBio = document.getElementById('userBio');
    if (currentUser.bio && currentUser.bio.trim()) {
        userBio.textContent = currentUser.bio;
    } else {
        userBio.textContent = 'No bio added yet.';
    }
    
    // Set avatar with default image
    const avatarImg = document.getElementById('userAvatar');
    if (currentUser.avatar) {
        avatarImg.src = currentUser.avatar;
    } else {
        avatarImg.src = 'assets/images/default-avatar.png';
    }
    
    // Handle avatar load error
    avatarImg.onerror = function() {
        this.src = 'assets/images/default-avatar.png';
    };

    // Load user's data
    const readingList = JSON.parse(localStorage.getItem(`${currentUser.username}_readingList`)) || [];
    const favorites = JSON.parse(localStorage.getItem(`${currentUser.username}_favorites`)) || [];
    const history = JSON.parse(localStorage.getItem(`${currentUser.username}_history`)) || [];

    // Update stats
    document.getElementById('readingCount').textContent = readingList.length;
    document.getElementById('favoritesCount').textContent = favorites.length;
    document.getElementById('completedCount').textContent = history.filter(item => item.completed).length;

    // Populate reading list
    const readingListContainer = document.getElementById('readingList');
    readingListContainer.innerHTML = ''; // Clear existing content
    readingList.forEach(manga => {
        readingListContainer.appendChild(createMangaCard(manga));
    });

    // Populate favorites
    const favoritesContainer = document.getElementById('favoritesList');
    favoritesContainer.innerHTML = ''; // Clear existing content
    favorites.forEach(manga => {
        favoritesContainer.appendChild(createMangaCard(manga));
    });

    // Populate history
    const historyContainer = document.getElementById('historyList');
    historyContainer.innerHTML = ''; // Clear existing content
    history.forEach(item => {
        historyContainer.appendChild(createHistoryItem(item));
    });

    // Handle logout
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    // Edit Profile Modal Functionality
    const modal = document.getElementById('editProfileModal');
    const editProfileBtn = document.querySelector('.edit-profile-btn');
    const closeModal = document.querySelector('.close-modal');
    const cancelBtn = document.querySelector('.cancel-btn');
    const editProfileForm = document.getElementById('editProfileForm');
    const avatarInput = document.getElementById('editAvatar');
    const avatarPreview = document.getElementById('avatarPreview');

    // Show modal when edit button is clicked
    editProfileBtn.addEventListener('click', function() {
        // Populate form with current user data
        document.getElementById('editUsername').value = currentUser.username;
        document.getElementById('editEmail').value = currentUser.email;
        document.getElementById('editBio').value = currentUser.bio || '';
        avatarPreview.src = currentUser.avatar || 'https://picsum.photos/200';
        
        // Set preferences if they exist
        if (currentUser.preferences) {
            document.getElementById('prefManga').checked = currentUser.preferences.includes('manga');
            document.getElementById('prefManhwa').checked = currentUser.preferences.includes('manhwa');
            document.getElementById('prefManhua').checked = currentUser.preferences.includes('manhua');
        }
        
        modal.style.display = 'block';
    });

    // Close modal when X is clicked
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // Close modal when cancel is clicked
    cancelBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Handle avatar preview
    avatarInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = function() {
                avatarPreview.src = reader.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Handle form submission
    editProfileForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Get form values
        const newUsername = document.getElementById('editUsername').value;
        const newEmail = document.getElementById('editEmail').value;
        const newPassword = document.getElementById('editPassword').value;
        const confirmPassword = document.getElementById('editConfirmPassword').value;
        const newBio = document.getElementById('editBio').value;

        // Validate passwords if provided
        if (newPassword) {
            if (newPassword !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            if (newPassword.length < 6) {
                alert('Password must be at least 6 characters long!');
                return;
            }
        }

        // Get selected preferences
        const preferences = [];
        if (document.getElementById('prefManga').checked) preferences.push('manga');
        if (document.getElementById('prefManhwa').checked) preferences.push('manhwa');
        if (document.getElementById('prefManhua').checked) preferences.push('manhua');

        // Update user data
        const updatedUser = {
            ...currentUser,
            username: newUsername,
            email: newEmail,
            bio: newBio,
            preferences: preferences
        };

        // Update password if provided
        if (newPassword) {
            updatedUser.password = newPassword;
        }

        // Handle avatar update
        const avatarFile = avatarInput.files[0];
        if (avatarFile) {
            updatedUser.avatar = avatarPreview.src;
        }

        // Save updated user data
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        localStorage.setItem(`user_${updatedUser.username}`, JSON.stringify(updatedUser));

        // Update UI
        document.getElementById('username').textContent = updatedUser.username;
        document.getElementById('userEmail').textContent = updatedUser.email;
        document.getElementById('userBio').textContent = updatedUser.bio || 'No bio added yet.';
        
        if (updatedUser.avatar) {
            document.getElementById('userAvatar').src = updatedUser.avatar;
        } else {
            document.getElementById('userAvatar').src = 'assets/images/default-avatar.png';
        }

        // Close modal
        modal.style.display = 'none';

        // Show success message
        alert('Profile updated successfully!');
    });

    // Function to create manga card
    function createMangaCard(manga) {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${manga.cover}" alt="${manga.title}" onerror="this.src='https://picsum.photos/200/300'">
            <h3>${manga.title}</h3>
            <p>${manga.genres ? manga.genres.join(', ') : 'No genres'}</p>
        `;
        return card;
    }

    // Function to create history item
    function createHistoryItem(item) {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <img src="${item.manga.cover}" alt="${item.manga.title}" onerror="this.src='https://picsum.photos/200/300'">
            <div class="history-info">
                <h4>${item.manga.title}</h4>
                <p>Last read: Chapter ${item.lastChapter}</p>
                <p>${item.completed ? 'Completed' : 'In Progress'}</p>
            </div>
        `;
        return historyItem;
    }
}); 