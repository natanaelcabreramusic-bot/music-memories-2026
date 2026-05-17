const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const immersiveScenes = [
  {
    number: '01',
    title: 'Classroom Moments',
    image: './classroom/classroom-01.jpg',
    alt: 'Classroom music memory',
  },
  {
    number: '02',
    title: 'Dance',
    image: './rehearsals/rehearsal-01.jpg',
    alt: 'Rehearsal memory',
  },
  {
    number: '03',
    title: 'Theater',
    image: './assets/images/theater-scene.jpg',
    alt: 'Theater performance memory',
  },
  {
    number: '04',
    title: 'Grandparents Day',
    image: './worship/worship-01.jpg',
    alt: 'Worship arts memory',
  },
];

const storyReel = document.querySelector('.story-reel');

if (storyReel) {
  storyReel.innerHTML = immersiveScenes.map((scene) => `
    <article class="story-scene reveal">
      <button class="scene-image" type="button" data-modal-title="${scene.title}" data-modal-type="photo" data-modal-src="${scene.image}">
        <img src="${scene.image}" alt="${scene.alt}" loading="lazy" />
        <span class="scene-caption">${scene.title}</span>
      </button>
      <div class="scene-copy">
        <span class="number">${scene.number}</span>
        <h3>${scene.title}</h3>
      </div>
    </article>
  `).join('');
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const parallaxElements = [...document.querySelectorAll('[data-parallax]')];
let ticking = false;

function updateParallax() {
  const viewportHeight = window.innerHeight || 1;
  parallaxElements.forEach((element) => {
    const speed = Number(element.dataset.speed || 0.1);
    const rect = element.getBoundingClientRect();
    const progress = (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight;
    element.style.setProperty('--parallax', `${progress * speed * 120}px`);
  });
  ticking = false;
}

function requestParallax() {
  if (!ticking) {
    window.requestAnimationFrame(updateParallax);
    ticking = true;
  }
}

if (parallaxElements.length) {
  updateParallax();
  window.addEventListener('scroll', requestParallax, { passive: true });
  window.addEventListener('resize', requestParallax);
}

const featuredPreview = document.querySelector('.featured-preview');

if (featuredPreview) {
  featuredPreview.muted = true;
  featuredPreview.defaultMuted = true;
  featuredPreview.playsInline = true;

  const startFeaturedPreview = () => {
    const playAttempt = featuredPreview.play();
    if (playAttempt?.catch) playAttempt.catch(() => {
      featuredPreview.setAttribute('controls', '');
    });
  };

  if (featuredPreview.readyState >= 2) startFeaturedPreview();
  else featuredPreview.addEventListener('loadeddata', startFeaturedPreview, { once: true });

  featuredPreview.addEventListener('error', () => {
    featuredPreview.poster = 'featured-film/film-poster.jpg';
  });
}


const modal = document.querySelector('.media-modal');
const modalContent = document.querySelector('.modal-content');
const modalTitle = document.querySelector('.modal-title');
const closeModal = document.querySelector('.modal-close');

function openMediaModal(trigger) {
  if (!modal || !modalContent || !modalTitle) return;

  const title = trigger.dataset.modalTitle || 'Memory';
  const type = trigger.dataset.modalType || 'photo';
  const src = trigger.dataset.modalSrc || '';
  modal.dataset.modalType = type;
  modalTitle.textContent = title;

  if (!src) {
    modalContent.innerHTML = `<div class="placeholder">Media placeholder for ${title}</div>`;
  } else if (type === 'video') {
    modalContent.innerHTML = `<video src="${src}" controls autoplay playsinline></video>`;
  } else {
    modalContent.innerHTML = `<img src="${src}" alt="${title}" onerror="this.replaceWith(Object.assign(document.createElement('div'), { className: 'placeholder', textContent: 'Add media file: ${src}' }))" />`;
  }

  if (typeof modal.showModal === 'function') modal.showModal();
  else modal.setAttribute('open', '');
}

function clearMediaModal() {
  if (!modal || !modalContent) return;
  modalContent.querySelectorAll('video, audio').forEach((media) => media.pause());
  modalContent.innerHTML = '';
  delete modal.dataset.modalType;
}

document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-modal-title]');
  if (trigger) openMediaModal(trigger);
});

closeModal?.addEventListener('click', () => modal?.close());
modal?.addEventListener('click', (event) => {
  if (event.target === modal) modal.close();
});
modal?.addEventListener('close', clearMediaModal);

const journeyAudio = document.querySelector('#journey-audio');
const audioControl = document.querySelector('.audio-control');
const audioTitle = audioControl?.querySelector('strong');
const audioSubtitle = audioControl?.querySelector('small');

function setAudioButtonState(isPlaying) {
  if (!audioControl) return;

  audioControl.classList.toggle('is-playing', isPlaying);
  audioControl.setAttribute('aria-pressed', String(isPlaying));
  audioControl.setAttribute('aria-label', isPlaying ? 'Pause the Journey soundtrack' : 'Play the Journey soundtrack');
  if (audioTitle) audioTitle.textContent = isPlaying ? 'Pause the Journey' : 'Play the Journey';
  if (audioSubtitle) audioSubtitle.textContent = 'Original soundtrack';
}

if (journeyAudio && audioControl) {
  journeyAudio.src = './audio/main-theme.mp3';
  journeyAudio.preload = 'metadata';
  journeyAudio.volume = 0.82;

  audioControl.addEventListener('click', async () => {
    if (journeyAudio.paused) {
      try {
        await journeyAudio.play();
        setAudioButtonState(true);
      } catch (error) {
        setAudioButtonState(false);
      }
    } else {
      journeyAudio.pause();
      setAudioButtonState(false);
    }
  });

  journeyAudio.addEventListener('pause', () => setAudioButtonState(false));
  journeyAudio.addEventListener('ended', () => setAudioButtonState(false));
  journeyAudio.addEventListener('play', () => setAudioButtonState(true));
}
