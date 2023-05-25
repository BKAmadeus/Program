import { useRef, useEffect, useState, useCallback } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser"
import { Result } from '@zxing/library'


export const BarcodeScanner = (BS:any) =>{
    const videoRef = useRef<HTMLVideoElement>(null);
    const controlsRef = useRef<IScannerControls | null>()

    useEffect(() => {
        if (!videoRef.current) {
        return
        }
        const codeReader = new BrowserMultiFormatReader()
        codeReader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, error, controls) => {
            if (error) {
            return
            }
            if (result) {
                BS.setResult(result.getText())
            }
            controlsRef.current = controls
        }
        )
        return () => {
        if (!controlsRef.current) {
            return
        }

        controlsRef.current.stop()
        controlsRef.current = null
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [BS.setResult])

    return (
        <>
            <video
            style={{ maxWidth: "100%", maxHeight: "100%", height: "100%" }}
            ref={videoRef}
            />
            <video
            style={{ maxWidth: "100%", maxHeight: "100%", height: "100%" }}
            ref={videoRef}
            />
        </>
    )
}
