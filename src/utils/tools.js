export const debounce = (fn,wait) => {
    let t = null;
    return function(){
        clearTimeout(t)
        t=setTimeout(()=>{
            fn.apply(this,arguments)
        },wait)
    }
}