window.addEventListener ("load", () => {
    const $links = $('ul > .toctree-l1');
    const $sublinks = $('.toctree-l2')
    const $allLinks = $('ul > .toctree-l1,.toctree-l2')
    const $sections = $('.section')
    const $menu = $('.wy-menu')
    // change the DOM structure so that captions can slide over sidebar links
    let lastP = null
    for (const child of $menu.children ()) {
        if (child.nodeName === 'P') {
            lastP = child
        } else if (lastP !== null) {
            const li = document.createElement ('li')
            li.classList.add ('toctree-l1')
            li.append (lastP)
            child.prepend (li)
            lastP = null
        }
    }
    // link the sidebar links and the sections
    const $topLinks = $links.find ('a.reference.internal[href="#"]')
    $topLinks.each (function () {
        const text = this.innerText.toLowerCase ()
        $(this).attr ('href', '#' + text)
    })
    // set the height values for the sticky css property
    const $linkGroups = $links.parents ('ul')
    const heights = {}
    $linkGroups.each (function () {
        const $sublinks = $(this).find ('li.toctree-l1')
        let height = 1
        for (const link of $sublinks) {
            const $link = $(link)
            console.log ($link.children ().first ().attr ('href'))
            heights[$link.children ().first ().attr ('href')] = -Math.ceil (height)
            height += $link.innerHeight ()
        }
    })
    console.log (heights)
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
        if (lock === null && prevLock !== this) {
            $current = $(this)
            if ($current.hasClass ('toctree-l1')) {
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
});
