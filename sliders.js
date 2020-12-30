function setUpSliders() {
    for(let slider of document.querySelectorAll(".optPanel input[type=range]")) {
        slider.addEventListener("input", function() {
            document.querySelector("label[for="+slider.id+"]").textContent = slider.value;
        });
        document.querySelector("label[for="+slider.id+"]").textContent = slider.value;
    }
}

setUpSliders();