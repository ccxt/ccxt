window.addEventListener ("load", () => {
    const $links = $('.toctree-l1');
    const $sublinks = $('.toctree-l2')
    const $sections = $('.section')
    const $sidebar = $('.wy-side-scroll')

    // link the sidebar links and the sections
    const $topLinks = $links.find ('a.reference.internal[href="#"]')
    $topLinks.each (function () {
        const text = this.innerText.toLowerCase ()
        $(this).attr ('href', '#' + text)
    })
    const linksBySectionId = {}
    $sections.each (function () {
        linksBySectionId[this.id] = $links.find ('a.reference.internal[href="#' + this.id + '"]').parent ().filter ('li')
    })
    console.log (linksBySectionId)
    let lock = null
    let prevLock = null
    let last = null
    let lastLock = null
    function open () {
        if (lock === null && prevLock !== this) {
            if (this.classList.contains ('toctree-l1')) {
                lock = this
                prevLock = lock
                $links.removeClass ('current')
                this.classList.remove ('hidden')
                $(this).addClass ('current', 400, 'linear', () => {
                    lock = null
                    if (last !== null && lastLock === null) {
                        lastLock = last
                        setTimeout (() => {
                            open.call (last)
                            lastLock = null
                        }, 400)
                    }
                })
            } else {
                $sublinks.removeClass ('current')
                this.classList.add ('current')
            }
        } else {
            last = this
        }
    }
    //$links.on ('mouseover', open)
    window.addEventListener ('scroll', () => {
        const fromTop = window.scrollY + window.innerHeight * 
        $sections.each (function () {
            if (this.offsetTop <= fromTop && this.offsetTop + this.offsetHeight > fromTop) {
                const sidelink = linksBySectionId[this.id]
                if (sidelink.length) {
                    const element = sidelink[0]
                    open.call (element)
                    const $current = $('.toctree-l1.current')
                    if ($current.length === 0) {
                        return
                    }
                    const boundingBox = $current[0].getBoundingClientRect ();
                    const $siblings = $current.siblings ()
                    const $outerbox = $('ul.current')
                    console.log ('outside', boundingBox.y)
                    if (boundingBox.y <= -1) {
                        console.log ('here', boundingBox.y)
                        $siblings.addClass ('hidden')
                        $outerbox.addClass ('sticker')
                        if ($current[0].getBoundingClientRect ().top !== -1) {
                            console.log ('scrolling', $current[0].getBoundingClientRect ().top)
                            $current[0].scrollIntoView (true)
                            $sidebar[0].scrollBy (0, $current[0].getBoundingClientRect ().top + 5)
                            console.log ('scrolled', $current[0].getBoundingClientRect ().top)
                        }
                    } else if ($siblings.hasClass ('hidden')) {
                        console.log ('there', boundingBox.y)
                        $outerbox.removeClass ('sticker')
                        $siblings.removeClass ('hidden')
                        $current[0].scrollIntoView (true)
                    } else if ($current.hasClass ('hidden')) {
                        $current.removeClass ('hidden')
                    }
                }
           }
        })
    })
});

var $outerbox = $('ul.current')
var $current = $('.toctree-l1.current')
var $sidebar = $('.wy-side-scroll')
var $siblings = $current.siblings ()