document.addEventListener("DOMContentLoaded", function () {
  // Fetch the JSON data
  fetch('json/carousel.json')
      .then(response => response.json())
      .then(data => {
          const swiperWrapper = document.getElementById('swiperWrapper');
          const slides = data.swiper.slides;

          // Dynamically create slide elements
          slides.forEach(slide => {
              const slideElement = document.createElement('div');
              slideElement.classList.add('swiper-slide');

              const anchor = document.createElement('a');
              anchor.href = slide.link;

              const img = document.createElement('img');
              img.src = slide.image.src;
              img.alt = slide.image.alt;

              anchor.appendChild(img);
              slideElement.appendChild(anchor);
              swiperWrapper.appendChild(slideElement);
          });

          // Initialize the Swiper
          new Swiper('.mySwiper', {
              slidesPerView: 1,
              spaceBetween: 20,
              loop: true,
              grabCursor: true,
              navigation: {
                  nextEl: '.swiper-button-next',
                  prevEl: '.swiper-button-prev',
              },
              pagination: {
                  el: '.swiper-pagination',
                  clickable: true,
              },
              breakpoints: {
                  640: {
                      slidesPerView: 2,
                  },
                  1024: {
                      slidesPerView: 3,
                  },
              },
          });
      })
      .catch(error => {
          console.error('Error loading JSON:', error);
      });
});