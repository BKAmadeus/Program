var Canvas = require('canvas'),
    Image = Canvas.Image;

exports.PicChange = async function(url,TubeColor=[0,0,0],StringColor=[200,200,200]) {
    var ans = {};
    // データをcanvasのcontextに設定
    var img = new Image;
    img.src = url;
    // 2019年10月追記: いつの間にかcanvasの生成方法が変わったらしいです
    //var canvas = new Canvas(img.width, img.height);
    var canvas = Canvas.createCanvas(img.width, img.height);
    var ctx = canvas.getContext('2d');
    //2022/12/01 変換するのを待つ必要がある。node.jsのお気に入りフォルダの一番下を参考にする
    ctx.drawImage(img, 0, 0, img.width, img.height);
    if(!TubeColor){
        TubeColor=[0,0,0]
    }
    if(!StringColor){
        StringColor=[200,200,200]
    }

    // RGBの画素値の配列を取得
    var imagedata = ctx.getImageData(0, 0, img.width, img.height);
    
    if(imagedata.height*imagedata.width*4 === imagedata.data.length){
        for(var y=0; y<imagedata.height; y++){
            for(var x=0; x<imagedata.width; x++){
                var index = (y*imagedata.width+x)*4;
                var color = (imagedata.data[index]+imagedata.data[index+1]+imagedata.data[index+2])/3 > 128? TubeColor:StringColor;
                imagedata.data[index] = color[0]; // R
                imagedata.data[index+1] = color[1]; // G
                imagedata.data[index+2] = color[2]; // B
                imagedata.data[index+3] = 255; // alpha
            }
        }
    }
    else if(imagedata.height*imagedata.width*3 === imagedata.data.length){
        for(var y=0; y<imagedata.height; y++){
            for(var x=0; x<imagedata.width; x++){
                var index = (y*imagedata.width+x)*3;
                var color = (imagedata.data[index]+imagedata.data[index+1]+imagedata.data[index+2])/3 > 128? TubeColor:StringColor;
                imagedata.data[index] = color[0]; // R
                imagedata.data[index+1] = color[1]; // G
                imagedata.data[index+2] = color[2]; // B
                // imagedata.data[index+3]; // alpha
            }
        }
    }
    
    ans.width = imagedata.width;
    ans.height = imagedata.height;
    // 加工したデータをセット
    ctx.putImageData(imagedata, 0, 0);
    ans.data = await canvas_to_base64(canvas)
    return ans
};

const canvas_to_base64 = async (canvas) => {
    return canvas.toDataURL().split(',')[1];
}