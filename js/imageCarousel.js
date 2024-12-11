document.addEventListener('DOMContentLoaded', function() {
    function initializeCarousel(carouselId) {
        const carousel = document.querySelector(`#${carouselId} .carousel-inner`);
        const items = document.querySelectorAll(`#${carouselId} .carousel-item`);
        const prevButton = document.querySelector(`#${carouselId} .carousel-control-prev`);
        const nextButton = document.querySelector(`#${carouselId} .carousel-control-next`);
        const dots = document.querySelectorAll(`#${carouselId} .dot`);
        let currentIndex = 0;

        function updateCarousel() {
            const offset = -currentIndex * 100;
            carousel.style.transform = `translateX(${offset}%)`;
            items.forEach((item, index) => {
                item.classList.toggle('active', index === currentIndex);
            });
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }

        prevButton.addEventListener('click', function(event) {
            event.preventDefault();
            currentIndex = (currentIndex > 0) ? currentIndex - 1 : items.length - 1;
            updateCarousel();
        });

        nextButton.addEventListener('click', function(event) {
            event.preventDefault();
            currentIndex = (currentIndex < items.length - 1) ? currentIndex + 1 : 0;
            updateCarousel();
        });

        dots.forEach((dot, index) => {
            dot.addEventListener('click', function() {
                currentIndex = index;
                updateCarousel();
            });
        });

        updateCarousel(); 
    }

    initializeCarousel('carouselFigma');
    initializeCarousel('carouselSketch');
});
  
function openFullscreen(carouselId) {
    const carousel = document.querySelector(`#${carouselId} .carousel-item.active img`);
    const fullscreenPanel = document.getElementById('fullscreenPanel');
    const fullscreenImage = document.getElementById('fullscreenImage');

    fullscreenImage.src = carousel.src;
    fullscreenPanel.style.display = 'flex';
    document.body.classList.add('no-scroll'); 

    if (carousel.src.includes('figma')) {
        fullscreenImage.style.width = '60%';
    } else if (carousel.src.includes('sketch')) {
        fullscreenImage.style.width = '37%';
    } 
}

function closeFullscreen() {
    const fullscreenPanel = document.getElementById('fullscreenPanel');
    fullscreenPanel.style.display = 'none';
    document.body.classList.remove('no-scroll'); 
}
