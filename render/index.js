var JSON_FILE = 'bs15_3/text.json';
var JPEG_FILE = 'bs15_3/bg3.png';

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d', { alpha: false });
ctx.fillRect(0, 0, canvas.width, canvas.height);

function draw(img, textboxes) {
    // Fit canvas to image
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    // ctx.fillStyle = 'white';
    // ctx.fillRect(0, 0, img.width, img.height);

    // Scale ctx so pixels match pdf points (assume A4)
    // var pdfWidth = 595, pdfHeight = 842; // in postscript points
    var pdfWidth = 481.89, pdfHeight = 680.31;
    ctx.scale(img.width/pdfWidth, img.height/pdfHeight);

    textboxes.forEach(function(textbox) {
        ctx.save();

        // ctx.transform(1, 0, 0, 1, textbox.x, 842 - textbox.y);
        // var magicX = 32;
        // var magicY = 90;
        var magicX = 0;
        var magicY = 0;
        var ctm = [
            textbox.transform[0],
            textbox.transform[1],
            textbox.transform[2],
            textbox.transform[3],
            textbox.x + magicX, pdfHeight - magicY - textbox.y
        ];
        ctx.transform.apply(ctx, ctm);
        ctx.font = textbox.font_size + 'px f' + textbox.font_id;
        ctx.fillStyle = textbox.fill_color;
        ctx.fillText(textbox.text, 0, 0);
        ctx.strokeStyle = textbox.stroke_color;
        ctx.strokeText(textbox.text, 0, 0);

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

// ['bs15_3/f1.woff', 'bs15_3/f2.woff', 'bs15_3/f3.woff', 'bs15_3/f4.woff'].forEach(function(f) {
//     loadFont(f)
// });
// var fontPromise = loadFont('http://fonts.googleapis.com/css?family=Vast+Shadow');

Promise.all([imagePromise, textboxesPromise]).then(function(values) {
    var img = values[0];
    var textboxes = values[1];
    setInterval(function() {
        draw(img, textboxes);
    }, 1000);
}).catch(console.log.bind(console));
