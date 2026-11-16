import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { SYSTEM_NODES } from '../content/stations.js';

function Txt({ children, position, size = 0.16, width = 4, color = '#ecfbff', bold = false, align = 'left' }) {
  return <Text position={position} color={color} fontSize={size} maxWidth={width}
    anchorX={align} anchorY="middle" lineHeight={1.25} fontWeight={bold ? 700 : 400}>
    {children}
  </Text>;
}

function HoloFrame({ width = 5.25, height = 2.9, accent = '#73e7ee' }) {
  return <group>
    <mesh><planeGeometry args={[width, height]}/><meshBasicMaterial color="#071421" side={THREE.DoubleSide} transparent opacity={0.87} depthWrite={false}/></mesh>
    <mesh position={[0, 0, -0.018]}><planeGeometry args={[width + 0.14, height + 0.14]}/><meshBasicMaterial color={accent} transparent opacity={0.07} depthWrite={false} side={THREE.DoubleSide}/></mesh>
    {[-1, 1].map(side => <group key={side}>
      <mesh position={[side * width/2,0,0.02]}><boxGeometry args={[0.027,height,0.025]}/><meshBasicMaterial color={accent}/></mesh>
      <mesh position={[0,side * height/2,0.02]}><boxGeometry args={[width,0.027,0.025]}/><meshBasicMaterial color={accent}/></mesh>
    </group>)}
    <mesh position={[0,height/2 - 0.11,0.03]}><boxGeometry args={[width-0.22,0.024,0.02]}/><meshBasicMaterial color={accent} transparent opacity={0.65}/></mesh>
    <mesh position={[0,-height/2 + 0.12,0.03]}><boxGeometry args={[width-0.22,0.024,0.02]}/><meshBasicMaterial color={accent} transparent opacity={0.35}/></mesh>
  </group>;
}

function NodeButton({ node, position, selected, onSelect }) {
  const color = selected ? '#b4fdff' : '#66b9c7';
  return <group position={position}>
    <mesh onClick={e => {e.stopPropagation(); onSelect(node.id)}}
      onPointerOver={() => {document.body.style.cursor='pointer'}}
      onPointerOut={() => {document.body.style.cursor=''}}>
      <boxGeometry args={[1.12,0.55,0.047]}/>
      <meshBasicMaterial color={selected ? '#206476' : '#103644'} transparent opacity={0.97}/>
    </mesh>
    <mesh position={[0,-0.28,0.035]}><boxGeometry args={[1.08,0.021,0.015]}/><meshBasicMaterial color={color}/></mesh>
    <Txt position={[-0.48,0.1,0.049]} size={0.14} width={0.92} color={selected?'#ffffff':'#d1edf1'} bold>{node.order} / {node.label}</Txt>
  </group>;
}

export function SystemsHologram({ selectedNode, onSelectNode, active }) {
  const detail = SYSTEM_NODES.find(n=>n.id===selectedNode) || SYSTEM_NODES[0];
  return <group position={[-9,2.15,-9.02]}>
    <Float floatIntensity={0.08} rotationIntensity={0} speed={0.8}>
      <HoloFrame accent="#64e3f8" width={5.9} height={3.0}/>
      <Txt position={[-2.7,1.14,0.1]} size={0.25} width={5.1} bold color="#9ef5ff">THE BUILDER  /  SYSTEMS ARCHITECTURE</Txt>
      <Txt position={[-2.7,0.77,0.09]} size={0.145} width={5.0} color="#d0e9f1">Select a system layer to inspect its responsibility</Txt>
      {SYSTEM_NODES.map((node,idx)=><NodeButton key={node.id} node={node} position={[-2.05 + idx*1.36,0.27,0.11]} selected={selectedNode===node.id} onSelect={id => active && onSelectNode(id)}/>)}
      <Txt position={[-2.7,-0.28,0.09]} size={0.22} bold width={5.1} color="#90eff8">{detail.label.toUpperCase()}</Txt>
      <Txt position={[-2.7,-0.66,0.09]} size={0.166} width={5.17}>{detail.responsibility}</Txt>
      <Txt position={[-2.7,-1.1,0.09]} size={0.145} width={5.0} color="#81cddc">TOOLS / {detail.technologies.join('  •  ')}</Txt>
    </Float>
  </group>;
}

export function DataHologram() {
  return <group position={[0,2.1,-16.0]}>
    <Float floatIntensity={0.11} rotationIntensity={0} speed={0.7}>
      <HoloFrame accent="#ab9cf5" width={5.7} height={3.0}/>
      <Txt position={[-2.55,1.14,0.08]} size={0.25} width={5} bold color="#d0bdff">THE ANALYST  /  DATA & ANALYTICS</Txt>
      <Txt position={[-2.55,0.78,0.08]} size={0.16} width={4.9}>SQL  /  Power BI  /  reporting  /  decision support</Txt>
      {[0.53,0.75,0.37,0.82,0.64,0.9,0.55,0.77].map((h,i)=><mesh key={i} position={[-2.2+i*0.63,-0.53+h/2,0.12]}>
        <boxGeometry args={[0.38,h*1.7,0.075]}/><meshBasicMaterial color={i%2?'#8873ce':'#6cd9d8'} transparent opacity={0.72}/>
      </mesh>)}
      <Txt position={[-2.55,-1.14,0.08]} size={0.14} width={5.0} color="#bdb1e7">Visualization concept • interactive filters planned for Sprint 3</Txt>
    </Float>
  </group>;
}

export function ProjectsHologram() {
  return <group position={[9,2.05,-9.0]}>
    <Float floatIntensity={0.09} rotationIntensity={0} speed={0.74}>
      <HoloFrame accent="#f0b579" width={5.7} height={3.15}/>
      <Txt position={[-2.55,1.2,0.08]} size={0.25} width={5.0} bold color="#ffce92">THE OPERATOR  /  PROJECTS</Txt>
      <Txt position={[-2.55,0.82,0.08]} size={0.15} width={5.0} color="#e4c8aa">Delivering software and improving real operations</Txt>
      <mesh position={[-1.33,0.11,0.08]}><planeGeometry args={[2.42,0.95]}/><meshBasicMaterial color="#4d2c23" transparent opacity={0.85}/></mesh>
      <mesh position={[1.33,0.11,0.08]}><planeGeometry args={[2.42,0.95]}/><meshBasicMaterial color="#453327" transparent opacity={0.85}/></mesh>
      <Txt position={[-2.42,0.34,0.14]} size={0.21} color="#ffd29e" bold width={2.0}>ALFALFA</Txt>
      <Txt position={[-2.42,-0.02,0.14]} size={0.15} width={2.02}>Operations / POS\nPurchasing / workflows</Txt>
      <Txt position={[0.25,0.34,0.14]} size={0.21} color="#ffd29e" bold width={2.0}>ECOVISION</Txt>
      <Txt position={[0.25,-0.02,0.14]} size={0.15} width={2.02}>Software project\nCase study pending</Txt>
      <Txt position={[-2.55,-1.13,0.08]} size={0.14} width={5.0} color="#d4b99d">Verified cases and detailed workflows planned for Sprint 3</Txt>
    </Float>
  </group>;
}
