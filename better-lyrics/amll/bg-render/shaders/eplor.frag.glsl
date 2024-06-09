#version 300 es
precision highp float;

uniform float hasLyricValue, tickTimeSeconds, lowFreqVolume, isVeryWide;
uniform sampler2D samplerString;
uniform vec2 resolution, offset;
out vec4 out_vec4;

float weirdSin(float x) {
   x -= 0.;
   return sin(x);
}

float weirdSinPhaseShift(float x) {
   x += acos(0.);
   return sin(x);
}

float noise(float x) {
   return fract(weirdSin(x) * 43758.5453);
}

float smoothNoise(vec2 v) {
   vec2 intPart = floor(v);
   vec2 fracPart = fract(v);
   fracPart = fracPart * fracPart * (3. - 2. * fracPart);
   float base = intPart.x + intPart.y * 57.;
   float x = mix(noise(base), noise(base + 1.), fracPart.x);
   float y = mix(noise(base + 57.), noise(base + 58.), fracPart.x);
   return mix(x, y, fracPart.y);
}

vec2 transformVec(vec2 u) {
   float alpha = smoothNoise(u * vec2(1) * 3.5 + .1) * 4.2831 * mix(.2, 1., hasLyricValue);
   u += vec2(-1, .5);
   return vec2(weirdSinPhaseShift(alpha), weirdSin(alpha));
}

void rotate(inout vec2 u, float angle) {
   u = cos(angle) * u + sin(angle) * vec2(u.y, -u.x);
}

float lengthTransform(vec2 u, float scale) {
   return (length(u / scale) - 1.) * scale;
}

void applyDistortion(inout float distortion, vec2 u) {
   u *= 1000.;
   if (mod(floor(u.y / 1000. + .5), 2.) == 0.)
      u.x += 5000.;
   vec2 v = mod(u + 5500., 1000.) - 500.;
   vec2 cell = floor(u / 1000. + .5);
   float noiseVal = fract(sin(dot(cell.xy, vec2(12.9898, 78.233))) * 43758.5453);
   v.x *= mix(.9, .6, fract(noiseVal * 11.13 + 11.13)) * 1.2;
   v.y *= mix(.9, .6, fract(noiseVal * 17.17 + 17.17)) * .8;
   float dist = lengthTransform(v, mix(30., 70., fract(noiseVal * 7.77 + 7.77)));
   distortion += 1. - smoothstep(0., 1., dist * .005);
}

vec3 sampleAndBlendTextures(sampler2D sampler, vec2 uv) {
   uv *= mix(vec2(.6, 1), vec2(1), isVeryWide);
   vec3 baseColor = texture(sampler, uv * 1.2 * mix(vec2(.6), vec2(1), isVeryWide) + tickTimeSeconds * .02).xyz;
   float timeShift = tickTimeSeconds * .06;
   vec3 shifterColor1 = texture(sampler, uv * 1.2 + timeShift).xyz;
   vec3 shifterColor2 = texture(sampler, -uv + timeShift).xyz;
   float smallShift = tickTimeSeconds * .001;
   float distortion1 = 0., distortion2 = 0.;
   rotate(uv, .2 - smallShift * 3.);
   applyDistortion(distortion1, uv + vec2(-50. * smallShift, 0));
   rotate(uv, .3 - smallShift * 50.);
   applyDistortion(distortion2, uv + vec2(-70. * smallShift + 33., -33));
   rotate(uv, 2. - smallShift * 50.);
   applyDistortion(distortion2, uv + vec2(-10. * smallShift + 11., -11));
   return mix(mix(baseColor, shifterColor1, distortion1), shifterColor2, distortion2);
}

void main() {
   vec2 fragCoord = gl_FragCoord.xy / resolution.xy;
   vec2 adjustedCoord = weirdSin(tickTimeSeconds * .2) * .01 + .5 + fragCoord;
   vec2 uv = adjustedCoord * .77 + offset + vec2(-.05, 0);
   vec2 centerOffset, transformedUV;

   uv.x *= resolution.x / resolution.y * mix(.8, 1., isVeryWide);
   centerOffset = (uv - adjustedCoord) / 2. + vec2(.2, .35);

   float totalDistortion = 0.;
   vec3 colorSum = vec3(0);
   transformedUV = uv;
   for (int i = 0; i < 32; i++) {
      vec2 transformed = transformVec(uv);
      float factor = float(i) / 32.;
      float sampledCoordX = centerOffset.x + (uv.x - centerOffset.x) * weirdSinPhaseShift(-tickTimeSeconds * .2) - (uv.y - centerOffset.y) * weirdSin(-tickTimeSeconds * .2);
      float sampledCoordY = centerOffset.y + (uv.x - centerOffset.x) * weirdSin(-tickTimeSeconds * .2) + (uv.y - centerOffset.y) * weirdSinPhaseShift(-tickTimeSeconds * .2);
      vec2 sampledCoord = vec2(sampledCoordX, sampledCoordY);
      colorSum += sampleAndBlendTextures(samplerString, .5 + centerOffset + (sampledCoord - centerOffset) / (vec2(mix(2., 1., hasLyricValue)) + (lowFreqVolume * 2. + .2) * (1. - pow(fragCoord.x * (1. - fragCoord.y) * fragCoord.y * (1. - fragCoord.x) * 15., 1.5) * .9))).xyz;
      totalDistortion += 4. * factor * (1. - factor);
      uv += .0024 * transformed * mix(5., weirdSin(tickTimeSeconds) * 2.5 + 2.5, isVeryWide);
      transformedUV += .05 * transformed;
   }
   colorSum /= totalDistortion;
   colorSum *= 1.3;
   colorSum = 1. - exp(-colorSum);
   colorSum = pow(colorSum, vec3(3));
   colorSum *= 1.25;
   out_vec4 = vec4(colorSum, 1);
}
