import { useCallback, useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';
import Scene from './components/Scene.jsx';
import { STATIONS, SYSTEM_NODES } from './content/stations.js';
import { useReducedMotion } from './hooks/useReducedMotion.js';

const directions=[
  {name:'Move forward',symbol:'↑',x:0,z:-1},
  {name:'Move left',symbol:'←',x:-1,z:0},
  {name:'Move backward',symbol:'↓',x:0,z:1},
  {name:'Move right',symbol:'→',x:1,z:0}
];

function LoadStatus(){
  const { active, progress }=useProgress();
  return active?<div className="asset-loading" role="status"><span>INITIALIZING 3D ASSETS</span><b>{Math.round(progress)}%</b><div className="asset-loading__bar"><i style={{width:`${progress}%`}}/></div></div>:null;
}

export default function App(){
  const [roomId,setRoomId]=useState(null);
  const [selectedNode,setSelectedNode]=useState(SYSTEM_NODES[0].id);
  const [playerPosition,setPlayerPosition]=useState({x:-2.4,z:8.5});
  const [zoomDistance,setZoomDistance]=useState(5.4);
  const [help,setHelp]=useState(true);
  const [touchDirection,setTouchDirection]=useState({x:0,z:0});
  const reducedMotion=useReducedMotion();
  const room=STATIONS.find(s=>s.id===roomId)||null;
  const onRoomChange=useCallback(id=>{setRoomId(id);if(id==='systems')setSelectedNode(SYSTEM_NODES[0].id)},[]);
  const onZoomBy=useCallback(delta=>setZoomDistance(v=>Math.min(9.5,Math.max(2.1,v+delta))),[]);
  const onPositionChange=useCallback(pos=>setPlayerPosition(pos),[]);
  useEffect(()=>{
    const onKey=e=>{
      if(e.repeat||e.altKey||e.ctrlKey||e.metaKey||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
      const k=e.key.toLowerCase();
      if(k==='h')setHelp(v=>!v);
      if(k==='+'||k==='=')onZoomBy(-0.45);
      if(k==='-'||k==='_')onZoomBy(0.45);
      if(k==='e'&&roomId==='systems')setSelectedNode(v=>SYSTEM_NODES[(SYSTEM_NODES.findIndex(n=>n.id===v)+1)%SYSTEM_NODES.length].id);
      if(k==='escape')setHelp(false);
    };
    window.addEventListener('keydown',onKey);
    return ()=>window.removeEventListener('keydown',onKey);
  },[roomId,onZoomBy]);
  useEffect(()=>()=>{document.body.style.cursor=''},[]);
  return <div className="nexus-app">
    <a className="skip-link" href="#nexus-world">Skip to 3D world</a>
    <main className="nexus-world" id="nexus-world" aria-label="NEXUS interactive three dimensional operations complex">
      <Scene roomId={roomId} onRoomChange={onRoomChange} onPositionChange={onPositionChange}
        selectedNode={selectedNode} onSelectNode={setSelectedNode}
        reducedMotion={reducedMotion} touchDirection={touchDirection} zoomDistance={zoomDistance} onZoomBy={onZoomBy}/>
      <LoadStatus/>
      <header className="nexus-hud-header">
        <div className="nexus-logotype">NEXUS<span>.</span><small>SPATIAL PORTFOLIO / HASSEN ORTIZ</small></div>
        <div className="nexus-header-actions">
          <div className="zoom-controls" aria-label="Third-person camera zoom">
            <button type="button" onClick={()=>onZoomBy(0.65)} aria-label="Zoom out from avatar">−</button>
            <span>ZOOM</span>
            <button type="button" onClick={()=>onZoomBy(-0.65)} aria-label="Zoom in toward avatar">+</button>
          </div>
          <button type="button" onClick={()=>setHelp(v=>!v)} aria-expanded={help}>CONTROLS <kbd>H</kbd></button>
        </div>
      </header>
      <div className="location-hud" aria-live="polite">
        <span className="location-hud__eyebrow">{room?'LABORATORY / THIRD PERSON':'SECTOR 00 / THIRD PERSON'}</span>
        <h1>{room?room.persona:'THE NEXUS CORE'}</h1>
        <p>{room?room.name:'Explore the facility and enter one of the three laboratories.'}</p>
      </div>
      {help&&<aside className="control-hud" aria-label="Navigation controls">
        <strong>HOW TO EXPLORE</strong>
        <p><kbd>W</kbd> camera forward • <kbd>S</kbd> camera backward • <kbd>A</kbd>/<kbd>D</kbd> strafe / move camera-relative</p>
        <p><kbd>SHIFT</kbd> — run</p>
        <p>DRAG IN THE WORLD — orbit the camera behind your avatar</p>
        <p>MOUSE WHEEL or <kbd>+</kbd> <kbd>−</kbd> — zoom avatar</p>
        <p><kbd>R</kbd> — recenter camera behind avatar</p>
        <p>WALK THROUGH A DOOR — remain in third person</p>
        {roomId==='systems'&&<p><kbd>E</kbd> or click a hologram node — inspect the system layer</p>}
        {room&&<p>EXIT THROUGH THE DOOR — return to third person</p>}
        <p className="control-hud__note">Animation: authored Walking and Running clips. Idle is a generated static rest pose (no authored Idle clip supplied).</p>
      </aside>}
      <div className="wayfinder" aria-label="Available station areas">
        {STATIONS.map(s=><div className={'wayfinder__item'+(roomId===s.id?' wayfinder__item--active':'')} key={s.id}>
          <i style={{background:s.accent}}/><span>{s.number} / {s.shortName}</span>
        </div>)}
      </div>
      {roomId==='systems'&&<div className="interaction-hint" aria-live="polite">HOLOGRAM NODE {SYSTEM_NODES.findIndex(n=>n.id===selectedNode)+1} / 4 <kbd>E</kbd> NEXT</div>}
      {room&&room.id!=='systems'&&<div className="interaction-hint">HOLOGRAM PREVIEW · FULL INTERACTION IN SPRINT 3</div>}
      <nav className="touch-controls" aria-label="Touch movement controls">
        {directions.map((d,i)=><button key={d.name} type="button" className={`touch-controls__key touch-controls__key--${i}`} aria-label={d.name}
          onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);setTouchDirection({x:d.x,z:d.z})}}
          onPointerUp={()=>setTouchDirection({x:0,z:0})}
          onPointerCancel={()=>setTouchDirection({x:0,z:0})}
          onLostPointerCapture={()=>setTouchDirection({x:0,z:0})}>{d.symbol}</button>)}
        {roomId==='systems'&&<button type="button" className="touch-controls__interact" onClick={()=>setSelectedNode(v=>SYSTEM_NODES[(SYSTEM_NODES.findIndex(n=>n.id===v)+1)%SYSTEM_NODES.length].id)}>INTERACT</button>}
      </nav>
      <footer className="nexus-hud-footer"><span>3D EXPLORER / SPRINTS 01 + 02</span><span>X {playerPosition.x.toFixed(1)}  /  Z {playerPosition.z.toFixed(1)}</span><span>PROTOTYPE v0.8.2</span></footer>
    </main>
  </div>;
}
