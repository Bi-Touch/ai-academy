import { fetchEntries, fetchHeroAssets } from './contentful-client.js';

document.addEventListener('DOMContentLoaded', () => {
  loadHeroImage(); // Load hero image from Contentful
  lazyLoadSection('events', 'upcomingEvent', renderEventCardList);
  lazyLoadSection('courses', 'aiCourse', renderCourses);
  lazyLoadSection('testimonials', 'successStory', (items, assets) => {
    renderTestimonialCarousel(items, assets);
  });
  lazyLoadSection('news', 'newsArticle', renderNewsWithTags);
  lazyLoadSection('partners', 'partner', renderPartners);

  window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }
  });
});

function lazyLoadSection(sectionId, contentType, renderFn) {
  const section = document.getElementById(sectionId);
  if (!section || section.dataset.loaded) return;
  section.dataset.loaded = 'true';

  const spinner = document.createElement('div');
  spinner.className = 'text-center my-4 spinner-center';
  spinner.innerHTML = `
    <div class="spinner-border text-primary" role="status" aria-live="polite">
      <span class="visually-hidden">Loading ${contentType}...</span>
    </div>
  `;
  section.appendChild(spinner);

  const fetchAndRender = async () => {
    try {
      const { items = [], includes = {} } = await fetchEntries(contentType);
      if (items.length) {
        renderFn(items, includes.Asset || []);
      } else {
        section.innerHTML += `
          <div class="alert alert-warning mt-3" role="alert">
            ⚠️ No ${contentType} found.
          </div>
        `;
      }
    } catch (error) {
      console.error(`Error loading ${contentType}:`, error);
      section.innerHTML += `
        <div class="alert alert-danger mt-3" role="alert">
          ⚠️ Failed to load ${contentType}. Please try again later.
        </div>
      `;
    } finally {
      spinner.remove();
    }
  };

  const observer = new IntersectionObserver((entries, obs) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        fetchAndRender();
        obs.unobserve(entry.target);
      }
    }
  }, { threshold: 0.1 });

  observer.observe(section);

  // ✅ Also load immediately if it's already in view
  const rect = section.getBoundingClientRect();
  if (rect.top < window.innerHeight && rect.bottom >= 0) {
    fetchAndRender();
    observer.unobserve(section);
  }
}

// ================== HERO ==================
async function loadHeroImage() {
  try {
    const result = await fetchHeroAssets();
    const items = result.items || [];
    const assets = result.assets || [];

    console.log('🧩 Hero items:', items);
    console.log('🧩 Linked assets:', assets);

    if (!items.length) {
      console.warn('❌ No hero items returned');
      return;
    }

    const entry = items[0];
    const imageRef = entry.fields?.image;
    const imageId = imageRef?.sys?.id;

    console.log('🔗 Referenced image ID:', imageId);

    const asset = assets.find(a => a.sys.id === imageId);

    if (!asset) {
      console.warn('❌ No asset matched the image ID');
      return;
    }

    const imageUrl = asset.fields?.file?.url;
    const secureUrl = imageUrl?.startsWith('//') ? `https:${imageUrl}` : imageUrl;

    console.log('🌄 Final background image URL:', secureUrl);

    const heroSection = document.getElementById('hero');
    if (!heroSection) {
      console.warn('⚠️ Hero section not found in DOM');
      return;
    }

    if (secureUrl) {
      heroSection.style.backgroundImage = `url(${secureUrl})`;
      console.log("✅ Background applied:", secureUrl);
    } else {
      console.warn('❌ secureUrl is invalid');
    }

    const heroTitle = entry.fields?.heroImage;
    const h1 = heroSection.querySelector('h1');
    if (heroTitle && h1) {
      h1.textContent = heroTitle;
    }
  } catch (err) {
    console.error('❌ Error loading hero image:', err);
  }
}

// ================== TESTIMONIALS ==================

