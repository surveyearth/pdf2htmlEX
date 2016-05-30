var JSON_FILE = 'example.json';
var JPEG_FILE = 'example.jpg';

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

function draw(img, textboxes) {
    // Fit canvas to image
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    // Scale ctx so pixels match pdf points (assume A4)
    var pdfWidth = 595, pdfHeight = 842; // in postscript points
    ctx.scale(img.width/pdfWidth, img.height/pdfHeight);

    textboxes.forEach(function(textbox) {
        ctx.save();

        ctx.transform(1, 0, 0, 1, textbox.x, textbox.y);
        ctx.transform.apply(ctx, textbox.transform);
        ctx.font = textbox.size + 'px ' + textbox.font;
        ctx.fillText(textbox.text, 0, 0);

        ctx.restore();
    });
}

function loadFont(url) {
    return new Promise(function(resolve, reject) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = url;
        document.getElementsByTagName('head')[0].appendChild(link);
        resolve(); // FIXME: Figure out when font is actually ready
    });
}


var imagePromise = new Promise(function(resolve, reject) {
    var img = document.createElement('img');
    img.onload = function() { resolve(img); };
    img.onerror = reject;
    img.src = JPEG_FILE;
});

var textboxesPromise = fetch(JSON_FILE).then(function(rsp) {
    return rsp.json();
});

var fontPromise = loadFont('http://fonts.googleapis.com/css?family=Vast+Shadow');

Promise.all([imagePromise, textboxesPromise, fontPromise]).then(function(values) {
    var img = values[0];
    var textboxes = values[1];
    setInterval(function() {
        draw(img, textboxes);
    }, 1000);
}).catch(console.log.bind(console));
