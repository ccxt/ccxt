'use strict'

window.addEventListener ('load', function () {
    const $links = $('ul > .toctree-l1')
    const $sublinks = $('.toctree-l2')
    const $allLinks = $('ul > .toctree-l1,.toctree-l2')
    const $sections = $('.section')
    const $menu = $('.wy-menu')
    const $searchArea = $('.wy-side-nav-search')
    const searchHeight = $searchArea.outerHeight ()
    // change the DOM structure so that captions can slide over sidebar links
    let lastP = null
    for (const child of $menu.children ()) {
        if (child.nodeName === 'P') {
            lastP = child
        } else if (lastP !== null) {
            const $li = $('<li class="toctree-l1"></li>')
            $li.append (lastP)
            child.prepend ($li[0])
            lastP = null
        }
    }
    // link the sidebar links and the sections
    const $topLinks = $links.find ('a.reference.internal[href="#"]')
    $topLinks.each (function () {
        const text = this.innerText.toLowerCase ()
        $(this).attr ('href', '#' + text)
    })
    // limit faq to just one question per link
    const $faq = $('a.reference.internal[href="#frequently asked questions"]')
    $faq.empty ()
    let $faqlinks = $faq.siblings ().children ().children ()
    if ($faqlinks.length === 0) {
        $faqlinks = $('a.reference.internal[href^="FAQ.html#"]')
    }
    $faqlinks.each (function () {
        this.parentNode.parentNode.remove ()
    })
    // set the height values for the sticky css property
    const $linkGroups = $links.parents ('ul')
    const heights = {}
    const size = $links.find (':not(".current")').innerHeight ()
    $linkGroups.each (function () {
        const $sublinks = $(this).find ('li.toctree-l1')
        let height = -searchHeight + 2
        for (const link of $sublinks) {
            const $link = $(link)
            heights[$link.children ().first ().attr ('href')] = -Math.ceil (height)
            height += size
        }
    })
    const linksBySectionId = {}
    $sections.each (function () {
        linksBySectionId[this.id] = $allLinks.find ('a.reference.internal[href="#' + this.id + '"]').parent ().filter ('li')
    })
    let lock = null
    let prevLock = null
    let last = null
    let lastLock = null
    let $current = null
    function open () {
        if (lock === null) {
            $current = $(this)
            if (prevLock !== this && $current.hasClass ('toctree-l1')) {
                lock = this
                prevLock = lock
                $links.removeClass ('current')
                $current.removeClass ('hidden')
                $current.addClass ('current', 400, 'linear', () => {
                    lock = null
                    if (last !== null && lastLock === null) {
                        lastLock = last
                        setTimeout (() => {
                            open.call (last)
                            lastLock = null
                        }, 400)
                    }
                })
                // console.log ('setting height to ', heights[$current.children ().first ().attr ('href')])
                $current.parent ().css ('top', heights[$current.children ().first ().attr ('href')])
            } else {
                $sublinks.removeClass ('current')
                $links.not ($current.parent ().parent ()).removeClass ('current')
                $current.addClass ('current')
            }
        } else {
            last = this
        }
    }
    // $links.on ('mouseover', open)
    window.addEventListener ('scroll', () => {
        const fromTop = window.scrollY + window.innerHeight * 0.5
        $sections.each (function () {
            if (this.offsetTop <= fromTop && this.offsetTop + this.offsetHeight > fromTop) {
                const sidelink = linksBySectionId[this.id]
                if (sidelink.length) {
                    const element = sidelink[0]
                    open.call (element)
                }
            }
        })
    })
    // change the width here...
    const width = 200
    const height = width * 0.5625
    const footerHeight = Math.max ((width / 400) * 32, 16)
    const iconSize = Math.max ((width / 400) * 24, 16)
    const footerPadding = Math.max ((width / 400) * 20, 10)
    const style = `.CLS-slider.swiper-wrapper{height: ${height}px}.CLS-footer{height: ${footerHeight}pxpadding: 0 ${footerPadding}px}.CLS-prev > svg, .CLS-next > svg{width: ${iconSize}px height: ${iconSize}px}`
    // hack into the binance sdk /0-0\ /0v0\ /0-0\
    function onReadyStateChangeReplacement () {
        let result
        if (this._onreadystatechange) {
            result = this._onreadystatechange.apply (this, arguments)
        }
        // after binance's setTimeout
        setTimeout (() => {
            $('.swiper-slide').css ('width', width + 'px')
            $('.swiper-container').css ('max-width', width + 'px')
            $('#widget').css ('display', 'initial').trigger ('resize')
            $('#widget-wrapper').css ('border-style', 'solid')
            /*
            const brokerRef = $('.bnc-broker-widget-link')
            for (let i = 0; i < brokerRef.length; i++) {
                const element = brokerRef[i]
                const url = new URL (element.href)
                element.href = url.origin + url.pathname
            }
            */
        }, 0)
        return result
    }

    const openRequest = window.XMLHttpRequest.prototype.open
    function openReplacement (method, url, async, user, password) {
        if (this.onreadystatechange) {
            this._onreadystatechange = this.onreadystatechange
        }
        this.onreadystatechange = onReadyStateChangeReplacement
        return openRequest.call (this, method, url, async, user, password)
    }

    window.XMLHttpRequest.prototype.open = openReplacement
    window.binanceBrokerPortalSdk.initBrokerSDK ('#widget', {
        'apiHost': 'https://www.binance.com',
        'brokerId': 'R4BD3S82',
        'slideTime': 40.0e3,
        'overrideStyle': style,
    })

    const createThemeSwitcher = () => {
        const $btn = $('<div id="btn-wrapper"><btn id="themeSwitcher" class="theme-switcher"><i id="themeMoon" class="fa fa-moon-o"></i><i id="themeSun" class="fa fa-sun-o"></i></btn></div>')
        const $previous = $('.btn.float-left')
        if ($previous.length) {
            $previous.after ($btn)
        } else {
            const $next = $('.btn.float-right')
            $next.after ($btn)
        }
        if (localStorage.getItem ('theme') === 'dark') {
            $('#themeMoon').hide (0)
        } else {
            $('#themeSun').hide (0)
        }
    }

    const switchTheme = function () {
        const $this = $(this)
        if ($this.attr ('disabled')) {
            return
        }
        $this.attr ('disabled', true)
        if (localStorage.getItem ('theme') === 'dark') {
            localStorage.setItem ('theme', 'light')
            document.documentElement.setAttribute ('data-theme', 'light')
            $('#themeSun').fadeOut (150, () => {
                $('#themeMoon').fadeIn (150, () => {
                    $this.attr ('disabled', false)
                })
            })
        } else {
            localStorage.setItem ('theme', 'dark')
            document.documentElement.setAttribute ('data-theme', 'dark')
            $('#themeMoon').fadeOut (150, () => {
                $('#themeSun').fadeIn (150, () => {
                    $this.attr ('disabled', false)
                })
            })
        }
    }

    createThemeSwitcher ()
    $('#themeSwitcher').click (switchTheme)
    $('colgroup').remove ()
})
