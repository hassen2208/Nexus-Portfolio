import { Text } from '@react-three/drei';
import { Suspense } from 'react';
import SystemsRoomAsset from './SystemsRoomAsset.jsx';
import * as THREE from 'three';
import { STATIONS } from '../content/stations.js';
import { SystemsHologram, DataHologram, ProjectsHologram } from './Holograms.jsx';

const palette = {
  hub: { floor: '#202931', wall: '#686861', metal: '#b6b4a5', light: '#d9e8d8', accent: '#75d6df' },
  systems: { floor: '#0b2535', wall: '#1d4354', metal: '#365f73', light: '#5be0ff', accent: '#64e3f8' },
  data: { floor: '#161b3b', wall: '#262452', metal: '#3e3a66', light: '#9d7fff', accent: '#ab9cf5' },
  projects: { floor: '#30251f', wall: '#604335', metal: '#89705b', light: '#f4b773', accent: '#f0b579' }
};

function Block({position, size, color, metalness=0.43, emissive, emissiveIntensity=0}) {
  return <mesh castShadow receiveShadow position={position}>
    <boxGeometry args={size}/>
    <meshStandardMaterial color={color} metalness={metalness} roughness={0.55} emissive={emissive || '#000000'} emissiveIntensity={emissiveIntensity}/>
  </mesh>;
}
function LightBar({position, size, color}) {
  return <mesh position={position}><boxGeometry args={size}/><meshBasicMaterial color={color}/></mesh>;
}
function Floor({x,z,w,d,color,accent}) {
  return <group>
    <Block position={[x,-0.22,z]} size={[w,0.42,d]} color={color} metalness={0.15}/>
    {Array.from({length:Math.floor(w/1.65)},(_,i)=><LightBar key={'w'+i} position={[x-w/2+(i+1)*w/(Math.floor(w/1.65)+1),0.008,z]} size={[0.012,0.014,d-0.1]} color={accent}/>)}
    {Array.from({length:Math.floor(d/1.75)},(_,i)=><LightBar key={'d'+i} position={[x,0.01,z-d/2+(i+1)*d/(Math.floor(d/1.75)+1)]} size={[w-0.1,0.012,0.012]} color={accent}/>)}
  </group>;
}
function Wall({x,z,w,d,h=3.2,color,accent,trim=true}) {
  return <group>
    <Block position={[x,h/2,z]} size={[w,h,d]} color={color}/>
    {trim&&<LightBar position={[x,h-0.12,z+d/2+0.03]} size={[w,0.09,0.03]} color={accent}/>}
  </group>;
}
function Portal({x,z,width=3.8,height=3.45,accent,metal}) {
  return <group position={[x,0,z]}>
    <Block position={[-width/2+0.1,height/2,0]} size={[0.25,height,0.4]} color={metal}/>
    <Block position={[width/2-0.1,height/2,0]} size={[0.25,height,0.4]} color={metal}/>
    <Block position={[0,height-0.12,0]} size={[width,0.24,0.43]} color={metal}/>
    <LightBar position={[0,height-0.28,0.24]} size={[width-0.5,0.08,0.028]} color={accent}/>
    <LightBar position={[-width/2+0.25,1.45,0.25]} size={[0.035,2.55,0.025]} color={accent}/>
    <LightBar position={[width/2-0.25,1.45,0.25]} size={[0.035,2.55,0.025]} color={accent}/>
  </group>;
}
function WorldText({position,children,color='#edf6f4',size=0.25,maxWidth=4}){
  return <Text position={position} fontSize={size} color={color} maxWidth={maxWidth} anchorX="center" anchorY="middle" fontWeight={700}>{children}</Text>;
}
function WallMonitor({position, size=[1.05,0.82], color='#67d8e9'}) {
  return <group position={position}>
    <Block position={[0,0,0]} size={[size[0]+0.11,size[1]+0.09,0.15]} color="#0e1c27" metalness={0.7}/>
    <mesh position={[0,0,0.084]}><planeGeometry args={size}/><meshBasicMaterial color="#0a2632"/></mesh>
    {Array.from({length:5},(_,i)=><LightBar key={i} position={[-size[0]*0.15,0.27-i*0.12,0.092]} size={[i%2?size[0]*0.28:size[0]*0.49,0.025,0.02]} color={color}/>)}
  </group>;
}
function CommandConsole({x,z,accent,scale=1}) {
  return <group position={[x,0,z]} scale={scale}>
    <Block position={[0,0.51,0]} size={[2.0,0.33,0.87]} color="#242c33"/>
    <Block position={[-0.69,0.22,0.06]} size={[0.18,0.55,0.50]} color="#6e7170"/>
    <Block position={[0.69,0.22,0.06]} size={[0.18,0.55,0.50]} color="#6e7170"/>
    <mesh position={[0,0.74,-0.1]} rotation={[-0.38,0,0]}><boxGeometry args={[1.65,0.55,0.08]}/><meshStandardMaterial color="#132f39" metalness={0.3} emissive={accent} emissiveIntensity={0.15}/></mesh>
    <LightBar position={[0,0.55,0.46]} size={[1.6,0.048,0.025]} color={accent}/>
  </group>;
}
function Hub(){
  const p=palette.hub;
  return <group>
    <Floor x={0} z={4} w={12} d={13} color={p.floor} accent="#30444c"/>
    <Wall x={-5.9} z={5} w={0.28} d={9.5} color={p.wall} accent={p.accent}/>
    <Wall x={5.9} z={5} w={0.28} d={9.5} color={p.wall} accent={p.accent}/>
    <Wall x={0} z={10.4} w={12} d={0.28} color={p.wall} accent={p.accent}/>
    <Wall x={-4.8} z={-2.3} w={1.7} d={0.28} color={p.wall} accent={p.accent}/>
    <Wall x={4.8} z={-2.3} w={1.7} d={0.28} color={p.wall} accent={p.accent}/>
    <Portal x={0} z={-2.35} width={4.5} height={3.95} metal={p.metal} accent={p.accent}/>
    {[-4.5,4.5].map(x=><group key={x}>
      <Block position={[x,2.15,5.7]} size={[0.32,4.3,0.44]} color={p.metal}/>
      <LightBar position={[x,2.0,5.95]} size={[0.07,3.0,0.03]} color={p.light}/>
      <WorldText position={[x,3.58,8]} color="#f7e5c2" size={0.17}>DECK 01</WorldText>
      <CommandConsole x={x*.83} z={6.8} accent={p.accent} scale={0.92}/>
      <WallMonitor position={[x,1.75,9.99]} size={[1.12,0.88]} color="#72d7e8"/>
    </group>)}
    <mesh position={[0,4.45,4.3]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[3.0,0.14,8,56]}/><meshStandardMaterial color={p.metal} emissive={p.accent} emissiveIntensity={0.25}/></mesh>
    <mesh position={[0,4.45,4.3]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[2.48,0.035,6,56]}/><meshBasicMaterial color={p.light}/></mesh>
    {[-1,1].map(dir=><group key={dir}>
      <Block position={[dir*3.35,3.56,3.4]} size={[0.44,0.3,7]} color={p.metal}/>
      <LightBar position={[dir*3.35,3.31,3.4]} size={[0.055,0.03,6.4]} color={p.light}/>
    </group>)}
    <Block position={[0,0.54,5.0]} size={[3.5,0.42,1.7]} color="#72736f"/>
    <Block position={[-1.25,0.22,5.0]} size={[0.28,0.6,0.6]} color="#a3a49b"/>
    <Block position={[1.25,0.22,5.0]} size={[0.28,0.6,0.6]} color="#a3a49b"/>
    <mesh position={[0,0.80,4.8]} rotation={[-0.21,0,0]}><boxGeometry args={[2.7,0.15,0.92]}/><meshStandardMaterial color="#0f2a36" emissive="#4d8d9d" emissiveIntensity={0.2}/></mesh>
    <LightBar position={[0,0.8,5.84]} size={[2.4,0.06,0.04]} color={p.light}/>
    <WorldText position={[0,2.68,3.08]} size={0.46} color="#f3f0e7">N E X U S</WorldText>
    <WorldText position={[0,2.20,3.08]} size={0.18} color="#9ce0e8">OPERATIONS CORE / SECTOR 00</WorldText>
    <pointLight position={[0,3.3,4]} intensity={2.6} distance={13} color="#d0eeec"/>
  </group>;
}
function ServerRack({x,z,color}){
  return <group position={[x,0,z]}>
    <Block position={[0,1.2,0]} size={[0.75,2.3,1.15]} color="#142a3a" metalness={0.75}/>
    {Array.from({length:8},(_,i)=><group key={i}>
      <Block position={[0,0.35+i*0.26,0.6]} size={[0.62,0.16,0.03]} color="#1d5163"/>
      <LightBar position={[-0.23,0.35+i*0.26,0.64]} size={[0.10,0.03,0.015]} color={color}/>
    </group>)}
  </group>;
}
function Lab({station,children}){
  const isData=station.id==='data';
  const w=isData?8.3:7.7, d=isData?7.0:6.9;
  const p=palette[station.id];
  const [x,,z]=station.position;
  return <group>
    <Floor x={x} z={z} w={w} d={d} color={p.floor} accent={p.wall}/>
    <Wall x={x} z={z-d/2+0.12} w={w} d={0.28} color={p.wall} accent={p.accent}/>
    <Wall x={x-w/2+0.15} z={z-0.65} w={0.3} d={d-1.3} color={p.wall} accent={p.accent}/>
    <Wall x={x+w/2-0.15} z={z-0.65} w={0.3} d={d-1.3} color={p.wall} accent={p.accent}/>
    <Portal x={x} z={z+d/2-0.18} width={isData?3.0:3.3} height={3.6} metal={p.metal} accent={p.accent}/>
    <WorldText position={[x,3.92,z+d/2-0.04]} size={0.20} color={p.light}>{station.number}  /  {station.shortName.toUpperCase()}</WorldText>
    <mesh position={[x,0.025,z+0.7]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[1.55,1.62,60]}/><meshBasicMaterial color={p.accent} side={THREE.DoubleSide} transparent opacity={0.52}/></mesh>
    {children}
    <pointLight position={[x,3.3,z-1]} color={p.light} intensity={2.2} distance={7}/>
  </group>;
}
function SystemsRoom({selectedNode,onSelectNode,active}) {
  const p=palette.systems;
  return <Lab station={STATIONS[0]}>
    {/* Custom user-supplied scene is the architectural centerpiece of Room 01.
        Old racks are removed to avoid clipping through the imported console. */}
    <Suspense fallback={<group position={[-9,1.4,-7.58]}>
      <mesh><boxGeometry args={[5.15,2.8,4.8]}/><meshBasicMaterial color={p.accent} wireframe transparent opacity={0.24}/></mesh>
    </group>}>
      <SystemsRoomAsset />
    </Suspense>
    <pointLight position={[-9,3.45,-7]} color="#ffebc6" intensity={1.9} distance={7.5}/>
    <pointLight position={[-9,3.2,-9.4]} color={p.accent} intensity={1.3} distance={6}/>
    {[-11.8,-6.2].map(x => <group key={x}>
      <LightBar position={[x,0.045,-4.56]} size={[0.08,0.03,1.4]} color={p.accent}/>
      <LightBar position={[x,0.045,-7.0]} size={[0.08,0.03,1.5]} color={p.accent}/>
    </group>)}
    <SystemsHologram active={active} selectedNode={selectedNode} onSelectNode={onSelectNode}/>
  </Lab>;
}
function DataRoom() {
  const p=palette.data;
  return <Lab station={STATIONS[1]}>
    {[[-2.6,-14.5],[2.6,-14.5],[-2.6,-12.1],[2.6,-12.1]].map(([x,z],i)=><group key={i}>
      <Block position={[x,1.1,z]} size={[0.58,2.2,0.58]} color={p.metal}/>
      <LightBar position={[x,2.25,z]} size={[0.53,0.12,0.53]} color={p.light}/>
    </group>)}
    <mesh position={[0,3.92,-13.85]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[2.15,0.07,8,64]}/><meshBasicMaterial color={p.accent}/></mesh>
    {Array.from({length:5},(_,i)=><mesh key={i} position={[-1.38+i*.69,.55+(i%3)*.27,-12.2]}>
      <cylinderGeometry args={[0.19,0.23,0.9+(i%3)*.54,10]}/><meshStandardMaterial color="#403b74" emissive={p.accent} emissiveIntensity={0.35} transparent opacity={0.85}/>
    </mesh>)}
    <DataHologram/>
  </Lab>;
}
function ProjectsRoom(){
  const p=palette.projects;
  return <Lab station={STATIONS[2]}>
    {[6.4,9,11.6].map((x,i)=><group key={i}>
      <Block position={[x,0.55,-6.35]} size={[0.75,1.1,1.2]} color="#554133"/>
      <Block position={[x,1.15,-6.35]} size={[1.03,0.14,1.36]} color={p.metal}/>
      <LightBar position={[x,1.24,-6.35]} size={[0.76,0.025,1.0]} color={p.accent}/>
    </group>)}
    {[-1,1].map(d=><mesh key={d} position={[9+d*2.4,3.75,-7]} rotation={[Math.PI/2,0,0]}>
      <torusGeometry args={[0.75,0.06,6,28]}/><meshBasicMaterial color={p.accent}/>
    </mesh>)}
    <ProjectsHologram/>
  </Lab>;
}
export default function Complex({selectedNode,onSelectNode,activeRoom}){
  return <group>
    <color attach="background" args={['#070b13']}/>
    <fog attach="fog" args={['#070b13',33,65]}/>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.49,-3]} receiveShadow><planeGeometry args={[80,80]}/><meshStandardMaterial color="#080f18" roughness={0.92}/></mesh>
    <gridHelper args={[54,54,'#274254','#142738']} position={[0,-0.476,-3]}/>
    <Floor x={0} z={-7.2} w={3.7} d={10.0} color="#213646" accent="#4b6672"/>
    <Floor x={-5.55} z={-3.35} w={7.4} d={3.25} color="#233a47" accent="#506775"/>
    <Floor x={5.55} z={-3.35} w={7.4} d={3.25} color="#233a47" accent="#506775"/>
    <Hub/>
    <SystemsRoom selectedNode={selectedNode} onSelectNode={onSelectNode} active={activeRoom==='systems'}/>
    <DataRoom/>
    <ProjectsRoom/>
  </group>;
}
