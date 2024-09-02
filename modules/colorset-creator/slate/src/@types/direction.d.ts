declare module 'https://esm.sh/direction' {
  function direction(text: string): 'neutral' | 'ltr' | 'rtl'
  export default direction
}
