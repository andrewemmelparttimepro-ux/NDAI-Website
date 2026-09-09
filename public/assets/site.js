(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const track = (name, data = {}) => window.ndaiTrack?.(name, data);
  const ham = $('#ham');
  const menu = $('#mob-menu');
  const mobile = matchMedia('(max-width: 640px)');
  const closeMenu = (returnFocus = false) => {
    menu.classList.remove('open');
    menu.inert = true;
    ham.setAttribute('aria-expanded', 'false');
    ham.setAttribute('aria-label', 'Open menu');
    if (returnFocus) ham.focus();
  };
  ham.addEventListener('click', () => {
    if (menu.classList.contains('open')) return closeMenu(true);
    menu.inert = false;
    menu.classList.add('open');
    ham.setAttribute('aria-expanded', 'true');
    ham.setAttribute('aria-label', 'Close menu');
    menu.querySelector('a').focus();
  });
  document.addEventListener('keydown', (event) => {
    if (!menu.classList.contains('open')) return;
    if (event.key === 'Escape') { event.preventDefault(); closeMenu(true); }
    if (event.key === 'Tab') {
      const links = [...menu.querySelectorAll('a')];
      const first = links[0], last = links.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); ham.focus(); }
      else if (event.shiftKey && document.activeElement === ham) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); ham.focus(); }
      else if (!event.shiftKey && document.activeElement === ham) { event.preventDefault(); first.focus(); }
    }
  });
  document.addEventListener('click', (event) => {
    if (!menu.contains(event.target) && !ham.contains(event.target)) closeMenu();
  });
  mobile.addEventListener('change', () => closeMenu());
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    closeMenu();
    const section = $(link.hash);
    if (section) {
      section.setAttribute('tabindex', '-1');
      section.focus({ preventScroll: true });
    }
  }));

  // A single accessible list, with motion only when the visitor explicitly starts it.
  const strip = $('#mq'), play = $('#mq-play');
  $('.mq-controls').hidden = false;
  let frame = null, lastTime = null, playing = false;
  const stop = () => {
    playing = false;
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null; lastTime = null;
    strip.classList.remove('is-playing');
    play.textContent = 'Play'; play.setAttribute('aria-pressed', 'false');
  };
  const tick = (time) => {
    if (!playing) return;
    if (lastTime !== null) strip.scrollLeft += Math.min(time - lastTime, 50) * 0.025;
    lastTime = time;
    if (strip.scrollLeft >= strip.scrollWidth - strip.clientWidth - 1) strip.scrollLeft = 0;
    frame = requestAnimationFrame(tick);
  };
  play.addEventListener('click', () => {
    if (playing) return stop();
    if (reducedMotion.matches) return;
    playing = true;
    strip.classList.add('is-playing');
    play.textContent = 'Pause'; play.setAttribute('aria-pressed', 'true');
    frame = requestAnimationFrame(tick);
  });
  const move = (direction) => {
    stop();
    strip.scrollBy({ left: direction * (strip.querySelector('.mq-card').getBoundingClientRect().width + 18), behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  };
  $('#mq-prev').addEventListener('click', () => move(-1));
  $('#mq-next').addEventListener('click', () => move(1));
  strip.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); }
  });
  ['pointerdown', 'mouseenter', 'focusin', 'wheel'].forEach((type) => strip.addEventListener(type, stop, { passive: true }));
  const motionPreference = () => { stop(); play.hidden = reducedMotion.matches; };
  reducedMotion.addEventListener('change', motionPreference);
  motionPreference();
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });

  // Preserve a small, silent ghost in the empty desktop gutter. It never intercepts a click.
  const ghost = $('#ghost'), ghostToggle = $('#ghost-toggle');
  let ghostEnabled = true;
  try { ghostEnabled = localStorage.getItem('ndai-ghost') !== 'off'; } catch {}
  ghostToggle.hidden = false;
  const paintGhost = () => {
    ghost.classList.toggle('show', ghostEnabled && innerWidth >= 1280 && !document.hidden && !$('#consult-form').contains(document.activeElement));
    ghostToggle.textContent = ghostEnabled ? 'Hide ghost' : 'Show ghost';
    ghostToggle.setAttribute('aria-pressed', String(ghostEnabled));
  };
  ghostToggle.addEventListener('click', () => {
    ghostEnabled = !ghostEnabled;
    try { localStorage.setItem('ndai-ghost', ghostEnabled ? 'on' : 'off'); } catch {}
    paintGhost();
  });
  ['resize', 'focusin', 'focusout', 'visibilitychange'].forEach((type) => window.addEventListener(type, paintGhost));
  paintGhost();

  const form = $('#consult-form'), status = $('#form-status');
  const projectNames = ['Hit Zero', 'SandPro OMP', 'Thrawn', 'Spas 360'];
  const setProject = (project) => {
    if (!projectNames.includes(project)) return;
    $('#f-project').value = project;
    $('#project-context').textContent = `You're asking about ${project}. Andrew will follow up with the next step.`;
    $('#project-context').hidden = false;
    $('#f-int').value = 'Project demo';
  };
  setProject(new URLSearchParams(location.search).get('project'));
  document.querySelectorAll('[data-project]').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    setProject(link.dataset.project);
    $('#contact').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    history.replaceState(null, '', '/?project=' + encodeURIComponent(link.dataset.project) + '#contact');
    $('#f-name').focus({ preventScroll: true });
    track('project_inquiry', { project: link.dataset.project });
  }));
  document.querySelectorAll('[data-interest]').forEach((link) => link.addEventListener('click', () => {
    $('#f-int').value = link.dataset.interest;
    $('#f-project').value = '';
    $('#project-context').hidden = true;
    history.replaceState(null, '', location.pathname + '#contact');
    track('service_inquiry', { service: link.dataset.interest });
  }));
  document.querySelectorAll('a[href="#contact"]:not([data-interest])').forEach((link) => link.addEventListener('click', () => {
    track('consultation_click', { location: link.closest('nav') ? 'navigation' : link.closest('header') ? 'hero' : 'page' });
  }));
  document.querySelectorAll('a[href^="mailto:"],a[href^="tel:"]').forEach((link) => link.addEventListener('click', () => {
    track('contact_click', { method: link.protocol === 'tel:' ? 'phone' : 'email' });
  }));
  let started = false, submitting = false;
  form.addEventListener('input', () => { if (!started) { started = true; track('inquiry_started'); } });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting || !form.reportValidity()) return;
    if (form.elements._honey.value) return;
    submitting = true;
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    submit.textContent = 'Sending…';
    form.setAttribute('aria-busy', 'true');
    status.dataset.state = 'pending';
    status.textContent = 'Sending your request. Please keep this page open.';
    const payload = Object.fromEntries(new FormData(form));
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch('https://formsubmit.co/ajax/andrew@ndai.pro', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload), signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok || !(result.success === true || result.success === 'true')) throw new Error('Submission not confirmed');
      status.dataset.state = 'success';
      status.textContent = "Thanks. Your request was accepted. Andrew will reply within one business day to arrange a conversation. You can also reach him at andrew@ndai.pro or (701) 339-9802.";
      form.reset(); started = false;
      $('#f-project').value = ''; $('#project-context').hidden = true;
      history.replaceState(null, '', location.pathname + '#contact');
      track('inquiry_accepted');
    } catch {
      status.dataset.state = 'error';
      status.replaceChildren(document.createTextNode("We couldn't confirm your request. Your details are still here. You can try again, "));
      const email = document.createElement('a'); email.href = 'mailto:andrew@ndai.pro'; email.textContent = 'email Andrew';
      status.append(email, document.createTextNode(', or call (701) 339-9802.'));
      track('inquiry_error');
    } finally {
      clearTimeout(timeout); submitting = false; submit.disabled = false;
      submit.textContent = 'Send request →'; form.removeAttribute('aria-busy'); status.focus();
    }
  });
  const metrics = document.createElement('script'); metrics.src = '/assets/metrics.js'; metrics.defer = true; document.head.append(metrics);
})();
