        // Modal functionality
        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        const modalTitle = document.getElementById('modalTitle');
        const closeButton = document.getElementById('closeModal');

        function openModal(imageSrc, title) {
            modalImage.src = imageSrc;
            modalTitle.textContent = title;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }

        function closeModal() {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto'; // Re-enable scrolling
        }

        // Add click event to all masonry items
        document.addEventListener('DOMContentLoaded', function() {
            const masonryItems = document.querySelectorAll('.masonry-item');
            
            masonryItems.forEach(item => {
                item.addEventListener('click', function() {
                    const image = this.querySelector('.masonry-image');
                    const title = this.querySelector('.title-text').textContent;
                    
                    openModal(
                        image.getAttribute('data-fullsize'),
                        title
                    );
                });
            });
        });

        // Close modal when clicking outside the image
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });

        // Close modal with close button
        closeButton.addEventListener('click', closeModal);