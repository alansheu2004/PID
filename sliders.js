function setUpSliders() {
    for(let slider of document.querySelectorAll("input[type=range]")) {
        slider.addEventListener("input", function() {
            document.querySelector("label[for="+slider.id+"]").textContent = Number(slider.value).toFixed(2);
        });
    }
}

setUpSliders();