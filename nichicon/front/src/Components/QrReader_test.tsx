import { useState,useEffect, useRef } from 'react';
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser"
import { Result } from '@zxing/library';

export const WebcamCanvas = (BS:any) =>{
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [width,setWidth] = useState<number>(1000);
    const [height,setHeight] = useState<number>(1000);
    const codeReader = new BrowserMultiFormatReader()
    
    // video要素をつくる
    useEffect(()=>{
        if(videoRef){
            navigator.mediaDevices.getUserMedia({
                audio:false,
                video:{
                    facingMode:"environment",
                }
            })
            .then((stream) => {
              if (videoRef?.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
              }
            })
        }
        if(canvasRef){
            const ctx = canvasRef.current?.getContext('2d', { willReadFrequently: true });
            setInterval(()=>{
                if(canvasRef && ctx && videoRef.current){
                    setHeight(videoRef.current.videoHeight);
                    setWidth(videoRef.current.videoWidth);
                    ctx.drawImage(videoRef.current, 0, 0, videoRef.current.videoWidth, videoRef.current.videoHeight);
                    if(videoRef.current.videoWidth && videoRef.current.videoHeight){
                        let src = ctx.getImageData(0, 0, videoRef.current.videoWidth, videoRef.current.videoHeight);
                        let dst = ctx.createImageData(videoRef.current.videoWidth, videoRef.current.videoHeight);
                        
                        for (let i = 0; i < src.data.length; i += 4) {
                          let y = 0.2126 * src.data[i] + 0.7152 * src.data[i + 1]
                            + 0.0722 * src.data[i + 2];
                          y = Math.round(y);
                          dst.data[i] = y;
                          dst.data[i + 1] = y;
                          dst.data[i + 2] = y;
                          dst.data[i + 3] = src.data[i + 3];
                        }
                        ctx.putImageData(dst, 0, 0);
                        if(canvasRef.current){
                            try{
                                var result = codeReader.decodeFromCanvas(canvasRef.current);
                                if(result && result.getText()){
                                    BS.setResult(result.getText())
                                }
                            } catch(e) {

                            }
                        }
                    }
                }
            })
        }
        console.log("カメラ情報",videoRef);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[videoRef])

    
    return (
        <div>
          <video ref={videoRef}/>
          <canvas ref={canvasRef} width={width} height={height}/>
          
        </div>
    )
}