function renderTestimonialCarousel(items, assets = []) {
  const container = document.getElementById('testimonials-carousel');
  if (!container || !items.length) return;

  // Random pastel color generator
  const pastelColor = () =>
    `hsl(${Math.floor(Math.random() * 360)}, 60%, 70%)`;

  container.innerHTML = items.map((item, i) => {
    const { personsName, storyTitle, storyDescription, image } = item.fields || {};
    const imageId = image?.sys?.id;

    const asset = assets.find(a => a.sys.id === imageId);
    const imageUrl = asset?.fields?.file?.url;
    const secureUrl = imageUrl ? (imageUrl.startsWith('//') ? `https:${imageUrl}` : imageUrl) : '';

    const initials = personsName
      ? personsName
          .split(' ')
          .map(n => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : '??';

    const active = i === 0 ? 'active' : '';

    return `
      <div class="carousel-item ${active}">
        <div class="card mx-auto shadow rounded-4 overflow-hidden" style="max-width: 700px; height: 200px;">
          <div class="row g-0 h-100 align-items-center flex-column flex-md-row">

            <div class="col-12 col-md-4 d-flex justify-content-center align-items-center p-3">
              ${
                secureUrl
                  ? `<img src="${secureUrl}" alt="Photo of ${personsName}" 
                         class="img-fluid"
                         style="width: 120px; height: 120px; object-fit: cover; border-radius: 50%;">`
                  : `<div class="d-flex justify-content-center align-items-center" 
                           style="width: 120px; height: 120px; border-radius: 50%; background-color: ${pastelColor()};
                                  font-size: 32px; font-weight: bold; color: #fff;">
                       ${initials}
                     </div>`
              }
            </div>

            <div class="col-12 col-md-8 d-flex align-items-center p-3">
              <div class="card-body text-center text-md-start overflow-hidden">
                <h5 class="card-title mb-1">${personsName || 'Anonymous'}</h5>
                <p class="text-muted mb-2">${storyTitle || ''}</p>
                <p class="card-text mb-0" style="max-height: 120px; overflow-y: auto;">${storyDescription || 'No story available.'}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ================== EVENTS ==================

function renderEventCardList(items) {
  const container = document.getElementById('events-list');
  if (!container || !items.length) return;

  container.innerHTML = `
    <div class="swiper event-swiper">
      <div class="swiper-wrapper">
        ${items.map(item => {
          const { title, eventDate, location, description } = item.fields || {};
          return `
            <div class="swiper-slide">
              <div class="event-card card h-100">
                <div class="card-content">
                  <h3>${title}</h3>
                  <p><strong>Date:</strong> ${eventDate}</p>
                  <p><strong>Location:</strong> ${location}</p>
                  <p class="event-description">${description}</p>
                </div>
                <div class="card-footer">
                  <a href="#" class="btn-outline" aria-label="Register for ${title}">Register</a>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  try {
    const swiperInstance = new Swiper('.event-swiper', {
      slidesPerView: 1,
      spaceBetween: 20,
      loop: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: false,
      },
      breakpoints: {
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      }
    });

    container.querySelectorAll('.event-description').forEach(desc => {
      desc.addEventListener('mouseenter', () => swiperInstance.autoplay.stop());
      desc.addEventListener('mouseleave', () => swiperInstance.autoplay.start());
    });
  } catch (err) {
    console.error('Swiper failed to initialize:', err);
  }
}

// ================== COURSES ==================

function renderCourses(items) {
  const container = document.getElementById('courses-list');
  if (!container || !items.length) return;

  const coursesToShowInitially = 2;
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'courses-wrapper grid-2';
  container.appendChild(wrapper);

  items.forEach((course, i) => {
    const card = document.createElement('div');
    card.className = 'course-card-wrapper';
    card.innerHTML = renderCourseCard(course);
    if (i >= coursesToShowInitially) card.classList.add('hidden-course');
    wrapper.appendChild(card);
  });

  if (items.length <= coursesToShowInitially) return;

  const toggleBtn = document.createElement('button');
  toggleBtn.textContent = 'Show More Courses';
  toggleBtn.className = 'btn btn-outline-primary mt-3';
  toggleBtn.setAttribute('aria-expanded', 'false');
  container.appendChild(toggleBtn);

  let expanded = false;
  toggleBtn.addEventListener('click', () => {
    expanded = !expanded;
    toggleBtn.setAttribute('aria-expanded', expanded);
    toggleBtn.textContent = expanded ? 'Show Less Courses' : 'Show More Courses';
    wrapper.querySelectorAll('.course-card-wrapper').forEach((el, i) => {
      if (i >= coursesToShowInitially) el.classList.toggle('hidden-course', !expanded);
    });
  });
}

function renderCourseCard(item) {
  const { courseTitle, overview, outlineLink, enrollLink } = item.fields;

  const outlineBtn = outlineLink
    ? `<a href="${outlineLink}" target="_blank" class="btn-outline">View Course Outline</a>`
    : '';

  const enrollBtn = enrollLink
    ? `<a href="${enrollLink}" target="_blank" class="btn-enroll">Enroll Now</a>`
    : '';

  const ctaContent = outlineLink || enrollLink
    ? `${outlineBtn}${enrollBtn}`
    : `<span class="coming-soon">🚧 Coming Soon</span>`;

  return `
    <div class="card course-card">
      <div class="card-content">
        <h3>${courseTitle}</h3>
        <p>${overview}</p>
      </div>
      <div class="card-cta">${ctaContent}</div>
    </div>
  `;
}

// ================== NEWS ==================

function renderNewsWithTags(items) {
  const container = document.getElementById('news-list');
  const filterContainer = document.getElementById('tag-filters');
  if (!container || !filterContainer) return;

  const tagSet = new Set();

  items.forEach(item => {
    const rawTags = item.fields.tags;
    let tags = Array.isArray(rawTags)
      ? rawTags
      : typeof rawTags === 'string'
        ? rawTags.split(',').map(tag => tag.trim())
        : [];

    tags.forEach(tag => tagSet.add(tag));
  });

  filterContainer.innerHTML = `
    <div class="btn-group mb-3" role="group" aria-label="Tag Filters">
      <button data-tag="all" class="btn btn-outline-primary active">All</button>
      ${[...tagSet].sort().map(tag => `
        <button data-tag="${tag.toLowerCase()}" class="btn btn-outline-primary">${tag}</button>
      `).join('')}
    </div>
  `;

  filterContainer.addEventListener('click', e => {
    const btn = e.target.closest('[data-tag]');
    if (!btn) return;

    const selectedTag = btn.dataset.tag.toLowerCase();
    filterContainer.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filteredItems = selectedTag === 'all'
      ? items
      : items.filter(item => {
          const rawTags = item.fields.tags;
          const tagList = Array.isArray(rawTags)
            ? rawTags.map(tag => tag.toLowerCase())
            : typeof rawTags === 'string'
              ? rawTags.split(',').map(tag => tag.trim().toLowerCase())
              : [];
          return tagList.includes(selectedTag);
        });

    renderNewsList(filteredItems, container);
  });

  const defaultBtn = filterContainer.querySelector('[data-tag="all"]');
  if (defaultBtn) defaultBtn.click();
}

function renderNewsList(newsItems, container) {
  container.innerHTML = newsItems.length
    ? newsItems.map(renderNewsCard).join('')
    : `<div class="alert alert-warning mt-3" role="alert">⚠️ No articles found for this tag.</div>`;
}

function renderNewsCard(item) {
  const { headline, summary, publishDate, tags } = item.fields;

  const title = headline || "Untitled";
  const date = publishDate
    ? new Date(publishDate).toLocaleDateString()
    : "TBA";

  const tagBadges = Array.isArray(tags)
    ? tags.map(tag => `<span class="badge bg-secondary me-1">${tag}</span>`).join('')
    : '';

  return `
    <div class="card mb-3 shadow-sm">
      <div class="card-body">
        <h4 class="card-title">${title}</h4>
        <p><strong>Date:</strong> ${date}</p>
        <p>${summary || "No summary available."}</p>
        <div class="tags mt-2">${tagBadges}</div>
      </div>
    </div>
  `;
}

// ================== PARTNERS ==================

function renderPartners(partners, assets = []) {
  const container = document.getElementById('partners-list');
  container.innerHTML = '';

  partners.forEach(partner => {
    const { name, websiteUrl, logo } = partner.fields;

    const logoId = logo?.sys?.id;
    const matchedAsset = assets.find(asset => asset.sys.id === logoId);
    const logoUrl = matchedAsset?.fields?.file?.url
      ? `https:${matchedAsset.fields.file.url}`
      : null;

    const partnerHTML = `
      <div class="col-6 col-md-3 text-center">
        ${websiteUrl ? `<a href="${websiteUrl}" target="_blank" rel="noopener">` : ''}
          ${logoUrl ? `<img src="${logoUrl}" alt="${name}" class="partner-logo mb-2" />` : `<p>${name}</p>`}
        ${websiteUrl ? `</a>` : ''}
      </div>
    `;

    container.insertAdjacentHTML('beforeend', partnerHTML);
  });
}
