const Jimp = require('jimp');
const fs = require('fs');

const writeImage = async(img, filename)=>{
    if(img){
        const data = img.replace(/^data:image\/\w+;base64,/, "");
        const buf = Buffer.from(data, 'base64');
        Jimp.read(buf, (err, res)=>{
            if(err) throw err;
    
            res.resize(800, 500).quality(80).write(`assets/images/full/${filename}.jpg`)
            res.resize(150, 100).quality(40).write(`assets/images/mini/${filename}.jpg`)
        });
        return `${filename}.jpg`;
    }
}
const changeImage = async(img, curname, newname)=>{
    if(img){
        if(img.includes('data:image')){
            const data = img.replace(/^data:image\/\w+;base64,/, "");
            const buf = Buffer.from(data, 'base64');
            if(newname == curname){
                Jimp.read(buf, (err, res)=>{
                    res.resize(800, 500).quality(80).write(`assets/images/full/${curname}.jpg`)
                    res.resize(150, 100).quality(40).write(`assets/images/mini/${curname}.jpg`)
                });
                return `${curname}.jpg`;
            }else{
                //await deleteImage(curname+'.jpg');
                Jimp.read(buf, (err, res)=>{
                    res.resize(800, 500).quality(80).write(`assets/images/full/${newname}.jpg`)
                    res.resize(150, 100).quality(40).write(`assets/images/mini/${newname}.jpg`)
                });
                return `${newname}.jpg`;
            }
        }else{
            fs.renameSync(`assets/images/full/${curname}.jpg`, `assets/images/full/${newname}.jpg`, (err)=>{
                if(err) throw err;
            });
            fs.renameSync(`assets/images/mini/${curname}.jpg`, `assets/images/mini/${newname}.jpg`, (err)=>{
                if(err) throw err;
            });
            return `${newname}.jpg`;
        }
    }
}
const deleteImage = async(img)=>{
    if(img){
        const full = `assets/images/full/${img}`,
        mini = `assets/images/mini/${img}`
        fs.unlinkSync(full, (err)=>{
            if(err) throw err;
        });
        fs.unlinkSync(mini, (err)=>{
            if(err) throw err;
        });
    }
}

module.exports = {
    writeImage: writeImage,
    changeImage: changeImage,
    deleteImage: deleteImage
}