
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
})()
