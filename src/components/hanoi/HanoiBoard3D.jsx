import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { MAX_DISKS } from '../../hooks/useHanoi'

const TOWER_X = [-4, 0, 4]
const DISK_COLORS = [0x2fbd87, 0x36a9e8, 0x9368df, 0xf28a48, 0xe4b82f, 0xe35c7d, 0x5d7fe8]

export default function HanoiBoard3D({ towers, diskCount, selected, onTowerClick }) {
  const hostRef = useRef(null)
  const sceneRef = useRef(null)
  const towersRef = useRef(towers)
  const selectedRef = useRef(selected)
  const clickHandlerRef = useRef(onTowerClick)
  useEffect(() => {
    towersRef.current = towers
    selectedRef.current = selected
    clickHandlerRef.current = onTowerClick
  }, [towers, selected, onTowerClick])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#f5f7f2')
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
    camera.position.set(0, 7.7, 14)
    camera.lookAt(0, 1.15, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    host.appendChild(renderer.domElement)

    scene.add(new THREE.HemisphereLight(0xffffff, 0xc9d6ca, 2.1))
    const keyLight = new THREE.DirectionalLight(0xfff7e9, 3.1)
    keyLight.position.set(-4, 10, 7)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(1024, 1024)
    keyLight.shadow.camera.left = -9
    keyLight.shadow.camera.right = 9
    keyLight.shadow.camera.top = 9
    keyLight.shadow.camera.bottom = -9
    scene.add(keyLight)
    const fillLight = new THREE.DirectionalLight(0xddeaff, 1.1)
    fillLight.position.set(6, 5, -5)
    scene.add(fillLight)

    const diskMeshes = new Map()
    const clickable = []
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: '#f5f7f2', roughness: 1 }))
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.04
    ground.receiveShadow = true
    scene.add(ground)

    const platform = new THREE.Mesh(new THREE.BoxGeometry(11.8, 0.42, 3.1), new THREE.MeshStandardMaterial({ color: '#dfd1bd', roughness: 0.65 }))
    platform.position.set(0, 0.05, 0)
    platform.castShadow = true
    platform.receiveShadow = true
    scene.add(platform)
    const platformTop = new THREE.Mesh(new THREE.BoxGeometry(11.65, 0.12, 2.95), new THREE.MeshStandardMaterial({ color: '#efe5d7', roughness: 0.55 }))
    platformTop.position.set(0, 0.31, 0)
    platformTop.receiveShadow = true
    scene.add(platformTop)

    TOWER_X.forEach((x, towerIndex) => {
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.52, 0.15, 48), new THREE.MeshStandardMaterial({ color: '#c9b79e', roughness: 0.5 }))
      foot.position.set(x, 0.43, 0)
      foot.castShadow = true
      scene.add(foot)
      const peg = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.14, 3.45, 32), new THREE.MeshStandardMaterial({ color: '#d7c7b0', roughness: 0.35, metalness: 0.08 }))
      peg.position.set(x, 2.18, 0)
      peg.castShadow = true
      peg.receiveShadow = true
      peg.userData = { towerIndex, type: 'tower' }
      scene.add(peg)
      clickable.push(peg)
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.17, 24, 16), new THREE.MeshStandardMaterial({ color: '#cdb99f', roughness: 0.4 }))
      cap.position.set(x, 3.95, 0)
      cap.castShadow = true
      scene.add(cap)

      // Broad invisible hit area makes empty towers easy to select on touch screens.
      const hitArea = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.08, 2.5), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }))
      hitArea.position.set(x, 0.36, 0)
      hitArea.userData = { towerIndex, type: 'tower' }
      scene.add(hitArea)
      clickable.push(hitArea)
    })

    for (let disk = 1; disk <= MAX_DISKS; disk += 1) {
      const radius = 0.37 + disk * 0.14
      const color = DISK_COLORS[(disk - 1) % DISK_COLORS.length]
      const material = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.1, roughness: 0.28, metalness: 0.035 })
      const shape = new THREE.Shape()
      shape.absarc(0, 0, radius, 0, Math.PI * 2, false)
      const hole = new THREE.Path()
      hole.absarc(0, 0, 0.19, 0, Math.PI * 2, true)
      shape.holes.push(hole)
      const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.22, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.035, bevelThickness: 0.025, curveSegments: 48 })
      geometry.translate(0, 0, -0.11)
      geometry.rotateX(-Math.PI / 2)
      const mesh = new THREE.Mesh(geometry, material)
      const initialTower = towersRef.current.findIndex((stack) => stack.includes(disk))
      const initialLevel = towersRef.current[initialTower]?.indexOf(disk) ?? 0
      mesh.position.set(TOWER_X[Math.max(initialTower, 0)], 0.66 + initialLevel * 0.29, 0)
      mesh.visible = disk <= towersRef.current.flat().length
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.userData = { disk, type: 'disk', towerIndex: Math.max(initialTower, 0), baseY: mesh.position.y }
      scene.add(mesh)
      diskMeshes.set(disk, mesh)
      clickable.push(mesh)
    }

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    const onPointerUp = (event) => {
      if (event.target !== renderer.domElement) return
      const bounds = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const hit = raycaster.intersectObjects(clickable, false).find((item) => item.object.userData.type)
      if (!hit) return
      const { disk, towerIndex } = hit.object.userData
      if (disk) {
        const stack = towersRef.current[towerIndex]
        if (stack.at(-1) !== disk) return
      }
      clickHandlerRef.current(towerIndex)
    }
    renderer.domElement.addEventListener('pointerup', onPointerUp)

    const resize = () => {
      const { width, height } = host.getBoundingClientRect()
      if (!width || !height) return
      camera.aspect = width / height
      camera.fov = width < 500 ? 38 : 32
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }
    const observer = new ResizeObserver(resize)
    observer.observe(host)
    resize()

    const motions = new Map()
    let frame = 0
    const animate = () => {
      frame = requestAnimationFrame(animate)
      const now = performance.now()
      for (const [disk, mesh] of diskMeshes) {
        const motion = motions.get(disk)
        if (motion) {
          const progress = Math.min((now - motion.startTime) / 720, 1)
          const lift = Math.max(motion.from.y, motion.to.y) + 1.6
          if (progress < 0.22) {
            const t = progress / 0.22
            mesh.position.set(motion.from.x, THREE.MathUtils.lerp(motion.from.y, lift, t), motion.from.z)
          } else if (progress < 0.78) {
            const t = (progress - 0.22) / 0.56
            mesh.position.set(THREE.MathUtils.lerp(motion.from.x, motion.to.x, t), lift + Math.sin(t * Math.PI) * 0.24, THREE.MathUtils.lerp(motion.from.z, motion.to.z, t))
          } else {
            const t = (progress - 0.78) / 0.22
            mesh.position.set(motion.to.x, THREE.MathUtils.lerp(lift, motion.to.y, t), motion.to.z)
          }
          if (progress === 1) {
            motions.delete(disk)
            mesh.userData.baseY = motion.to.y
          }
          else continue
        }
        const isTop = towersRef.current[mesh.userData.towerIndex]?.at(-1) === disk
        const isSelected = selectedRef.current === mesh.userData.towerIndex && isTop
        mesh.material.emissiveIntensity = isSelected ? 0.38 : 0.1
        mesh.position.y = mesh.userData.baseY + (isSelected ? 0.06 + Math.sin(now * 0.004) * 0.045 : 0)
      }
      renderer.render(scene, camera)
    }
    animate()

    const syncState = (nextTowers, nextDiskCount) => {
      for (let towerIndex = 0; towerIndex < nextTowers.length; towerIndex += 1) {
        nextTowers[towerIndex].forEach((disk, level) => {
          const mesh = diskMeshes.get(disk)
          if (!mesh) return
          mesh.visible = disk <= nextDiskCount
          const destination = new THREE.Vector3(TOWER_X[towerIndex], 0.66 + level * 0.29, 0)
          if (mesh.userData.towerIndex !== towerIndex || Math.abs(mesh.position.y - destination.y) > 0.08) {
            motions.set(disk, { from: mesh.position.clone(), to: destination, startTime: performance.now() })
            mesh.userData.towerIndex = towerIndex
          }
        })
      }
      for (const [disk, mesh] of diskMeshes) mesh.visible = disk <= nextDiskCount
    }
    sceneRef.current = { syncState }
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      renderer.domElement.removeEventListener('pointerup', onPointerUp)
      scene.traverse((object) => {
        object.geometry?.dispose()
        if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose())
        else object.material?.dispose()
      })
      renderer.dispose()
      renderer.domElement.remove()
      sceneRef.current = null
    }
  }, [])

  useEffect(() => {
    sceneRef.current?.syncState(towers, diskCount)
  }, [towers, diskCount])

  return <div className="board-3d-wrap">
    <div className="board-3d-stage">
      <div className="board-3d" ref={hostRef} role="img" aria-label="Tablero 3D interactivo de Torres de Hanoi. Selecciona el disco superior y después la torre de destino." />
      <div className="touch-tower-targets" aria-label="Seleccionar una torre">
        {['Torre A', 'Torre B', 'Torre C'].map((name, index) => <button key={name} type="button" className={selected === index ? 'active' : ''} aria-label={`${selected === null ? 'Seleccionar disco superior de' : 'Mover disco a'} ${name}`} onClick={() => onTowerClick(index)} />)}
      </div>
    </div>
    <div className="tower-labels">{['Torre A', 'Torre B', 'Torre C'].map((name, index) => <button type="button" key={name} className={selected === index ? 'active' : ''} onClick={() => onTowerClick(index)}>{name}<span>{towers[index].length ? `${towers[index].length} ${towers[index].length === 1 ? 'disco' : 'discos'}` : 'Vacía'}</span></button>)}</div>
    <p className="board-hint"><span className="desktop-board-hint">{selected === null ? 'Haz clic en el disco superior para levantarlo' : 'Ahora elige la torre donde quieres colocarlo'}</span><span className="mobile-board-hint">{selected === null ? 'Toca una torre para tomar su disco superior' : 'Toca la torre donde quieres dejarlo'}</span> · Movimiento animado en 3D</p>
  </div>
}
