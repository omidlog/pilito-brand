// Brand OS Studio: progressive enhancement only. Every page works without this script.
// No data is fetched here except the provisioning status of the page being viewed.
;(function () {
  'use strict'
  var root = document.documentElement

  // Theme: explicit choice stored locally (not sensitive), otherwise follow the system.
  try {
    var saved = localStorage.getItem('studio-theme')
    if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved)
  } catch { /* storage unavailable */ }

  function toast(text) {
    var region = document.querySelector('[data-toast-region]')
    if (!region) return
    var item = document.createElement('div')
    item.className = 'toast'
    item.textContent = text
    region.appendChild(item)
    setTimeout(function () { item.remove() }, 2600)
  }

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn)
    else fn()
  }

  ready(function () {
    // Theme toggle.
    document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
      button.addEventListener('click', function () {
        var current = root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        var next = current === 'dark' ? 'light' : 'dark'
        root.setAttribute('data-theme', next)
        try { localStorage.setItem('studio-theme', next) } catch { /* ignore */ }
      })
    })

    // Mobile navigation drawer with focus management and Escape to close.
    var sidebar = document.getElementById('sidebar')
    var openButton = document.querySelector('[data-drawer-open]')
    var backdrop = document.querySelector('.drawer-backdrop')
    function closeDrawer() {
      if (!sidebar || !sidebar.classList.contains('is-open')) return
      sidebar.classList.remove('is-open')
      if (backdrop) backdrop.hidden = true
      if (openButton) { openButton.setAttribute('aria-expanded', 'false'); openButton.focus() }
    }
    if (sidebar && openButton) {
      openButton.addEventListener('click', function () {
        sidebar.classList.add('is-open')
        if (backdrop) backdrop.hidden = false
        openButton.setAttribute('aria-expanded', 'true')
        var first = sidebar.querySelector('a, button')
        if (first) first.focus()
      })
      document.querySelectorAll('[data-drawer-close]').forEach(function (el) { el.addEventListener('click', closeDrawer) })
      document.addEventListener('keydown', function (event) { if (event.key === 'Escape') closeDrawer() })
    }

    // Copy buttons.
    document.querySelectorAll('[data-copy-target]').forEach(function (button) {
      button.addEventListener('click', function () {
        var target = document.getElementById(button.getAttribute('data-copy-target'))
        if (!target) return
        var text = target.value
        var done = function () { toast(button.getAttribute('data-copied')) }
        var fail = function () { target.select(); toast(button.getAttribute('data-copy-failed')) }
        if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fail)
        else {
          target.select()
          try { if (document.execCommand('copy')) done(); else fail() } catch { fail() }
        }
      })
    })

    // Refresh buttons show a busy state while the server fetches GitHub.
    document.querySelectorAll('[data-refresh-form]').forEach(function (form) {
      form.addEventListener('submit', function () {
        var button = form.querySelector('button')
        if (!button) return
        button.setAttribute('aria-busy', 'true')
        button.disabled = true
        var label = button.querySelector('span')
        if (label && button.getAttribute('data-busy-label')) label.textContent = button.getAttribute('data-busy-label')
      })
    })

    // Asset kind filter.
    var filter = document.querySelector('[data-asset-filter]')
    if (filter) {
      filter.hidden = false
      filter.addEventListener('click', function (event) {
        var chip = event.target.closest('[data-filter]')
        if (!chip) return
        var kind = chip.getAttribute('data-filter')
        filter.querySelectorAll('[data-filter]').forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)) })
        document.querySelectorAll('.asset-card').forEach(function (card) { card.hidden = kind !== '*' && card.getAttribute('data-kind') !== kind })
      })
    }

    // Error summary receives focus so screen readers announce it.
    var summary = document.querySelector('[data-error-summary]')
    if (summary) summary.focus()

    // New brand wizard: one step at a time, with the server still validating everything.
    var wizard = document.querySelector('[data-wizard]')
    if (wizard) setupWizard(wizard, !!summary)

    // Provisioning status polling.
    var provisioning = document.querySelector('[data-provisioning]')
    if (provisioning && provisioning.getAttribute('data-state') === 'running') {
      var slug = provisioning.getAttribute('data-provisioning')
      var poll = function () {
        fetch('/brands/' + encodeURIComponent(slug) + '/provisioning.json', { credentials: 'same-origin', headers: { Accept: 'application/json' } })
          .then(function (r) { return r.ok ? r.json() : null })
          .then(function (data) {
            if (!data) return setTimeout(poll, 3000)
            var running = data.steps.some(function (s) { return s.status === 'running' })
            var key = data.state + ':' + data.steps.map(function (s) { return s.status }).join(',')
            if (data.state !== 'running' || key !== provisioning.getAttribute('data-key')) {
              if (provisioning.getAttribute('data-key') || data.state !== 'running') return location.reload()
              provisioning.setAttribute('data-key', key)
            }
            setTimeout(poll, running ? 1200 : 2000)
          })
          .catch(function () { setTimeout(poll, 4000) })
      }
      setTimeout(poll, 800)
    }
  })

  function setupWizard(form, hasErrors) {
    var steps = Array.prototype.slice.call(form.querySelectorAll('[data-step]'))
    var indicators = Array.prototype.slice.call(form.querySelectorAll('[data-step-indicator]'))
    var nav = form.querySelector('[data-wizard-nav]')
    var back = form.querySelector('[data-wizard-back]')
    var next = form.querySelector('[data-wizard-next]')
    var progress = form.querySelector('[data-wizard-progress]')
    var index = 0
    // With server errors, show the whole form so every message is visible.
    if (hasErrors) return

    var nameInput = form.querySelector('[data-slug-source]')
    var slugInput = form.querySelector('[data-slug-target]')
    var repoInput = form.querySelector('[data-repo-target]')
    var slugTouched = slugInput && slugInput.value !== ''
    var repoTouched = repoInput && repoInput.value !== ''
    function slugify(text) {
      return text.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
    }
    if (nameInput && slugInput) {
      nameInput.addEventListener('input', function () {
        if (!slugTouched) slugInput.value = slugify(nameInput.value)
        if (repoInput && !repoTouched) repoInput.value = slugInput.value
      })
      slugInput.addEventListener('input', function () {
        slugTouched = true
        if (repoInput && !repoTouched) repoInput.value = slugInput.value
      })
    }
    if (repoInput) repoInput.addEventListener('input', function () { repoTouched = true })

    var facets = form.querySelector('[data-facets]')
    form.querySelectorAll('[data-profile-choice]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        if (!facets) return
        var personal = form.querySelector('[data-profile-choice]:checked').value === 'personal-brand'
        facets.setAttribute('data-collapsed', personal ? 'false' : 'true')
        if (!personal) facets.querySelectorAll('input').forEach(function (i) { i.checked = false })
      })
    })

    function fillReview() {
      var set = function (name, value) {
        var el = form.querySelector('[data-review-field="' + name + '"]')
        if (el) el.textContent = value
      }
      set('name', form.elements.name.value)
      set('slug', form.elements.slug.value)
      var profile = form.querySelector('[data-profile-choice]:checked')
      set('profile', profile ? profile.closest('label').querySelector('.choice-title').textContent : '')
      var locale = form.elements.default_locale
      set('default_locale', locale.options[locale.selectedIndex].textContent)
      set('repo', form.elements.owner.value + '/' + (form.elements.repo.value || form.elements.slug.value))
    }

    function validStep(i) {
      var fields = steps[i].querySelectorAll('input[required], input[pattern]')
      for (var k = 0; k < fields.length; k++) {
        if (!fields[k].checkValidity()) { fields[k].reportValidity(); return false }
      }
      return true
    }

    function show(i, focus) {
      index = i
      steps.forEach(function (step, k) { step.hidden = k !== i })
      indicators.forEach(function (item, k) {
        item.classList.toggle('is-current', k === i)
        item.classList.toggle('is-done', k < i)
        if (k === i) item.setAttribute('aria-current', 'step')
        else item.removeAttribute('aria-current')
      })
      back.hidden = i === 0
      next.hidden = i === steps.length - 1
      if (progress) progress.textContent = steps[i].querySelector('.step-count').textContent
      if (i === steps.length - 1) fillReview()
      if (focus) {
        var target = steps[i].querySelector('input:not([type=hidden]), select, button')
        if (target) target.focus()
      }
    }

    nav.hidden = false
    back.addEventListener('click', function () { if (index > 0) show(index - 1, true) })
    next.addEventListener('click', function () { if (validStep(index) && index < steps.length - 1) show(index + 1, true) })
    form.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' && event.target.tagName === 'INPUT' && index < steps.length - 1) {
        event.preventDefault()
        next.click()
      }
    })
    form.addEventListener('submit', function () {
      var submit = form.querySelector('[data-submit]')
      if (submit) { submit.setAttribute('aria-busy', 'true'); submit.disabled = true }
    })
    show(0, false)
  }
})()
