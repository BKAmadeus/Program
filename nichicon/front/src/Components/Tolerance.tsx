


export const Tolerance = (T:any) => (    
        <p style={{fontSize:40}} className="yoko">{T.value}
            {(T.max + T.min) === 0?
            <>±{T.max}</>
            :<span style={{fontSize:24,lineHeight:1,fontFamily:"BIZ UDGothic"}}>{T.max>0?"+":""}{String(T.max)}<br/>{T.min>0?"+":""}{String(T.min)}</span>
            }
        </p>
    )