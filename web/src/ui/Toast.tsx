import {useEffect,useRef,useState} from 'react';
export function Toast({message}:{message:string}){
  const first=useRef(true),[visible,setVisible]=useState(false);
  useEffect(()=>{if(first.current){first.current=false;return;}setVisible(true);const timer=setTimeout(()=>setVisible(false),4200);return ()=>clearTimeout(timer);},[message]);
  if(!visible)return null;
  return <div className="game-toast"><span>{message}</span><button aria-label="Dispensar aviso" onClick={()=>setVisible(false)}>×</button></div>;
}
