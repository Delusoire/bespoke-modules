#version 300 es
precision highp float;

#define MAGIC_NUMBER 43758.5453

uniform float hasLyricValue, tickTimeSeconds, lowFreqVolume, isVeryWide;
uniform sampler2D samplerString;
uniform vec2 resolution, offset;
out vec4 outColor;

float noise1(float x) {
   return fract(sin(x) * MAGIC_NUMBER);
}

float noise2(vec2 v) {
   vec2 intPart = floor(v);
   vec2 fracPart = fract(v);
   fracPart = fracPart * fracPart * (3. - 2. * fracPart);
   float base = intPart.x + intPart.y * 57.;
   float x = mix(noise1(base), noise1(base + 1.), fracPart.x);
   float y = mix(noise1(base + 57.), noise1(base + 58.), fracPart.x);
   return mix(x, y, fracPart.y);
}

vec2 grain(vec2 u) {
   float alpha = noise2(u * vec2(1) * 3.5 + .1) * 4.2831 * mix(.2, 1., hasLyricValue);
   u += vec2(-1, .5);
   return vec2(cos(alpha), sin(alpha));
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

   vec2 cell = floor(u / 1000. + .5);
   float noiseVal = noise1(dot(cell.xy, vec2(12.9898, 78.233)));

   vec2 v = mod(u + 5500., 1000.) - 500.;
   v.x *= mix(.9, .6, fract(noiseVal * 11.13 + 11.13)) * 1.2;
   v.y *= mix(.9, .6, fract(noiseVal * 17.17 + 17.17)) * .8;

   float dist = lengthTransform(v, mix(30., 70., fract(noiseVal * 7.77 + 7.77)));
   distortion += 1. - smoothstep(0., 1., dist * .005);
}

vec3 sampleAndBlendTextures(sampler2D sampler, vec2 uv) {
   uv *= mix(vec2(.6, 1), vec2(1), isVeryWide);
   vec3 baseColor = texture(sampler, uv * 1.2 * mix(vec2(.6), vec2(1), isVeryWide) + tickTimeSeconds * .02).xyz;

   float tickTimeMh = tickTimeSeconds * .06;
   vec3 shifterColor1 = texture(sampler, uv * 1.2 + tickTimeMh).xyz;
   vec3 shifterColor2 = texture(sampler, -uv + tickTimeMh).xyz;

   float tickTimeMs = tickTimeSeconds * .001;
   float distortion1 = 0., distortion2 = 0.;

   rotate(uv, .2 - tickTimeMs * 3.);
   applyDistortion(distortion1, uv + vec2(-50. * tickTimeMs, 0));

   rotate(uv, .3 - tickTimeMs * 50.);
   applyDistortion(distortion2, uv + vec2(-70. * tickTimeMs + 33., -33));

   rotate(uv, 2. - tickTimeMs * 50.);
   applyDistortion(distortion2, uv + vec2(-10. * tickTimeMs + 11., -11));

   return mix(mix(baseColor, shifterColor1, distortion1), shifterColor2, distortion2);
}

void main() {
   vec2 fragCoord = gl_FragCoord.xy / resolution.xy;
   vec2 adjustedCoord = sin(tickTimeSeconds * .2) * .01 + .5 + fragCoord;
   vec2 uv = adjustedCoord * .77 + offset + vec2(-.05, 0);
   vec2 centerOffset;

   uv.x *= resolution.x / resolution.y * mix(.8, 1., isVeryWide);
   centerOffset = (uv - adjustedCoord) / 2. + vec2(.2, .35);

   vec3 colorSum = vec3(0);
   for (int i = 0; i < 32; i++) {
      vec2 transformed = grain(uv);

      vec2 uvo = uv - centerOffset;
      rotate(uvo, tickTimeSeconds * 2.);

      vec2 a = vec2(mix(2., 1., hasLyricValue));

      vec2 ab = .5 + centerOffset + uvo / (a + (lowFreqVolume * 2. + .2) * (1. - pow(fragCoord.x * (1. - fragCoord.y) * fragCoord.y * (1. - fragCoord.x) * 15., 1.5) * .9));

      colorSum += sampleAndBlendTextures(samplerString, ab);

      uv += .0024 * transformed * mix(5., sin(tickTimeSeconds) * 2.5 + 2.5, isVeryWide);
   }
   colorSum /= 21.3125;
   colorSum *= 1.3;
   colorSum = 1. - exp(-colorSum);
   colorSum = pow(colorSum, vec3(3));
   colorSum *= 1.25;
   outColor = vec4(colorSum, 1);
}
