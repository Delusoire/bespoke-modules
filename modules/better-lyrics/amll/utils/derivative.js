export function derivative(f) {
    const h = 0.001;
    return (x)=>(f(x + h) - f(x - h)) / (2 * h);
}
export function getVelocity(f) {
    return derivative(f);
}
