//libs
var fs = require('fs');
var hummus = require('hummus');

function touchpdf(lines, tmp, callback) {
	//define consts
	var destination = tmp + '.pdf';
	var source = 'input.pdf';

	var coord = fs.readFileSync('json/coor.json', 'utf8');
	var coor = JSON.parse(coord);

	//clone source
	var pdfWriter = hummus.createWriterToModify(source, {modifiedFilePath: destination});
	var pageModifier = new hummus.PDFPageModifier(pdfWriter,0);
	var cxt = pageModifier.startContext().getContext();	

	//define fonts
	var arialFont = pdfWriter.getFontForFile('fonts/arial.ttf');
	var arialFontbd = pdfWriter.getFontForFile('fonts/arialbd.ttf');
	
	//write data
	for (var i in lines) {
		if (lines[i].font === 'plain') lines[i].font = arialFont;
		if (lines[i].font === 'bold') lines[i].font = arialFontbd;
		cxt.writeText(lines[i].text, lines[i].x, lines[i].y, {font:lines[i].font,size:lines[i].size,color:lines[i].color});
	}
	//close files
	pageModifier.endContext().writePage();
	pdfWriter.end();
	//execute callback (make json answer)
	callback(destination);
}
//export functions
exports.touchpdf = touchpdf;
