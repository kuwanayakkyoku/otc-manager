// src/components/scanner/barcode-scanner.tsx
"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

interface BarcodeScannerProps {
  onDetected: (code: string) => void;
  onError?: (err: string) => void;
}

export function BarcodeScanner({ onDetected, onError }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [usingNative, setUsingNative] = useState(false);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const detectedRef = useRef(false);

  const handleCode = useCallback(
    (code: string) => {
      if (detectedRef.current) return;
      detectedRef.current = true;
      onDetected(code);
    },
    [onDetected]
  );

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function start() {
      try {
        // BarcodeDetector API (Chrome/Safari 17+)
        if ("BarcodeDetector" in window) {
          setUsingNative(true);
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
          });
          if (!videoRef.current) return;
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setIsReady(true);

          // @ts-ignore — BarcodeDetector not in TS lib yet
          const detector = new window.BarcodeDetector({ formats: ["ean_13", "ean_8", "code_128"] });

          const scan = async () => {
            if (!videoRef.current || detectedRef.current) return;
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes.length > 0) {
                handleCode(barcodes[0].rawValue);
                return;
              }
            } catch {}
            requestAnimationFrame(scan);
          };
          requestAnimationFrame(scan);
        } else {
          // Fallback: zxing-js
          setUsingNative(false);
          const reader = new BrowserMultiFormatReader();
          readerRef.current = reader;
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
          });
          if (!videoRef.current) return;
          videoRef.current.srcObject = stream;
          setIsReady(true);
          reader.decodeFromStream(stream, videoRef.current, (result, err) => {
            if (result) handleCode(result.getText());
          });
        }
      } catch (e) {
        onError?.("カメラへのアクセスが拒否されました。設定から許可してください。");
      }
    }

    start();

    return () => {
      detectedRef.current = false;
      readerRef.current?.reset();
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [handleCode, onError]);

  return (
    <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        muted
        playsInline
        autoPlay
      />
      {/* Scan frame overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-56 h-36">
          {/* Corners */}
          {["top-0 left-0 border-t-4 border-l-4", "top-0 right-0 border-t-4 border-r-4",
            "bottom-0 left-0 border-b-4 border-l-4", "bottom-0 right-0 border-b-4 border-r-4"].map((c, i) => (
            <div key={i} className={`absolute w-8 h-8 border-white rounded-sm ${c}`} />
          ))}
          {/* Scan line animation */}
          <div className="absolute inset-x-2 h-0.5 bg-blue-400 opacity-80 animate-scan top-1/2" />
        </div>
      </div>
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <p className="text-white text-sm">カメラを起動中…</p>
        </div>
      )}
      {isReady && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center">
          <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full">
            {usingNative ? "Native Scanner" : "ZXing Scanner"} — バーコードをフレームに合わせてください
          </span>
        </div>
      )}
    </div>
  );
}
