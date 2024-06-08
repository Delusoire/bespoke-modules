// biome-ignore format: matrix
export function createMatrix4() {
    // biome-ignore format: matrix
    return [
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1
    ];
}
export function scaleMatrix4(m, scale = 1, origin = {
    x: 0,
    y: 0
}) {
    const [ox, oy] = [
        origin.x,
        origin.y
    ];
    // biome-ignore format: matrix
    return [
        m[0] * scale,
        m[1] * scale,
        m[2] * scale,
        m[3],
        m[4] * scale,
        m[5] * scale,
        m[6] * scale,
        m[7],
        m[8] * scale,
        m[9] * scale,
        m[10] * scale,
        m[11],
        m[12] - ox * scale + ox,
        m[13] - oy * scale + oy,
        m[14],
        m[15]
    ];
}
export function translateMatrix4(m, x = 0, y = 0, z = 0) {
    // biome-ignore format: matrix
    return [
        m[0],
        m[1],
        m[2],
        m[3],
        m[4],
        m[5],
        m[6],
        m[7],
        m[8],
        m[9],
        m[10],
        m[11],
        m[12] + x,
        m[13] + y,
        m[14] + z,
        m[15]
    ];
}
export function matrix4ToCSS(m, fractionDigits = 4) {
    const format = (n, i)=>n.toFixed(fractionDigits);
    return `matrix3d(${m.map(format).join(", ")})`;
}
