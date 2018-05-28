// Nav Button

(function () {
    "use strict"

    var navButton = document.getElementById("nav-button"),
        navBar = document.getElementById("nav-bar"),
        backToPage = document.getElementById("back-to-page"),
        ariaAttr = navButton.getAttribute("aria-expanded"),
        navItems = Array.from(document.querySelectorAll(".nav-item"));

    document.body.addEventListener("keyup", keyEvents);
    navButton.addEventListener("click", toggleNavigaion);
    backToPage.addEventListener("click", toggleNavigaion);



    function keyEvents(e) {
        if (e.keyCode === 27 && (e.target.parentElement.className === "nav-item" || e.target.id === "nav-button")) {

            toggleNavigaion(e)
            navButton.focus()
            setTimeout(function () {
                navButton.focus()
            }, 30);
        }
        if (e.keyCode === 9) {
            if (e.target.id === "back-to-page") {
                e.target.addEventListener("blur", addFocus);
            }

            if (e.target.parentElement.className === "nav-item") {
                navItems.forEach(removeElement);

                if (e.target.id !== "back-to-page") {
                    e.target.appendChild(createElement())
                }
            }
        }

        function removeElement(item) {
            var a = item.querySelector("a"),
                span = a.querySelector("span");
            if (span !== null) {
                item.querySelector("a").removeChild(span)
            }
        }

        function addFocus() {
            navItems[0].querySelector("a").focus()
        }

    }

    function createElement() {
        var element = document.createElement("span"),
            text = document.createTextNode("SHOW");
        element.appendChild(text);
        element.className = "nav-item-subtext";
        return element;
    }


    function toggleNavigaion(e) {
        if (e.target.id === "back-to-page") {
            e.preventDefault()
        }

        navBar.classList.toggle("is-closed");
        navBar.classList.toggle("is-open");
        navButton.classList.toggle("is-closed");
        navButton.classList.toggle("is-open");

        if (ariaAttr === "false") {
            navButton.setAttribute("aria-expanded", "true");
        } else {
            navButton.setAttribute("aria-expanded", "false");
        }

        if (navBar.classList.contains("is-open")) {
            navBar.style.display = "block";
        }

        setTimeout(function () {
            if (navBar.classList.contains("is-closed")) {
                navBar.style.display = "none";
            }
        }, 500);

    }
})()

