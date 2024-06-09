#version 300 es
precision highp float;
uniform float IIIlllllllIIIllIl, lIIIlllllIllIl, IIIlllIlIIllll, IIIIIllllllIll;
uniform sampler2D IlllIIlIlllIll;
uniform vec2 IIlIlIIlIlIllI, IllIlllIlIIlllI;
out vec4 lIIlIIIIIlIlIlllIIIIlIIl;
float lIlIIllllIllIll(float IIIlIIlIIIlllIII) {
   IIIlIIlIIIlllIII -= 0.f;
   return sin(IIIlIIlIIIlllIII);
}
float lIlIlllllIllIll(float IIIlIIlIIIlllIII) {
   IIIlIIlIIIlllIII += acos(0.f);
   return sin(IIIlIIlIIIlllIII);
}
float IllllIIlIllII(float llIIllIllIIIllI) {
   return fract(lIlIIllllIllIll(llIIllIllIIIllI) * 43758.5453f);
}
float llIlIIllllIII(vec2 IIIlIIlIIIlllIII) {
   vec2 IIllIlIIlllI = floor(IIIlIIlIIIlllIII), lIlIllIIIIIlIl = fract(IIIlIIlIIIlllIII);
   lIlIllIIIIIlIl = lIlIllIIIIIlIl * lIlIllIIIIIlIl * (3.f - 2.f * lIlIllIIIIIlIl);
   float lIlIlIlIlIlIIl = IIllIlIIlllI.x + IIllIlIIlllI.y * 57.f;
   return mix(mix(IllllIIlIllII(lIlIlIlIlIlIIl), IllllIIlIllII(lIlIlIlIlIlIIl + 1.f), lIlIllIIIIIlIl.x), mix(IllllIIlIllII(lIlIlIlIlIlIIl + 57.f), IllllIIlIllII(lIlIlIlIlIlIIl + 58.f), lIlIllIIIIIlIl.x), lIlIllIIIIIlIl.y);
}
vec2 lllIIIIIIllIlIIIlI(vec2 IlllIIlIIIIlIIII) {
   float lIIlIllIIIlIl = llIlIIllllIII(IlllIIlIIIIlIIII * vec2(1) * 3.5f + .1f) * 4.2831f * mix(.2f, 1.f, IIIlllllllIIIllIl);
   IlllIIlIIIIlIIII += vec2(-1, .5f);
   return vec2(lIlIlllllIllIll(lIIlIllIIIlIl), lIlIIllllIllIll(lIIlIllIIIlIl));
}
void lllIIIIllIlIIIIIlI(inout vec2 lllIllIlIIIIIIIIlI, float llllIllIIIIIIIIIlI) {
   lllIllIlIIIIIIIIlI = cos(llllIllIIIIIIIIIlI) * lllIllIlIIIIIIIIlI + sin(llllIllIIIIIIIIIlI) * vec2(lllIllIlIIIIIIIIlI.y, -lllIllIlIIIIIIIIlI.x);
}
float lllIIIIIIIlllIIIlI(vec2 lIIIIlllllIIIIIIlI, float IIllllIIllIIIIIIlI) {
   return (length(lIIIIlllllIIIIIIlI / IIllllIIllIIIIIIlI) - 1.f) * IIllllIIllIIIIIIlI;
}
void IIllIIIIIllIlIlIlI(inout float IIllllIIllIIIIIIlI, vec2 lIIIIlllllIIIIIIlI) {
   lIIIIlllllIIIIIIlI *= 1e3f;
   if(mod(floor(lIIIIlllllIIIIIIlI.y / 1e3f + .5f), 2.f) == 0.f)
      lIIIIlllllIIIIIIlI.x += 5e3f;
   vec2 lIIIIlIllllIIIIIlI = mod(lIIIIlllllIIIIIIlI + 5500.f, 1e3f) - 5e2f, lIlIIIIIlIlllIIIlI = floor(lIIIIlllllIIIIIIlI / 1e3f + .5f);
   float lIIIlIlllIIIlIIIlI = fract(sin(dot(lIlIIIIIlIlllIIIlI.xy, vec2(12.9898f, 78.233f))) * 43758.5453f);
   lIIIIlIllllIIIIIlI.x *= mix(.9f, .6f, fract(lIIIlIlllIIIlIIIlI * 11.13f + 11.13f)) * 1.2f;
   lIIIIlIllllIIIIIlI.y *= mix(.9f, .6f, fract(lIIIlIlllIIIlIIIlI * 17.17f + 17.17f)) * .8f;
   float lIlIIIIlIllIlIIIlI = lllIIIIIIIlllIIIlI(lIIIIlIllllIIIIIlI, mix(30.f, 70.f, fract(lIIIlIlllIIIlIIIlI * 7.77f + 7.77f)));
   IIllllIIllIIIIIIlI += 1.f - smoothstep(0.f, 1.f, lIlIIIIlIllIlIIIlI * .005f);
}
vec3 llllllIIIIlll(sampler2D IIIlIIlllIIIllIIlI, vec2 IlllIIIlIIIIllIIlI) {
   IlllIIIlIIIIllIIlI *= mix(vec2(.6f, 1), vec2(1), IIIIIllllllIll);
   vec3 IIlllIIlIIllIIIIlI = texture(IIIlIIlllIIIllIIlI, IlllIIIlIIIIllIIlI * 1.2f * mix(vec2(.6f), vec2(1), IIIIIllllllIll) + lIIIlllllIllIl * .02f).xyz;
   float IIlIIlIllIIIllIIlI = lIIIlllllIllIl * .06f;
   vec3 IIlIlIIllllIIIIIlI = texture(IIIlIIlllIIIllIIlI, IlllIIIlIIIIllIIlI * 1.2f + IIlIIlIllIIIllIIlI).xyz, IIlIlIIllIIIllIIlI = texture(IIIlIIlllIIIllIIlI, -IlllIIIlIIIIllIIlI + IIlIIlIllIIIllIIlI).xyz;
   float IllIIllIIIIIllIIlI = lIIIlllllIllIl * .001f, IIllllIIllIIIIIIlI = 0.f, IIlIIllIIIlllIIIlI = 0.f;
   lllIIIIllIlIIIIIlI(IlllIIIlIIIIllIIlI, .2f - IllIIllIIIIIllIIlI * 3.f);
   IIllIIIIIllIlIlIlI(IIllllIIllIIIIIIlI, IlllIIIlIIIIllIIlI + vec2(-50.f * IllIIllIIIIIllIIlI, 0));
   lllIIIIllIlIIIIIlI(IlllIIIlIIIIllIIlI, .3f - IllIIllIIIIIllIIlI * 50.f);
   IIllIIIIIllIlIlIlI(IIlIIllIIIlllIIIlI, IlllIIIlIIIIllIIlI + vec2(-70.f * IllIIllIIIIIllIIlI + 33.f, -33));
   lllIIIIllIlIIIIIlI(IlllIIIlIIIIllIIlI, 2.f - IllIIllIIIIIllIIlI * 50.f);
   IIllIIIIIllIlIlIlI(IIlIIllIIIlllIIIlI, IlllIIIlIIIIllIIlI + vec2(-10.f * IllIIllIIIIIllIIlI + 11.f, -11));
   return mix(mix(IIlllIIlIIllIIIIlI, IIlIlIIllllIIIIIlI, IIllllIIllIIIIIIlI), IIlIlIIllIIIllIIlI, IIlIIllIIIlllIIIlI);
}
void main() {
   vec2 lIIlllIlllllIll = gl_FragCoord.xy / IIlIlIIlIlIllI.xy, lIIIlIIllIlIIlI = lIlIIllllIllIll(lIIIlllllIllIl * .2f) * .01f + .5f + lIIlllIlllllIll, lIIllIIlIIIllI = lIIIlIIllIlIIlI * .77f + IllIlllIlIIlllI + vec2(-.05f, 0), lIIllllIIIIllllII, lIlIIlIlIIIllIll;
   lIIllIIlIIIllI.x *= IIlIlIIlIlIllI.x / IIlIlIIlIlIllI.y * mix(.8f, 1.f, IIIIIllllllIll);
   lIIllllIIIIllllII = (lIIllIIlIIIllI - lIIIlIIllIlIIlI) / 2.f + vec2(.2f, .35f);
   float lIIIlIllIllIlIIl = 0.f;
   vec3 lIIIlIlIIIlIlIIl = vec3(0);
   lIlIIlIlIIIllIll = lIIllIIlIIIllI;
   for(int IllIlIIlIIlllllIIIl = 0; IllIlIIlIIlllllIIIl < 32; IllIlIIlIIlllllIIIl++) {
      vec2 lIlllIlllIlllII = lllIIIIIIllIlIIIlI(lIIllIIlIIIllI), lIIIlllllIIIIllI;
      float lIIlIlIIlIIlIllI = float(IllIlIIlIIlllllIIIl) / 32.f;
      lIIIlllllIIIIllI = vec2(lIIllllIIIIllllII.x + (lIIllIIlIIIllI.x - lIIllllIIIIllllII.x) * lIlIlllllIllIll(-lIIIlllllIllIl * .2f) - (lIIllIIlIIIllI.y - lIIllllIIIIllllII.y) * lIlIIllllIllIll(-lIIIlllllIllIl * .2f), lIIllllIIIIllllII.y + (lIIllIIlIIIllI.x - lIIllllIIIIllllII.x) * lIlIIllllIllIll(-lIIIlllllIllIl * .2f) + (lIIllIIlIIIllI.y - lIIllllIIIIllllII.y) * lIlIlllllIllIll(-lIIIlllllIllIl * .2f));
      lIIIlIlIIIlIlIIl += llllllIIIIlll(IlllIIlIlllIll, .5f + lIIllllIIIIllllII + (lIIIlllllIIIIllI - lIIllllIIIIllllII) / (vec2(mix(2.f, 1.f, IIIlllllllIIIllIl)) + (IIIlllIlIIllll * 2.f + .2f) * (1.f - pow(lIIlllIlllllIll.x * (1.f - lIIlllIlllllIll.y) * lIIlllIlllllIll.y * (1.f - lIIlllIlllllIll.x) * 15.f, 1.5f) * .9f))).xyz;
      lIIIlIllIllIlIIl += 4.f * lIIlIlIIlIIlIllI * (1.f - lIIlIlIIlIIlIllI);
      lIIllIIlIIIllI += .0024f * lIlllIlllIlllII * mix(5.f, lIlIIllllIllIll(lIIIlllllIllIl) * 2.5f + 2.5f, IIIIIllllllIll);
      lIlIIlIlIIIllIll += .05f * lIlllIlllIlllII;
   }
   lIIIlIlIIIlIlIIl /= lIIIlIllIllIlIIl;
   lIIIlIlIIIlIlIIl *= 1.3f;
   lIIIlIlIIIlIlIIl = 1.f - exp(-lIIIlIlIIIlIlIIl);
   lIIIlIlIIIlIlIIl = pow(lIIIlIlIIIlIlIIl, vec3(3));
   lIIIlIlIIIlIlIIl *= 1.25f;
   lIIlIIIIIlIlIlllIIIIlIIl = vec4(lIIIlIlIIIlIlIIl, 1);
}
