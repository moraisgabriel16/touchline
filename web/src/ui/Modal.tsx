import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

export function Modal({title,eyebrow='TOUCHLINE',children,onClose}:{title:string;eyebrow?:string;children:ReactNode;onClose:()=>void}) {
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{const element=ref.current!;if (!element.open) element.showModal();return ()=>element.close();},[]);
  return <dialog ref={ref} className="modal" aria-labelledby="modal-title" onCancel={event=>{event.preventDefault();onClose();}}>
    <button className="modal-close" aria-label="Fechar janela" onClick={onClose}>×</button>
    <span className="eyebrow">{eyebrow}</span><h2 id="modal-title">{title}</h2>
    {children}
  </dialog>;
}
