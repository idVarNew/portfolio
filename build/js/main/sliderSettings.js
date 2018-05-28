// slider


var slider,
    timer,
    imageIsLoaded = false,
    homeSlider = document.getElementById("home-page"),
    aboutSlider = document.getElementById("about-page"),
    worksSlider = document.getElementById("works-page"),
    contactSlider = document.getElementById("contact-page");



if (homeSlider !== null) {
    slider = tns({
        container: '.slider',
        items: 3,
        slideBy: 1,
        speed: 700,
        autoplay: true,
        arrowKeys: true,
        autoplayHoverPause: true,
        lazyload: true,
        autoplayTimeout: 5000,
        autoplayText: [
            "▶",
            "❚❚"
        ],
        responsive: {
            "10": {
                mouseDrag: true,
                items: 1,
                controls: false
            },
            "500": {
                items: 1,
                controls: true
            },
            "758": {
                items: 2,

            },
            "1050": {
                items: 3,
                mouseDrag: false
            }
        }
    });
    var info = slider.getInfo(),
        slideItems = info.slideItems,
        currentIndex = info.index;

    onInit();
    homeSliderOnLoad();

} else if (aboutSlider !== null || worksSlider !== null) {
    slider = tns({
        items: 1,
        slideBy: 1,
        speed: 700,
        autoplay: false,
        arrowKeys: true,
        lazyload: true,
        autoplayTimeout: 1300,
        responsive: {
            "100": {
                mouseDrag: true,
                items: 1,
                controls: false,
                autoHeight: true
            },
            "500": {
                items: 1,
                controls: true
            },
            "900": {
                items: 1,
                mouseDrag: false,

            }
        }
    });
    var info = slider.getInfo(),
        slideItems = info.slideItems,
        currentIndex = info.index;
    onInit();
    addTabindex();
}


onSliderInit();


function homeSliderOnLoad() {
    addClasses();
    addImage();
    addTabindex();
}


function onInit() {
    animateControlsOnHover();
    slider.events.on('indexChanged', onSlideChange);
}

function onSlideChange() {
    addEventToButton();
    updateClasses();
    updateTabindex();

}

function onSliderInit() {
    if (!contactSlider) {
        addEventToButton();
        adjustHeight();
        removeHeight()
        window.addEventListener("resize", onResize);
        window.addEventListener("orientationchange", removeHeight);
    }
}



function addTabindex() {
    var allSlides = Array.from(info.slideItems);

    allSlides.forEach(addTabIndexToElements)

    function addTabIndexToElements(item, index) {
        var button = item.querySelector(".btn-1"),
            links = Array.from(item.querySelectorAll(".sq-button"));

        addTabindexToButton();
        links.forEach(addTabindexToLinks);

        function addTabindexToButton() {
            if (button !== null) {
                if (index === currentIndex) {
                    button.setAttribute('tabindex', 0);
                } else {
                    button.setAttribute('tabindex', -1);
                }
            }
        }

        function addTabindexToLinks(link) {
            if (index === currentIndex) {
                link.setAttribute('tabindex', 0);
            } else {
                link.setAttribute('tabindex', -1);
            }
        }
    }
}


function updateTabindex() {
    var info = slider.getInfo(),
        indexPrev = info.indexCached,
        indexCurrent = info.index,
        slideItems = info.slideItems,
        nextSlideButton = slideItems[indexCurrent].querySelector(".btn-1"),
        allSlides = Array.from(info.slideItems);

    if (nextSlideButton !== null) {
        setTabIndex(indexCurrent, 0);
        setTabIndex(indexPrev, 0);
        setTabIndex(indexCurrent - 1, -1);

    }

    function setTabIndex(index, value) {
        slideItems[index].querySelector(".btn-1").setAttribute('tabindex', value);
    }

    allSlides.forEach(updateLinks);

    function updateLinks(item, index) {
        var links = Array.from(item.querySelectorAll("a"));

        links.forEach(updateLinks);

        function updateLinks(link) {
            if (index === indexCurrent) {
                link.setAttribute('tabindex', 0);
            } else {
                link.setAttribute('tabindex', -1);
            }
        }
    }
}

function addEventToButton() {
    var info = slider.getInfo(),
        slideItems = info.slideItems,
        currentIndex = info.index,
        currentButton = slideItems[currentIndex].querySelector(".btn-1");

    if (currentButton !== null) {
        currentButton.addEventListener("click", function () {
            slider.goTo("next");
        })
    }
}

function addClasses() {

    setClass(currentIndex, 'start-0');
    setClass(currentIndex + 1, 'start-1');
    setClass(currentIndex + 2, 'start-2');
}


function createImage() {
    var image = new Image();
    image.src = "http://frontendowiec.com/assets/img/home-slider/images/image-3.gif";
    return image;
}


function addClassToBody() {
    document.body.classList.add('loading');
}

function updateBodyClass() {
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
}

function addImage() {

    var image = createImage();

    addClassToBody();

    image.addEventListener('load', showImage);

    function showImage() {
        imageIsLoaded = true;
        slideItems[currentIndex + 2].firstElementChild.style.backgroundImage = "url(" + image.src + ")";
        updateBodyClass();
    }
    setTimeout(function () {
        if (imageIsLoaded === false) {
            showImage();
        }
    }, 4000);

}

function setClass(index, className) {
    slideItems[index].classList.add(className);
}

function removeClass(index, className) {
    slideItems[index].classList.remove(className);
}

function updateClasses() {
    var info = slider.getInfo(),
        indexPrev = info.indexCached,
        indexCurrent = info.index,
        navItems = info.navItems,
        slideItems = info.slideItems,
        allSlideItems = Array.from(slideItems),
        allNavItems = Array.from(navItems);

    allSlideItems.forEach(function (item, index) {
        item.classList.remove('start-0');
        item.classList.remove('start-1');
        item.classList.remove('start-2');
    });


    setClass(indexCurrent, 'active');
    removeClass(indexPrev, 'active');
    removeClass(indexPrev, 'start');
    removeClass(indexPrev - 1, 'active-prev');
    setClass(indexCurrent - 1, 'active-prev');

    allNavItems.forEach(function (item, index) {
        if (item.classList.contains("nav-active-prev")) {
            item.classList.remove("nav-active-prev");
        }
        if (item.classList.contains("tns-nav-active") && index > 0) {
            item.previousElementSibling.className = "nav-active-prev";
        }
    });
};


function animateControlsOnHover() {
    var slider = document.getElementById("slider"),
        prevButton = document.querySelector(".tns-control-prev"),
        nextButton = document.querySelector(".tns-control-next");

    slider.addEventListener("mouseover", function () {
        prevButton.classList.add("is-prev-animated");
        nextButton.classList.add("is-next-animated");
    })
    slider.addEventListener("mouseout", function () {
        prevButton.classList.remove("is-prev-animated");
        nextButton.classList.remove("is-next-animated");
    })
}


function onResize() {
    timer = setTimeout(function () {
        if (window.innerWidth > 750) {
            adjustHeight();
        }
    }, 50);
}


function removeHeight() {
    var sliderHeight = document.getElementById("slider-iw");

    if (sliderHeight !== null) {
        sliderHeight.removeAttribute("style");
    }
}

function adjustHeight() {
    var sliderHeight = document.getElementById("slider-iw"),
        pageMain = document.querySelector(".page-main");

    pageMain.removeAttribute("style");

    if (sliderHeight !== null) {
        sliderHeight.removeAttribute("style");
        sliderHeight.style.height = pageMain.clientHeight + "px"
    }
    pageMain.style.height = pageMain.clientHeight + "px";
}