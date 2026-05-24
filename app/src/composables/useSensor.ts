import { ref, onMounted, onUnmounted } from 'vue'

export function useSensor() {
  const isSupported = ref(false)
  const orientation = ref({ alpha: 0, beta: 0, gamma: 0 })
  const acceleration = ref({ x: 0, y: 0, z: 0 })
  const isActive = ref(false)

  const handleOrientation = (event: DeviceOrientationEvent) => {
    orientation.value = {
      alpha: event.alpha || 0, // 0 to 360
      beta: event.beta || 0,   // -180 to 180
      gamma: event.gamma || 0  // -90 to 90
    }
  }

  const handleMotion = (event: DeviceMotionEvent) => {
    if (event.accelerationIncludingGravity) {
      acceleration.value = {
        x: event.accelerationIncludingGravity.x || 0,
        y: event.accelerationIncludingGravity.y || 0,
        z: event.accelerationIncludingGravity.z || 0
      }
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
    }
  }

  const stop = () => {
    if (isActive.value) {
        window.removeEventListener('deviceorientation', handleOrientation)
        window.removeEventListener('devicemotion', handleMotion)
        isActive.value = false
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
