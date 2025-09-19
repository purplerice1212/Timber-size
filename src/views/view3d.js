import {typeColors} from '../utils/colors.js';
import {getState, setCamera} from '../state.js';
import {clamp} from '../utils/math.js';

const defaultCamera = {yaw:0.5, pitch:0.3, zoom:1};
const camState = {...defaultCamera};
let canvasRef, modelRef, overlayRef;

function shadeColor(hex, factor){
  const r=parseInt(hex.slice(1,3),16);
  const g=parseInt(hex.slice(3,5),16);
  const b=parseInt(hex.slice(5,7),16);
  const f=Math.max(0, Math.min(1,factor));
  return `rgb(${Math.round(r*f)},${Math.round(g*f)},${Math.round(b*f)})`;
}

function makeBoxFaces(x,y,z,w,h,d){
  const v=[[x,y,z],[x+w,y,z],[x+w,y+h,z],[x,y+h,z],[x,y,z+d],[x+w,y,z+d],[x+w,y+h,z+d],[x,y+h,z+d]];
  const q=[[0,1,2,3],[4,5,6,7],[0,4,7,3],[1,5,6,2],[0,1,5,4],[3,2,6,7]];
  return q.map(idx=>idx.map(i=>v[i]));
}

export function render3d(canvas, model, overlays=false){
  canvasRef=canvas; modelRef=model; overlayRef=overlays;
  const s=getState();
  camState.yaw=s.yaw; camState.pitch=s.pitch; camState.zoom=s.zoom;
  const ctx=canvas.getContext('2d');
  canvas.width=canvas.clientWidth; canvas.height=canvas.clientHeight;
  ctx.clearRect(0,0,canvas.width,canvas.height);

  const {min,max}=model.bounds;
  const cx=(min[0]+max[0])/2;
  const cy=(min[1]+max[1])/2;
  const cz=(min[2]+max[2])/2;
  const radius=Math.sqrt((max[0]-min[0])**2+(max[1]-min[1])**2+(max[2]-min[2])**2)/2;

  const viewport=Math.min(canvas.width, canvas.height);
  const f=700;
  const target=Math.max(1, viewport*0.45);
  const camDist=Math.max(radius+1, radius*(1+f/target))*camState.zoom;
  const rotY=(p,a)=>[p[0]*Math.cos(a)+p[2]*Math.sin(a), p[1], -p[0]*Math.sin(a)+p[2]*Math.cos(a)];
  const rotX=(p,a)=>[p[0], p[1]*Math.cos(a)-p[2]*Math.sin(a), p[1]*Math.sin(a)+p[2]*Math.cos(a)];

  const faces=[];
  model.boxes.forEach(b=>{
    const base=typeColors[b.type]||'#ddd';
    makeBoxFaces(b.x,b.y,b.z,b.w,b.h,b.d).forEach(facePts=>{
      const tp=facePts.map(pt=>{
        const p0=[pt[0]-cx, pt[1]-cy, pt[2]-cz];
        const p1=rotY(p0,camState.yaw);
        const p2=rotX(p1,camState.pitch);
        const z=camDist-p2[2];
        const s=f/z;
        return {x:canvas.width/2+p2[0]*s,y:canvas.height/2-p2[1]*s,z,p:p2};
      });
      const u=[tp[1].p[0]-tp[0].p[0], tp[1].p[1]-tp[0].p[1], tp[1].p[2]-tp[0].p[2]];
      const v=[tp[2].p[0]-tp[1].p[0], tp[2].p[1]-tp[1].p[1], tp[2].p[2]-tp[1].p[2]];
      const normal=[u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0]];
      const nlen=Math.hypot(normal[0],normal[1],normal[2])||1;
      const light=Math.max(0, normal[2]/nlen);
      const shade=0.3+0.7*light;
      const color=shadeColor(base, shade);
      const avgZ=tp.reduce((a,b)=>a+b.z,0)/tp.length;
      faces.push({pts:tp.map(p=>[p.x,p.y]), avgZ, color, edge:base});
    });
  });

  faces.sort((a,b)=>b.avgZ-a.avgZ);
  ctx.lineWidth=1;
  faces.forEach(f=>{
    ctx.beginPath();
    f.pts.forEach((p,i)=> i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));
    ctx.closePath();
    ctx.fillStyle=f.color; ctx.strokeStyle=f.edge;
    ctx.fill(); ctx.stroke();
  });

  if(overlays){
    const width=max[0]-min[0];
    const height=max[1]-min[1];
    const depth=max[2]-min[2];
    ctx.fillStyle='#0f0';
    ctx.font='12px sans-serif';
    ctx.fillText(`W:${Math.round(width)} H:${Math.round(height)} D:${Math.round(depth)}`,10,20);
  }
}

export function reset3dCamera({notify=true}={}){
  Object.assign(camState, defaultCamera);
  setCamera({...camState}, notify);
  if(!notify && canvasRef){
    render3d(canvasRef, modelRef, overlayRef);
  }
}
export function init3dControls(canvas){
  canvas.addEventListener('dblclick',()=>{
    reset3dCamera({notify:false});
  });
  canvas.addEventListener('wheel',e=>{
    camState.zoom=clamp(camState.zoom+(e.deltaY>0?0.1:-0.1),0.5,3);
    setCamera(camState,false);
    render3d(canvasRef, modelRef, overlayRef);
  },{passive:true});
  const pointers=new Map();
  let pinchDist=0,pinchZoom=1;
  const pos=e=>({x:e.clientX,y:e.clientY});
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const end=e=>{
    if(canvas.hasPointerCapture && canvas.hasPointerCapture(e.pointerId)){
      canvas.releasePointerCapture(e.pointerId);
    }
    pointers.delete(e.pointerId);
    if(pointers.size<2) pinchDist=0;
  };
  ['pointerup','pointerleave','pointercancel'].forEach(type=>{
    canvas.addEventListener(type,end);
  });
  canvas.addEventListener('pointerdown',e=>{
    pointers.set(e.pointerId,pos(e));
    if(pointers.size===2){
      const [p1,p2]=Array.from(pointers.values());
      pinchDist=dist(p1,p2); pinchZoom=camState.zoom;
    }
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove',e=>{
    if(!pointers.has(e.pointerId)) return;
    const prev=pointers.get(e.pointerId), curr=pos(e);
    pointers.set(e.pointerId,curr);
    if(pointers.size===1){
      const dx=curr.x-prev.x, dy=curr.y-prev.y;
      camState.yaw+=dx*0.01;
      camState.pitch=clamp(camState.pitch+dy*0.01,-1.1,1.1);
      setCamera(camState,false);
      render3d(canvasRef, modelRef, overlayRef);
    }else if(pointers.size===2){
      const [p1,p2]=Array.from(pointers.values());
      const d=dist(p1,p2);
      camState.zoom=clamp(pinchZoom*(d/pinchDist),0.5,3);
      setCamera(camState,false);
      render3d(canvasRef, modelRef, overlayRef);
    }
  });
}
