
(() => {
    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }

            form.classList.add('was-validated')
        }, false)
    })

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobileRail = window.matchMedia('(max-width: 576px)')

    const setupRoomRails = () => {
        if (!mobileRail.matches || prefersReducedMotion) return

        document.querySelectorAll('.room-grid').forEach((rail) => {
            if (rail.dataset.autoRail === 'ready' || rail.scrollWidth <= rail.clientWidth) return
            rail.dataset.autoRail = 'ready'

            let isPaused = false
            const getStep = () => {
                const firstCard = rail.querySelector('.room-card')
                return firstCard ? firstCard.getBoundingClientRect().width + 14 : rail.clientWidth * 0.82
            }

            const moveRail = () => {
                if (isPaused || rail.matches(':hover')) return
                const nearEnd = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 8
                rail.scrollTo({ left: nearEnd ? 0 : rail.scrollLeft + getStep(), behavior: 'smooth' })
            }

            const pause = () => {
                isPaused = true
                window.clearTimeout(rail._resumeTimer)
                rail._resumeTimer = window.setTimeout(() => {
                    isPaused = false
                }, 3000)
            }

            rail.addEventListener('touchstart', pause, { passive: true })
            rail.addEventListener('pointerdown', pause, { passive: true })
            rail._autoTimer = window.setInterval(moveRail, 2800)
        })
    }

    setupRoomRails()
    mobileRail.addEventListener('change', setupRoomRails)

    const setupHomeRoomCarousel = () => {
        document.querySelectorAll('[data-room-carousel]').forEach((rail) => {
            if (rail.dataset.homeCarousel === 'ready' || rail.scrollWidth <= rail.clientWidth || prefersReducedMotion) return
            rail.dataset.homeCarousel = 'ready'

            let isPaused = false
            const getStep = () => {
                const firstCard = rail.querySelector('.room-card')
                return firstCard ? firstCard.getBoundingClientRect().width + 24 : rail.clientWidth * 0.78
            }

            const rotate = () => {
                if (isPaused || rail.matches(':hover')) return
                const nearEnd = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 12
                rail.scrollTo({ left: nearEnd ? 0 : rail.scrollLeft + getStep(), behavior: 'smooth' })
            }

            const pause = () => {
                isPaused = true
                window.clearTimeout(rail._homeResumeTimer)
                rail._homeResumeTimer = window.setTimeout(() => {
                    isPaused = false
                }, 3500)
            }

            rail.addEventListener('touchstart', pause, { passive: true })
            rail.addEventListener('pointerdown', pause, { passive: true })
            rail.addEventListener('focusin', pause)
            rail._homeCarouselTimer = window.setInterval(rotate, 3200)
        })
    }

    setupHomeRoomCarousel()
    window.addEventListener('resize', setupHomeRoomCarousel)

    const setupHomeHeroRotator = () => {
        const hero = document.querySelector('[data-hero-rotator]')
        const dataNode = document.querySelector('#homeHeroSlides')
        if (!hero || !dataNode) return

        let slides = []
        try {
            slides = JSON.parse(dataNode.textContent || '[]')
        } catch (error) {
            slides = []
        }

        const frames = Array.from(hero.querySelectorAll('.home-hero-frame'))
        if (slides.length <= 1 || !frames.length) return

        let index = 0
        const rotateHero = () => {
            index = (index + 1) % slides.length
            frames.forEach((frame, frameIndex) => {
                const slide = slides[(index + frameIndex) % slides.length]
                const image = frame.querySelector('img')
                if (!slide || !image || image.src === slide.photo) return

                image.src = slide.photo
                image.alt = slide.title || 'Featured room'
                if (frame.tagName === 'A') frame.href = slide.href || '/rooms'
            })
        }

        window.setInterval(rotateHero, 1000)
    }

    setupHomeHeroRotator()

    const setupHeroImageSwiper = () => {
        const swiperNode = document.querySelector('[data-hero-image-swiper]')
        if (!swiperNode || typeof window.Swiper === 'undefined') return

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (swiperNode.dataset.ready === 'true') return
        swiperNode.dataset.ready = 'true'

        new window.Swiper(swiperNode, {
            loop: true,
            speed: 700,
            effect: 'fade',
            fadeEffect: { crossFade: true },
            autoplay: prefersReduced ? false : {
                delay: 2600,
                disableOnInteraction: false,
            },
            pagination: {
                el: swiperNode.querySelector('.swiper-pagination'),
                clickable: true,
            },
        })
    }

    setupHeroImageSwiper()

    const setupFilterSheet = () => {
        const sheet = document.querySelector('#mobileFilterSheet')
        const openButtons = document.querySelectorAll('[data-filter-open]')
        const closeButtons = document.querySelectorAll('[data-filter-close]')
        if (!sheet || !openButtons.length) return

        const firstField = sheet.querySelector('.filter-sheet-form input, .filter-sheet-form select')

        const openSheet = () => {
            sheet.classList.add('is-open')
            sheet.setAttribute('aria-hidden', 'false')
            document.body.classList.add('filter-sheet-open')
            openButtons.forEach((button) => button.setAttribute('aria-expanded', 'true'))
            window.setTimeout(() => firstField?.focus(), 180)
        }

        const closeSheet = () => {
            sheet.classList.remove('is-open')
            sheet.setAttribute('aria-hidden', 'true')
            document.body.classList.remove('filter-sheet-open')
            openButtons.forEach((button) => button.setAttribute('aria-expanded', 'false'))
        }

        openButtons.forEach((button) => button.addEventListener('click', openSheet))
        closeButtons.forEach((button) => button.addEventListener('click', closeSheet))

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && sheet.classList.contains('is-open')) closeSheet()
        })
    }

    setupFilterSheet()

    const getFormValue = (form, name) => form.elements[name]?.value?.trim() || ''

    const setFormValue = (form, name, value, overwrite = true) => {
        const field = form.elements[name]
        if (!field || value === undefined || value === null) return
        if (!overwrite && field.value.trim()) return
        field.value = Array.isArray(value) ? value.join('\n') : String(value)
    }

    const setupAiListingHelper = () => {
        const form = document.querySelector('[data-owner-form]')
        const button = document.querySelector('[data-ai-listing-helper]')
        const status = document.querySelector('[data-ai-listing-status]')
        if (!form || !button) return

        button.addEventListener('click', async () => {
            const payload = {
                ownerName: getFormValue(form, 'room[ownerName]'),
                area: getFormValue(form, 'room[area]'),
                landmark: getFormValue(form, 'room[landmark]'),
                rent: getFormValue(form, 'room[rent]'),
                deposit: getFormValue(form, 'room[deposit]'),
                category: getFormValue(form, 'room[category]'),
                roomType: getFormValue(form, 'room[roomType]'),
                food: getFormValue(form, 'room[food]'),
                availability: getFormValue(form, 'room[availability]'),
                facilities: getFormValue(form, 'room[facilities]'),
                nearbyPlaces: getFormValue(form, 'room[nearbyPlaces]'),
                rules: getFormValue(form, 'room[rules]'),
                description: getFormValue(form, 'room[description]'),
            }

            button.disabled = true
            if (status) status.textContent = 'AI details bana raha hai...'
            try {
                const response = await fetch('/api/ai/listing-helper', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                })
                const data = await response.json()
                if (!data.ok) throw new Error(data.error || 'AI helper failed')
                const draft = data.draft || {}
                form.querySelector('.owner-optional-section:last-of-type')?.setAttribute('open', '')
                setFormValue(form, 'room[title]', draft.title)
                setFormValue(form, 'room[description]', draft.description)
                setFormValue(form, 'room[facilities]', draft.facilities, false)
                setFormValue(form, 'room[nearbyPlaces]', draft.nearbyPlaces, false)
                setFormValue(form, 'room[foodDetails]', draft.foodDetails, false)
                setFormValue(form, 'room[rules]', draft.rules, false)
                setFormValue(form, 'room[safetyNotes]', draft.safetyNotes, false)
                setFormValue(form, 'room[distanceNotes]', draft.distanceNotes, false)
                if (status) status.textContent = data.mode === 'ai' ? 'AI details ready.' : 'Smart fallback details ready.'
            } catch (error) {
                if (status) status.textContent = 'AI helper abhi available nahi hai. Basic auto details use kar sakte hain.'
            } finally {
                button.disabled = false
            }
        })
    }

    setupAiListingHelper()

    const setupAiRoomSearch = () => {
        const form = document.querySelector('[data-ai-room-search]')
        const results = document.querySelector('[data-ai-room-results]')
        if (!form || !results) return

        form.addEventListener('submit', async (event) => {
            event.preventDefault()
            const query = getFormValue(form, 'query')
            if (!query) return
            results.innerHTML = '<p class="muted">Searching matching rooms...</p>'
            try {
                const response = await fetch('/api/ai/room-search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query }),
                })
                const data = await response.json()
                if (!data.ok) throw new Error(data.error || 'Search failed')
                if (!data.recommendations.length) {
                    results.innerHTML = '<p class="muted">No matching rooms found yet.</p>'
                    return
                }
                results.innerHTML = data.recommendations.map((room) => `
                    <a class="ai-room-result" href="${room.href}">
                        <img src="${room.photo || ''}" alt="">
                        <span>
                            <strong>${room.title}</strong>
                            <small>Rs. ${Number(room.rent).toLocaleString('en-IN')} / month · ${room.area}</small>
                            <em>${(room.reasons || []).join(', ')}</em>
                        </span>
                    </a>
                `).join('')
            } catch (error) {
                results.innerHTML = '<p class="muted">Smart search abhi available nahi hai. Filters use karke search karein.</p>'
            }
        })
    }

    setupAiRoomSearch()

    const setupZacAiBot = () => {
        const bot = document.querySelector('[data-zac-ai-bot]')
        if (!bot) return
        const toggles = bot.querySelectorAll('[data-zac-ai-toggle]')
        const panel = bot.querySelector('[data-zac-ai-panel]')
        const form = bot.querySelector('[data-zac-ai-form]')
        const messages = bot.querySelector('[data-zac-ai-messages]')
        if (!panel || !form || !messages) return

        const setOpen = (open) => {
            bot.classList.toggle('is-open', open)
            panel.setAttribute('aria-hidden', String(!open))
            toggles.forEach((toggle) => toggle.setAttribute('aria-expanded', String(open)))
            if (open) window.setTimeout(() => form.elements.message?.focus(), 100)
        }

        const addMessage = (text, type = 'bot') => {
            const node = document.createElement('p')
            node.className = `zac-ai-message ${type}`
            node.textContent = text
            messages.appendChild(node)
            messages.scrollTop = messages.scrollHeight
            return node
        }

        toggles.forEach((toggle) => {
            toggle.addEventListener('click', () => setOpen(!bot.classList.contains('is-open')))
        })

        form.addEventListener('submit', async (event) => {
            event.preventDefault()
            const input = form.elements.message
            const message = input.value.trim()
            if (!message) return
            addMessage(message, 'user')
            input.value = ''
            const loading = addMessage('Thinking...', 'bot')
            try {
                const response = await fetch('/api/ai/site-helper', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message }),
                })
                const data = await response.json()
                if (!data.ok) throw new Error(data.error || 'AI helper failed')
                const suggestions = data.suggestions?.length ? `\n${data.suggestions.join(' • ')}` : ''
                loading.textContent = `${data.answer || 'Main help kar sakta hoon.'}${suggestions}`
                if (data.roomIds?.length) {
                    const links = document.createElement('div')
                    links.className = 'zac-ai-links'
                    data.roomIds.forEach((id, index) => {
                        const link = document.createElement('a')
                        link.href = `/rooms/${id}`
                        link.textContent = `View room ${index + 1}`
                        links.appendChild(link)
                    })
                    messages.appendChild(links)
                    messages.scrollTop = messages.scrollHeight
                }
            } catch (error) {
                loading.textContent = 'Abhi AI helper available nahi hai. Filters ya search use karke try karein.'
            }
        })
    }

    setupZacAiBot()
})()
