var JSON_FILE = 'bs15_3/text.json';
var JPEG_FILE = 'bs15_3/bg3.png';

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d', { alpha: false });
ctx.fillRect(0, 0, canvas.width, canvas.height);

var fonts = {};

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

    var previousWidth = 0;

    textboxes.forEach(function(textbox) {
        if (fonts[textbox.font_id] === undefined) {
            var css = "@font-face {" + [
                'font-family: "f' + textbox.font_id + '";',
                'src: url("bs15_3/f' + textbox.font_id + '.woff")',
                'format("woff");'
            ].join(' ') + "}";
            var style = document.createElement('style');
            style.type = "text/css";
            style.appendChild(document.createTextNode(css));
            document.getElementsByTagName('head')[0].appendChild(style);
            fonts[textbox.font_id] = null;
        }

        ctx.save();

        if (!textbox.append) {
            previousWidth = 0;
        }

        ctx.transform(
            textbox.transform[0],
            textbox.transform[1],
            textbox.transform[2],
            textbox.transform[3],
            textbox.x, pdfHeight - textbox.y
        );
        ctx.transform(1, 0, 0, 1, previousWidth, 0);
        ctx.font = textbox.font_size + 'px f' + textbox.font_id;
        ctx.fillStyle = textbox.fill_color;
        ctx.fillText(textbox.text, 0, 0);
        ctx.strokeStyle = textbox.stroke_color;
        ctx.strokeText(textbox.text, 0, 0);

        metrics = ctx.measureText(textbox.text);
        previousWidth += metrics.width;

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
    draw(img, textboxes);
    setInterval(function() {
        draw(img, textboxes);
    }, 1000);
}).catch(console.log.bind(console));
