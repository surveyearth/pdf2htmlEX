var JSON_FILE = 'bs15_3/text.json';
var JPEG_FILE = 'bs15_3/bg3.png';
// var JPEG_FILE = 'http://image.issuu.com/150802204627-f6b514e5a5aeb6ab3c493f07a6eee7bd/jpg/page_3.jpg';

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d', { alpha: false });
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);

function draw(img, textboxes) {
    // Fit canvas to image
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    // Scale ctx so pixels match pdf points
    // var pdfWidth = 595, pdfHeight = 842; // A4 in postscript points
    var pdfWidth = 481.89, pdfHeight = 680.31; // Boneshaker dimensions in pts
    ctx.scale(img.width/pdfWidth, img.height/pdfHeight);

    // Where to draw the next character
    var x = 0;

    textboxes.forEach(function(textbox) {
        ctx.save();

        if (!textbox.append) {
            x = 0;
        }

        ctx.font = textbox.font_size + 'px f' + textbox.font_id;
        ctx.fillStyle = textbox.fill_color;
        // ctx.fillStyle = 'blue';
        ctx.strokeStyle = textbox.stroke_color;

        // Apply transformation matrix and position
        ctx.transform(
            textbox.transform[0],
            textbox.transform[1],
            textbox.transform[2],
            textbox.transform[3],
            textbox.x,
            pdfHeight - textbox.y // FIXME: Do this in the backend
        );

        var remainingWidth = ctx.measureText(textbox.text).width;

        for (var i = 0; i < textbox.text.length; i++) {
            var letter = textbox.text[i];
            ctx.fillText(letter, x, 0);
            ctx.strokeText(letter, x, 0);
            var w = ctx.measureText(textbox.text.substr(i+1)).width;
            x += remainingWidth - w + textbox.letter_space; // + (/\s/.test(letter) ? textbox.word_space : 0);
            remainingWidth = w;
        }

        ctx.restore();
    });
}

var fonts = {};
function loadFont(id) {
    if (fonts[id] === undefined) {
        var css = "@font-face {" + [
            'font-family: "f' + id + '";',
            'src: url("bs15_3/f' + id + '.woff")',
            'format("woff");'
        ].join(' ') + "}";
        var style = document.createElement('style');
        style.type = "text/css";
        style.appendChild(document.createTextNode(css));
        document.getElementsByTagName('head')[0].appendChild(style);
        fonts[id] = null;
    }
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
    textboxes.forEach(function(textbox) {
        loadFont(textbox.font_id);
    });
    draw(img, textboxes);
    setInterval(function() {
        draw(img, textboxes);
    }, 1000);
}).catch(console.log.bind(console));
