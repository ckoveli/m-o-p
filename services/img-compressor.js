const fs = require('fs');

// Tested, not implemented yet

module.exports = (img)=>{
    var data = img.replace(/^data:image\/\w+;base64,/, "");
    var buf = Buffer.from(data, 'base64');
    fs.writeFileSync('image.jpg', buf);
} 