import { BaseRenderer } from "./base.js";
const vertShader = await fetch("/modules/Delusoire/better-lyrics/amll/bg-render/shaders/base.vert.glsl").then((res)=>res.text());
const fragShader = await fetch("/modules/Delusoire/better-lyrics/amll/bg-render/shaders/base.frag.glsl").then((res)=>res.text());
const blendShader = await fetch("/modules/Delusoire/better-lyrics/amll/bg-render/shaders/blend.frag.glsl").then((res)=>res.text());
const eplorShader = await fetch("/modules/Delusoire/better-lyrics/amll/bg-render/shaders/eplor.frag.glsl").then((res)=>res.text());
const noiseShader = await fetch("/modules/Delusoire/better-lyrics/amll/bg-render/shaders/noise.frag.glsl").then((res)=>res.text());
import { loadResourceFromElement, loadResourceFromUrl } from "../utils/resource.js";
const NOISE_IMAGE_DATA = (()=>{
    const img = document.createElement("img");
    img.src = "/modules/Delusoire/better-lyrics/amll/assets/noise5.png";
    return img;
})();
function blurImage(imageData, radius, quality) {
    const pixels = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    let rsum;
    let gsum;
    let bsum;
    let asum;
    let x;
    let y;
    let i;
    let p;
    let p1;
    let p2;
    let yp;
    let yi;
    let yw;
    const wm = width - 1;
    const hm = height - 1;
    const rad1x = radius + 1;
    const divx = radius + rad1x;
    const rad1y = radius + 1;
    const divy = radius + rad1y;
    const div2 = 1 / (divx * divy);
    const r = [];
    const g = [];
    const b = [];
    const a = [];
    const vmin = [];
    const vmax = [];
    while(quality-- > 0){
        yw = yi = 0;
        for(y = 0; y < height; y++){
            rsum = pixels[yw] * rad1x;
            gsum = pixels[yw + 1] * rad1x;
            bsum = pixels[yw + 2] * rad1x;
            asum = pixels[yw + 3] * rad1x;
            for(i = 1; i <= radius; i++){
                p = yw + ((i > wm ? wm : i) << 2);
                rsum += pixels[p++];
                gsum += pixels[p++];
                bsum += pixels[p++];
                asum += pixels[p];
            }
            for(x = 0; x < width; x++){
                r[yi] = rsum;
                g[yi] = gsum;
                b[yi] = bsum;
                a[yi] = asum;
                if (y === 0) {
                    vmin[x] = Math.min(x + rad1x, wm) << 2;
                    vmax[x] = Math.max(x - radius, 0) << 2;
                }
                p1 = yw + vmin[x];
                p2 = yw + vmax[x];
                rsum += pixels[p1++] - pixels[p2++];
                gsum += pixels[p1++] - pixels[p2++];
                bsum += pixels[p1++] - pixels[p2++];
                asum += pixels[p1] - pixels[p2];
                yi++;
            }
            yw += width << 2;
        }
        for(x = 0; x < width; x++){
            yp = x;
            rsum = r[yp] * rad1y;
            gsum = g[yp] * rad1y;
            bsum = b[yp] * rad1y;
            asum = a[yp] * rad1y;
            for(i = 1; i <= radius; i++){
                yp += i > hm ? 0 : width;
                rsum += r[yp];
                gsum += g[yp];
                bsum += b[yp];
                asum += a[yp];
            }
            yi = x << 2;
            for(y = 0; y < height; y++){
                pixels[yi] = rsum * div2 + 0.5 | 0;
                pixels[yi + 1] = gsum * div2 + 0.5 | 0;
                pixels[yi + 2] = bsum * div2 + 0.5 | 0;
                pixels[yi + 3] = asum * div2 + 0.5 | 0;
                if (x === 0) {
                    vmin[y] = Math.min(y + rad1y, hm) * width;
                    vmax[y] = Math.max(y - radius, 0) * width;
                }
                p1 = x + vmin[y];
                p2 = x + vmax[y];
                rsum += r[p1] - r[p2];
                gsum += g[p1] - g[p2];
                bsum += b[p1] - b[p2];
                asum += a[p1] - a[p2];
                yi += width << 2;
            }
        }
    }
}
function saturateImage(imageData, saturation) {
    const pixels = imageData.data;
    for(let i = 0; i < pixels.length; i += 4){
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];
        const gray = r * 0.3 + g * 0.59 + b * 0.11;
        pixels[i] = gray * (1 - saturation) + r * saturation;
        pixels[i + 1] = gray * (1 - saturation) + g * saturation;
        pixels[i + 2] = gray * (1 - saturation) + b * saturation;
        pixels[i + 3] = a;
    }
}
function brightnessImage(imageData, brightness) {
    const pixels = imageData.data;
    for(let i = 0; i < pixels.length; i += 4){
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];
        pixels[i] = r * brightness;
        pixels[i + 1] = g * brightness;
        pixels[i + 2] = b * brightness;
        pixels[i + 3] = a;
    }
}
function contrastImage(imageData, contrast) {
    const pixels = imageData.data;
    for(let i = 0; i < pixels.length; i += 4){
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];
        pixels[i] = (r - 128) * contrast + 128;
        pixels[i + 1] = (g - 128) * contrast + 128;
        pixels[i + 2] = (b - 128) * contrast + 128;
        pixels[i + 3] = a;
    }
}
class GLProgram {
    label;
    gl;
    program;
    vertexShader;
    fragmentShader;
    coordPos;
    constructor(gl, vertexShaderSource, fragmentShaderSource, label = "unknown"){
        this.label = label;
        this.notFoundUniforms = new Set();
        this.gl = gl;
        this.vertexShader = this.createShader(gl.VERTEX_SHADER, vertexShaderSource);
        this.fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
        this.program = this.createProgram();
        const coordPos = gl.getAttribLocation(this.program, "v_coord");
        if (coordPos === -1) {
            throw new Error(`Failed to get attribute location v_coord for "${this.label}"`);
        }
        this.coordPos = coordPos;
    }
    createShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        if (!shader) throw new Error("Failed to create shader");
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error(`Failed to compile shader for type ${type} "${this.label}": ${gl.getShaderInfoLog(shader)}`);
        }
        return shader;
    }
    createProgram() {
        const gl = this.gl;
        const program = gl.createProgram();
        if (!program) throw new Error("Failed to create program");
        gl.attachShader(program, this.vertexShader);
        gl.attachShader(program, this.fragmentShader);
        gl.linkProgram(program);
        gl.validateProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const errLog = gl.getProgramInfoLog(program);
            gl.deleteProgram(program);
            throw new Error(`Failed to link program "${this.label}": ${errLog}`);
        }
        return program;
    }
    use() {
        const gl = this.gl;
        gl.useProgram(this.program);
        gl.vertexAttribPointer(this.coordPos, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.coordPos);
    }
    notFoundUniforms;
    warnUniformNotFound(name) {
        if (this.notFoundUniforms.has(name)) return;
        this.notFoundUniforms.add(name);
        console.warn(`Failed to get uniform location for program "${this.label}": ${name}`);
    }
    setUniform1f(name, value) {
        const gl = this.gl;
        const location = gl.getUniformLocation(this.program, name);
        if (!location) this.warnUniformNotFound(name);
        else gl.uniform1f(location, value);
    }
    setUniform2f(name, value1, value2) {
        const gl = this.gl;
        const location = gl.getUniformLocation(this.program, name);
        if (!location) this.warnUniformNotFound(name);
        else gl.uniform2f(location, value1, value2);
    }
    setUniform1i(name, value) {
        const gl = this.gl;
        const location = gl.getUniformLocation(this.program, name);
        if (!location) this.warnUniformNotFound(name);
        else gl.uniform1i(location, value);
    }
    dispose() {
        const gl = this.gl;
        gl.deleteShader(this.vertexShader);
        gl.deleteShader(this.fragmentShader);
        gl.deleteProgram(this.program);
    }
}
class Framebuffer {
    gl;
    fb;
    tex;
    _size;
    get size() {
        return this._size;
    }
    constructor(gl, width, height){
        this.gl = gl;
        this._size = [
            width,
            height
        ];
        const fb = gl.createFramebuffer();
        if (!fb) throw new Error("Can't create framebuffer");
        const tex = gl.createTexture();
        if (!tex) throw new Error("Failed to create texture");
        this.fb = fb;
        this.tex = tex;
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        this.resize(width, height);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    }
    resize(width, height) {
        const gl = this.gl;
        this.bind();
        gl.bindTexture(gl.TEXTURE_2D, this.tex);
        if (gl.getExtension("EXT_color_buffer_float")) {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, null);
        } else {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        }
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    }
    bind() {
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb);
    }
    active(texture = this.gl.TEXTURE0) {
        this.gl.activeTexture(texture);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.tex);
    }
    dispose() {
        this.gl.deleteFramebuffer(this.fb);
        this.gl.deleteTexture(this.tex);
    }
}
class GLBuffer {
    gl;
    buffer;
    type;
    data;
    usage;
    length;
    constructor(gl, type, data, usage){
        this.gl = gl;
        this.type = type;
        this.data = data;
        this.usage = usage;
        const buffer = gl.createBuffer();
        if (!buffer) throw new Error("Failed to create buffer");
        this.buffer = buffer;
        this.length = data.byteLength;
        gl.bindBuffer(type, this.buffer);
        gl.bufferData(type, data, usage);
    }
    bind() {
        const gl = this.gl;
        gl.bindBuffer(this.type, this.buffer);
    }
    // update(data: ArrayBufferView) {
    //     const gl = this.gl;
    //     gl.bindBuffer(this.type, this.buffer);
    //     gl.bufferSubData(this.type, 0, data);
    //     this.data = data;
    // }
    dispose() {
        const gl = this.gl;
        gl.deleteBuffer(this.buffer);
    }
}
class AlbumTexture {
    gl;
    mainProgram;
    vertexBuffer;
    indexBuffer;
    albumTexture;
    alpha;
    constructor(gl, mainProgram, vertexBuffer, indexBuffer, albumImageData){
        this.gl = gl;
        this.mainProgram = mainProgram;
        this.vertexBuffer = vertexBuffer;
        this.indexBuffer = indexBuffer;
        this.alpha = 0;
        const albumTexture = gl.createTexture();
        if (!albumTexture) throw new Error("Failed to create texture");
        this.albumTexture = albumTexture;
        gl.bindTexture(gl.TEXTURE_2D, albumTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, albumImageData);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    }
    draw(sampler) {
        const gl = this.gl;
        this.mainProgram.use();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.albumTexture);
        this.mainProgram.setUniform1i(sampler, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    dispose() {
        this.gl.deleteTexture(this.albumTexture);
    }
}
class NoiseTexture {
    gl;
    tex;
    alpha;
    constructor(gl){
        this.gl = gl;
        this.alpha = 0;
        const tex = gl.createTexture();
        if (!tex) throw new Error("Failed to create texture");
        this.tex = tex;
        NOISE_IMAGE_DATA.decode().then(()=>{
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, NOISE_IMAGE_DATA);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        });
    }
    active(texture = this.gl.TEXTURE1) {
        this.gl.activeTexture(texture);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.tex);
    }
    dispose() {
        this.gl.deleteTexture(this.tex);
    }
}
export class EplorRenderer extends BaseRenderer {
    canvas;
    hasLyric;
    hasLyricValue;
    maxFPS;
    lastTickTime;
    lastFrameTime;
    _lowFreqVolume;
    paused;
    staticMode;
    gl;
    reduceImageSizeCanvas;
    tickHandle;
    sprites;
    ampTransition;
    playTime;
    frameTime;
    offset;
    onTick(tickTime) {
        this.tickHandle = 0;
        if (this.paused) return;
        const delta = tickTime - this.lastTickTime;
        const frameDelta = tickTime - this.lastFrameTime;
        this.lastFrameTime = tickTime;
        if (delta < 1000 / this.maxFPS) {
            this.requestTick();
            return;
        }
        this.playTime += frameDelta * this.flowSpeed * 0.1 * (this.hasLyricValue * 0.8 + 0.2);
        this.frameTime += frameDelta;
        if (!(this.onRedraw(this.playTime, frameDelta) && this.staticMode)) {
            this.requestTick();
        }
        this.lastTickTime = tickTime;
        this.ampTransition;
    }
    mainProgram;
    blendProgram;
    copyProgram;
    noiseProgram;
    static rawVertexBuffer = new Float32Array([
        -1,
        -1,
        1,
        -1,
        -1,
        1,
        1,
        1
    ]);
    static rawIndexBuffer = new Uint16Array([
        0,
        1,
        2,
        1,
        2,
        3
    ]);
    vertexBuffer;
    indexBuffer;
    noiseTexture;
    fb;
    historyFrameBuffer;
    constructor(canvas){
        super(canvas);
        this.canvas = canvas;
        this.hasLyric = true;
        this.hasLyricValue = 1;
        this.maxFPS = 30;
        this.lastTickTime = 0;
        this.lastFrameTime = 0;
        this._lowFreqVolume = 1;
        this.paused = false;
        this.staticMode = false;
        this.gl = this.setupGL();
        this.reduceImageSizeCanvas = new OffscreenCanvas(32, 32);
        this.tickHandle = 0;
        this.sprites = [];
        this.ampTransition = 0;
        this.playTime = 0;
        this.frameTime = 0;
        this.offset = [
            -0.1,
            0.0
        ];
        this.mainProgram = new GLProgram(this.gl, vertShader, eplorShader, "main");
        this.blendProgram = new GLProgram(this.gl, vertShader, blendShader, "blend");
        this.copyProgram = new GLProgram(this.gl, vertShader, fragShader, "copy");
        this.noiseProgram = new GLProgram(this.gl, vertShader, noiseShader, "noise");
        this.vertexBuffer = new GLBuffer(this.gl, this.gl.ARRAY_BUFFER, EplorRenderer.rawVertexBuffer, this.gl.STATIC_DRAW);
        this.indexBuffer = new GLBuffer(this.gl, this.gl.ELEMENT_ARRAY_BUFFER, EplorRenderer.rawIndexBuffer, this.gl.STATIC_DRAW);
        this.noiseTexture = new NoiseTexture(this.gl);
        this.historyFrameBuffer = [];
        this._currentSize = [
            0,
            0
        ];
        this._targetSize = [
            0,
            0
        ];
        this.renderSize = [
            0,
            0
        ];
        this.pixelSize = [
            0,
            0
        ];
        const gl = this.gl;
        gl.enable(this.gl.BLEND);
        gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.requestTick();
        const bounds = canvas.getBoundingClientRect();
        const width = bounds.width * window.devicePixelRatio * this.currerntRenderScale;
        const height = bounds.height * window.devicePixelRatio * this.currerntRenderScale;
        this.fb = [
            new Framebuffer(this.gl, width, height),
            new Framebuffer(this.gl, width, height)
        ];
        for (const fb of this.fb){
            fb.bind();
            gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        }
        // this.historyFrameBuffer = new Array(2)
        // 	.fill(0)
        // 	.map(() => new Framebuffer(this.gl, width, height));
        this.onResize(width, height);
    }
    _currentSize;
    _targetSize;
    renderSize;
    pixelSize;
    onResize(width, height) {
        // super.onResize(width, height);
        this._targetSize = [
            Math.max(1, Math.round(width)),
            Math.max(1, Math.round(height))
        ];
        if (this.staticMode) this.requestTick();
    }
    checkResize() {
        if (this._currentSize[0] === this._targetSize[0] && this._currentSize[1] === this._targetSize[1]) {
            return;
        }
        this._currentSize = [
            ...this._targetSize
        ];
        const [width, height] = this._targetSize;
        const realWidth = Math.round(Math.max(width / this.currerntRenderScale, width));
        const realHeight = Math.round(Math.max(height / this.currerntRenderScale, height));
        this.renderSize = [
            width,
            height
        ];
        this.canvas.width = realWidth;
        this.canvas.height = realHeight;
        this.pixelSize = [
            realWidth,
            realHeight
        ];
        this.gl.viewport(0, 0, realWidth, realHeight);
        for (const fb of this.fb){
            fb.resize(width, height);
        }
    // for (const fb of this.historyFrameBuffer) {
    // 	fb.resize(realWidth, realHeight);
    // }
    }
    requestTick() {
        if (!this.tickHandle) {
            this.tickHandle = requestAnimationFrame((t)=>this.onTick(t));
        }
    }
    drawScreen() {
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }
    bindDefaultFrameBuffer() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }
    onRedraw(tickTime, delta) {
        this.checkResize();
        this.hasLyricValue = (this.hasLyricValue * 29 + (this.hasLyric ? 1 : 0)) / 30;
        const gl = this.gl;
        this.vertexBuffer.bind();
        this.indexBuffer.bind();
        this.mainProgram.use();
        // this.noiseTexture.active();
        this.mainProgram.setUniform2f("resolution", this.renderSize[0], this.renderSize[1]);
        this.mainProgram.setUniform1f("tickTimeSeconds", tickTime / 1000);
        this.mainProgram.setUniform1f("hasLyricValue", this.hasLyricValue);
        this.mainProgram.setUniform1f("lowFreqVolume", this.hasLyric ? this._lowFreqVolume : 0.0);
        if (window.innerWidth > 1024) {
            this.offset = [
                -1.3,
                -0.9
            ];
        } else {
            this.offset = [
                -2.4,
                -1.4
            ];
        }
        this.mainProgram.setUniform2f("offset", this.offset[0], this.offset[1]);
        this.mainProgram.setUniform1f("isVeryWide", window.innerWidth > 1024 ? 1 : 0);
        const [fba, fbb] = this.fb;
        fbb.bind();
        gl.clearColor(0, 0, 0, 0);
        gl.clear(this.gl.COLOR_BUFFER_BIT);
        for (const sprite of this.sprites){
            fba.bind();
            gl.clearColor(0, 0, 0, 0);
            gl.clear(this.gl.COLOR_BUFFER_BIT);
            this.mainProgram.use();
            sprite.draw("samplerString");
            fbb.bind();
            this.blendProgram.use();
            fba.active();
            this.blendProgram.setUniform1i("src", 0);
            this.blendProgram.setUniform1f("lerp", sprite.alpha);
            this.blendProgram.setUniform1f("scale", this.currerntRenderScale);
            this.drawScreen();
            sprite.alpha = Math.min(1, sprite.alpha + delta / 300);
        }
        // 增加噪点以缓解色带现象
        this.noiseProgram.use();
        this.noiseProgram.setUniform1i("src", 0);
        // this.noiseProgram.setUniform2f(
        // 	"renderSize",
        // 	this.renderSize[0],
        // 	this.renderSize[1],
        // );
        // this.noiseProgram.setUniform1f("frameTime", this.frameTime);
        fba.bind();
        fbb.active();
        this.bindDefaultFrameBuffer();
        this.drawScreen();
        if (this.sprites.length > 1) {
            const coveredIndex = this.sprites[this.sprites.length - 1];
            if (coveredIndex.alpha >= 1) {
                for (const deleted of this.sprites.splice(0, this.sprites.length - 1)){
                    deleted.dispose();
                }
            }
        }
        const isOnlyOneSprite = this.sprites.length === 1 && this.sprites[0].alpha >= 1;
        const isTweeningValues = this.hasLyric ? this.hasLyricValue > 0.1 : this.hasLyricValue < 0.9;
        return isOnlyOneSprite || !isTweeningValues;
    }
    copyFrameBuffer(src, dst = null) {
        if (src === dst) return;
        src.active(this.gl.TEXTURE0);
        this.copyProgram.use();
        if (dst) {
            dst.bind();
        } else {
            this.bindDefaultFrameBuffer();
        }
        this.copyProgram.setUniform1i("src", 0);
        // this.copyProgram.setUniform1f("scale", scale);
        this.drawScreen();
    }
    setupGL() {
        const gl = this.canvas.getContext("webgl2", {
            alpha: true,
            depth: false,
            powerPreference: "low-power"
        });
        if (!gl) throw new Error("WebGL2 not supported");
        this.gl = gl;
        gl.enable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        if (!gl.getExtension("EXT_color_buffer_float")) {
            console.warn("EXT_color_buffer_float not supported");
        }
        if (!gl.getExtension("EXT_float_blend")) {
            console.warn("EXT_float_blend not supported");
        }
        if (!gl.getExtension("OES_texture_float_linear")) {
            console.warn("OES_texture_float_linear not supported");
        }
        return gl;
    }
    setLowFreqVolume(volume) {
        this._lowFreqVolume = volume;
    }
    setStaticMode(enable) {
        this.staticMode = enable;
        this.lastFrameTime = performance.now();
        this.requestTick();
    }
    setFPS(fps) {
        this.maxFPS = fps;
    }
    pause() {
        if (this.tickHandle) {
            cancelAnimationFrame(this.tickHandle);
            this.tickHandle = 0;
        }
        this.paused = true;
    }
    resume() {
        this.paused = false;
        this.requestTick();
    }
    async setAlbum(albumSource, isVideo = false) {
        if (typeof albumSource === "string" && albumSource.trim().length === 0) {
            throw new Error("Empty album url");
        }
        let res = null;
        let remainRetryTimes = 5;
        console.log("setAlbum", albumSource);
        while(!res && remainRetryTimes > 0){
            try {
                if (typeof albumSource === "string") {
                    res = await loadResourceFromUrl(albumSource, isVideo);
                } else {
                    res = await loadResourceFromElement(albumSource);
                }
            } catch (error) {
                console.warn(`failed on loading album resource, retrying (${remainRetryTimes})`, {
                    albumSource,
                    error
                });
                remainRetryTimes--;
            }
        }
        console.log("loaded album resource", res);
        if (!res) return;
        // resize image
        const c = this.reduceImageSizeCanvas;
        const ctx = c.getContext("2d");
        if (!ctx) throw new Error("Failed to create canvas context");
        ctx.clearRect(0, 0, c.width, c.height);
        // const baseFilter = "saturate(3) contrast(0.8) saturate(8) brightness(0.4)";
        const blurRadius = 2;
        // Safari 不支持 filter
        // ctx.filter = baseFilter;
        const imgw = res instanceof HTMLVideoElement ? res.videoWidth : res.naturalWidth;
        const imgh = res instanceof HTMLVideoElement ? res.videoHeight : res.naturalHeight;
        if (imgw * imgh === 0) throw new Error("Invalid image size");
        ctx.drawImage(res, 0, 0, imgw, imgh, 0, 0, c.width, c.height);
        // ctx.fillStyle = "white";
        // ctx.fillRect(0, 0, c.width, c.height);
        const imageData = ctx.getImageData(0, 0, c.width, c.height);
        contrastImage(imageData, 0.4);
        saturateImage(imageData, 3.0);
        //		contrastImage(imageData, 0.8);
        //		brightnessImage(imageData, 0.9);
        blurImage(imageData, blurRadius, 4);
        const sprite = new AlbumTexture(this.gl, this.mainProgram, this.vertexBuffer, this.indexBuffer, imageData);
        this.sprites.push(sprite);
        // this.playTime = Math.random() * 100000;
        // this.playTime = 0;
        this.lastFrameTime = performance.now();
    // const r = Number.parseInt((Math.random() * 10000).toFixed(0)) % 3;
    // if (r === 0) {
    // 	this.weirdNumberPair = [-1.3, -0.9];
    // 	// this.weirdNumberPair = [-1.1, -.9];
    // } else if (r === 1) {
    // 	// this.weirdNumberPair = [-1.3, -0.9];
    // 	this.weirdNumberPair = [-1.1, -0.9];
    // 	// this.weirdNumberPair = [-0.25, -0.2];
    // } else {
    // 	this.weirdNumberPair = [-1.3, -0.9];
    // }
    // this.requestTick();
    }
    setHasLyric(hasLyric) {
        this.hasLyric = hasLyric;
        this.requestTick();
    }
    getElement() {
        return this.canvas;
    }
    dispose() {
        super.dispose();
        this.vertexBuffer.dispose();
        this.indexBuffer.dispose();
        // this.noiseTexture.dispose();
        for (const s of this.sprites){
            s.dispose();
        }
        // this.copyProgram.dispose();
        this.blendProgram.dispose();
        this.mainProgram.dispose();
        this.noiseProgram.dispose();
        for (const fb of this.fb){
            fb.dispose();
        }
        // for (const fb of this.historyFrameBuffer) {
        // 	fb.dispose();
        // }
        if (this.tickHandle) {
            cancelAnimationFrame(this.tickHandle);
            this.tickHandle = 0;
        }
    }
}
