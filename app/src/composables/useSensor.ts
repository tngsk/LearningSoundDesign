import { ref, onMounted, onUnmounted } from 'vue'

export function useSensor() {
  const isSupported = ref(false)
  const orientation = ref({ alpha: 0, beta: 0, gamma: 0 })
  const acceleration = ref({ x: 0, y: 0, z: 0 })
  const isActive = ref(false)

  // Internal state to hold latest event data without triggering reactivity
  let latestOrientation = { alpha: 0, beta: 0, gamma: 0 }
  let latestAcceleration = { x: 0, y: 0, z: 0 }
  let rafId: number | null = null
  let isDirty = false

  const updateState = () => {
    // Only update reactive state once per frame, and only if data has changed
    if (isActive.value) {
      if (isDirty) {
          orientation.value = { ...latestOrientation }
          acceleration.value = { ...latestAcceleration }
          isDirty = false
      }
      rafId = requestAnimationFrame(updateState)
    }
  }

  const handleOrientation = (event: DeviceOrientationEvent) => {
    latestOrientation = {
      alpha: event.alpha || 0, // 0 to 360
      beta: event.beta || 0,   // -180 to 180
      gamma: event.gamma || 0  // -90 to 90
    }
    isDirty = true
  }

  const handleMotion = (event: DeviceMotionEvent) => {
    if (event.accelerationIncludingGravity) {
      latestAcceleration = {
        x: event.accelerationIncludingGravity.x || 0,
        y: event.accelerationIncludingGravity.y || 0,
        z: event.accelerationIncludingGravity.z || 0
      }
      isDirty = true
    }
  }

  const requestAccess = async () => {
    try {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission()
        if (permissionState === 'granted') {
          start()
          return true
        } else {
            console.error('Permission denied')
            return false
        }
      } else {
        start()
        return true
      }
    } catch (e) {
      console.error(e)
      return false
    }
  }

  const start = () => {
    if (!isActive.value) {
        window.addEventListener('deviceorientation', handleOrientation)
        window.addEventListener('devicemotion', handleMotion)
        isActive.value = true
        isSupported.value = true

        // Start the rAF loop if not already running
        if (rafId === null) {
            rafId = requestAnimationFrame(updateState)
        }
    }
  }

  const stop = () => {
    if (isActive.value) {
        window.removeEventListener('deviceorientation', handleOrientation)
        window.removeEventListener('devicemotion', handleMotion)
        isActive.value = false

        // Stop the rAF loop
        if (rafId !== null) {
            cancelAnimationFrame(rafId)
            rafId = null
        }
    }
  }

  onUnmounted(() => {
    stop()
  })

  // normalize beta to 0.0 - 1.0 (-90 to 90 range typical for portrait)
  const getNormalizedBeta = () => {
      let b = orientation.value.beta
      if (b < -90) b = -90
      if (b > 90) b = 90
      return (b + 90) / 180
  }

  return {
    isSupported,
    orientation,
    acceleration,
    isActive,
    requestAccess,
    start,
    stop,
    getNormalizedBeta
  }
}
