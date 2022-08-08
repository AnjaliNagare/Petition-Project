(function () {
    
    var canvas = document.getElementById("signature-canvas");
    const hiddenField = document.querySelector('input[type="hidden"]');

    var isdrawing = false;

    const canvasLeft = canvas.offsetLeft;
    const canvasTop = canvas.offsetTop;


    // get canvas 2D context and set him correct size
    var ctx = canvas.getContext("2d");

    // last known position
    var pos = { x: 0, y: 0 };



    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mousedown", function (event) {
        setPosition(event);
        isdrawing = true;
    });
    canvas.addEventListener("mouseenter", setPosition);

    canvas.addEventListener("mouseup", function () {
        isdrawing = false;
    });

    // new position from mouse event
    function setPosition(evt) {
        pos.x = evt.clientX - canvasLeft;
        pos.y = evt.clientY - canvasTop;
    }


    function draw(evt) {
    // mouse left button must be pressed
        if (isdrawing) {
            ctx.beginPath(); // begin

            ctx.lineWidth = 3;
            ctx.lineCap = "round";
            ctx.strokeStyle = "white";
        

            ctx.moveTo(pos.x, pos.y); // from
            setPosition(evt);
            ctx.lineTo(pos.x, pos.y); // to

            ctx.stroke(); // draw it!

            hiddenField.value = canvas.toDataURL();
        }
    }
}());