import { ref, onUnmounted } from 'vue'

export function useCamera() {
  const videoElement = ref<HTMLVideoElement | null>(null)
  const canvasElement = ref<HTMLCanvasElement | null>(null)
  const stream = ref<MediaStream | null>(null)
  const isActive = ref(false)
  const brightness = ref(0) // 0.0 to 1.0
  const motion = ref(0) // 0.0 to 1.0

  let animationFrameId = 0
  let previousFrameData: Uint8ClampedArray | null = null

  const startCamera = async (videoEl: HTMLVideoElement, canvasEl: HTMLCanvasElement) => {
    videoElement.value = videoEl
    canvasElement.value = canvasEl

    try {
      stream.value = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 320, height: 240 },
        audio: false
      })
      videoElement.value.srcObject = stream.value
      await videoElement.value.play()
      isActive.value = true
      processFrame()
    } catch (e) {
      console.error("Camera access denied or error:", e)
    }
  }

  const stopCamera = () => {
    if (stream.value) {
      stream.value.getTracks().forEach(track => track.stop())
    }
    isActive.value = false
    cancelAnimationFrame(animationFrameId)
  }

  const processFrame = () => {
    if (!isActive.value || !videoElement.value || !canvasElement.value) return

    const ctx = canvasElement.value.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    // Draw video to canvas (small size for performance)
    ctx.drawImage(videoElement.value, 0, 0, canvasElement.value.width, canvasElement.value.height)

    const imageData = ctx.getImageData(0, 0, canvasElement.value.width, canvasElement.value.height)
    const data = imageData.data

    let totalBrightness = 0
    let diffCount = 0

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // Calculate brightness (luma)
      const luma = 0.299 * r + 0.587 * g + 0.114 * b
      totalBrightness += luma

      // Motion detection by frame difference
      if (previousFrameData) {
         const diff = Math.abs(r - previousFrameData[i]) +
                      Math.abs(g - previousFrameData[i+1]) +
                      Math.abs(b - previousFrameData[i+2])
         if (diff > 50) { // Threshold
             diffCount++
         }
      }
    }

    const pixelCount = data.length / 4
    brightness.value = (totalBrightness / pixelCount) / 255.0

    if (previousFrameData) {
       motion.value = Math.min(1.0, (diffCount / pixelCount) * 5) // Scale up motion a bit
    }

    // Save current frame for next difference calculation
    previousFrameData = new Uint8ClampedArray(data)

    animationFrameId = requestAnimationFrame(processFrame)
  }

  onUnmounted(() => {
    stopCamera()
  })

  return {
    startCamera,
    stopCamera,
    isActive,
    brightness,
    motion
  }
}
