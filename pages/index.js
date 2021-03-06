import Head from 'next/head'
import Script from 'next/script'
import { useRef, useEffect, useState } from 'react';
import styles from '../styles/Home.module.css'

export default function Home() {
    const videoRef = useRef(null);
    const canvasTarget = useRef(null);
    const canvas = useRef(null);
    let ofset = 0;
    let ctxTarget = null;
    let ctx = null;

    let detector;
    let objects = [];

    async function setup(){
        try {

            if(!canvasTarget.current){
                console.log("CanvasTarget negativo");
                return
            }

            // videoRef.current.src = "/videos/gato.mp4";

            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({
                    'audio': false,
                    'video': {facingMode: 'environment'}
                });
                videoRef.current.srcObject = stream
                videoRef.current.onloadedmetadata = function(e) {
                    videoRef.current.play();
                    console.log("Carregou o vídeo!")

                    const sizeTarget = getSize(videoRef.current.videoWidth, videoRef.current.videoHeight, 350)
                    const size = getSize(videoRef.current.videoWidth, videoRef.current.videoHeight, window.innerWidth)

                    // ofset = (sizeTarget.width / size.width) * 100 / 2;

                    canvasTarget.current.width = sizeTarget.width;
                    canvasTarget.current.height = sizeTarget.height;
                    canvasTarget.current.style.display="none";

                    canvas.current.width = size.width;
                    canvas.current.height = size.height;
                };
            }

            // Models available are 'cocossd', 'yolo'
            detector = ml5.objectDetector('cocossd', modelReady);

            ctxTarget = canvasTarget.current.getContext('2d');
            ctx = canvas.current.getContext('2d');

            requestAnimationFrame(draw);
        
        } catch(err) {
            console.log(err.name + ": " + err.message);
        }
    }

    function getSize(vWidth, vHeight, desiredSize){
        let percent = 0;
      
        if(vHeight > vWidth) {
            console.log("Vertical")
            percent = (desiredSize / vHeight) * 100;
            return {width: vWidth - (vWidth - (percent / 100) * vWidth), height: desiredSize}
        }else if(vHeight < vWidth) {
            console.log("Horizontal")
            percent = (desiredSize / vWidth) * 100;
            return {width: desiredSize, height: vHeight - (vHeight - (percent / 100) * vHeight)}
        }else{
            console.log("Quadrado", vWidth, vHeight)
            return {width: desiredSize, height: desiredSize }
        }
    }

    function gotDetections(error, results) {
        if (error) {
          console.error(error);
        }
        objects = results;
        detector.detect(canvasTarget.current, gotDetections);
    }

    function modelReady() {
        detector.detect(canvasTarget.current, gotDetections);
      }

    function draw() {

        ctx.fillStyle = "#dae3e4"
        ctx.fillRect(0, 0, canvasTarget.current.width, canvasTarget.current.height);
      
        ctxTarget.drawImage(videoRef.current, 0, 0, canvasTarget.current.width, canvasTarget.current.height);

        ctx.drawImage(videoRef.current, 0, 0, canvas.current.width, canvas.current.height);
      
        for (let i = 0; i < objects.length; i += 1) {
      
          ctx.font = "16px Arial";
          ctx.fillStyle = "rgb(0, 255, 0)";
          ctx.fillText(objects[i].label + " " + Math.round(objects[i].confidence * 100) + "%", objects[i].x + 10 + ofset, objects[i].y + 20 + ofset);
      
          ctx.beginPath();
          ctx.rect(objects[i].x + ofset, objects[i].y + ofset, objects[i].width + ofset, objects[i].height + ofset);
          ctx.lineWidth = 3;
          ctx.strokeStyle = "rgb(0, 255, 0)";
          ctx.stroke();
          ctx.closePath();
        }
      
        requestAnimationFrame(draw)
    }

    useEffect(() => {
        setup();
    });

    return (
        <div className={styles.container}>
            <Head>
                <title>Create Next App</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
                {/* <script src="https://unpkg.com/ml5@latest/dist/ml5.min.js"></script> */}
            </Head>
            <Script src="https://unpkg.com/ml5@latest/dist/ml5.min.js" />

            <main className={styles.main}>
                <h1 className={styles.title}>
                    Detector
                </h1>

                <video 
                className={styles.camera}
                autoPlay 
                playsInline
                muted
                ref={videoRef}
                >
                </video>
                <canvas ref={canvasTarget}>
                    Canvas não é suportado aqui mano.
                </canvas>

                <canvas ref={canvas}>
                    Canvas não é suportado aqui mano.
                </canvas>
            </main>

            <footer className={styles.footer}>
                Powered by Mariano.
            </footer>
        </div>
    )
}
