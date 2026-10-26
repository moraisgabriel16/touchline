import {useEffect,useState} from 'react';
export function usePreferences(){
  const [preferences,setPreferences]=useState(()=>{try{const p=JSON.parse(localStorage.getItem('touchline.preferences.v1')??'{}');return {motion:p.motion===true,contrast:p.contrast===true};}catch{return {motion:false,contrast:false};}});
  useEffect(()=>{try{localStorage.setItem('touchline.preferences.v1',JSON.stringify(preferences));}catch{/* Preferences are optional when browser storage is blocked. */}},[preferences]);
  return [preferences,setPreferences] as const;
}
