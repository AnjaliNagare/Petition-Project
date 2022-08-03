(function () {
    const canvas = document.getElementById("signature-canvas");
    const hiddenField = document.getElementById('input[type="hidden"]');

    var ctx = canvas.getContext("2d");
    

    // last known position
    var pos = { x: 0, y: 0 };

    
    document.addEventListener("mousemove", draw);
    document.addEventListener("mousedown", setPosition);
    document.addEventListener("mouseenter", setPosition);

    // new position from mouse event
    function setPosition(e) {
        pos.x = e.clientX;
        pos.y = e.clientY;
    }


    function draw(e) {
        // mouse left button must be pressed
        if (e.buttons !== 1) return;

        ctx.beginPath(); // begin

        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#c0392b";

        ctx.moveTo(pos.x, pos.y); // from
        setPosition(e);
        ctx.lineTo(pos.x, pos.y); // to

        ctx.stroke(); // draw it!

        hiddenField.value = canvas.toDataURL();
    }
    
})();




