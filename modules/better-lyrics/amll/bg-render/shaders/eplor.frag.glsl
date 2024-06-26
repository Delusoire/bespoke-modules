#version 300 es
precision highp float;

#define TAU 6.2831

uniform float hasLyric, frameTime, lowFreq, isHorizontal;
uniform sampler2D sampler;
uniform vec2 resolution, offset;
out vec4 fragColor;

float hash( float n )
{
   return fract( sin( n )*43758.5453 );
}

float noise( in vec2 x )
{
   vec2 p = floor( x );
   vec2 f = fract( x );
   f = f*f*( 3.-2.*f );
   float n = p.x+p.y*57.;
   return mix( mix( hash( n ), hash( n+1. ), f.x ), mix( hash( n+57. ), hash( n+58. ), f.x ), f.y );
}

vec2 map( vec2 p )
{
   float a = noise( p*3.5+.1 )*( TAU-2. )*mix( .2, 1., hasLyric );
   return vec2( cos( a ), sin( a ) );
}

void rotate( inout vec2 u, float angle )
{
   u = cos( angle )*u+sin( angle )*vec2( u.y,-u.x );
}

float dist( vec2 u, float scale )
{
   return length( u )-scale;
}

float getCellDistortion( vec2 uv )
{
   vec2 cell = round( uv );

   if( mod( cell.y, 2. )==0. )
      cell.x += 5000.;

   float cellularNoise = 1.+hash( dot( cell, vec2( 12.9898, 78.233 ) ) );

   vec2 v = mod( ( uv*1000. )+500., 1000. )-500.;
   v.x *= mix( 1.08, .72, fract( cellularNoise*11.11 ) );
   v.y *= mix( .72, .48, fract( cellularNoise*17.17 ) );

   float d = dist( v, mix( 30., 70., fract( cellularNoise*7.77 ) ) );
   return 1.-smoothstep( 0., 1., d*.005 );
}

vec3 sampleAndBlendTextures( sampler2D sampler, vec2 uv )
{
   uv.x *= mix( .6, 1., isHorizontal );
   vec3 baseColor = texture( sampler, uv*1.2*mix( vec2( .6 ), vec2( 1 ), isHorizontal )+frameTime*.02 ).xyz;

   float frameTimeMh = frameTime*.06;
   vec3 shifterColor1 = texture( sampler, uv*1.2+frameTimeMh ).xyz;
   vec3 shifterColor2 = texture( sampler,-uv+frameTimeMh ).xyz;

   float frameTimeMs = frameTime*.001;
   float distortion1 = 0., distortion2 = 0.;

   rotate( uv, .2-frameTimeMs*3. );
   distortion1 += getCellDistortion( uv+vec2( -50.*frameTimeMs, 0 ) );

   rotate( uv, .3-frameTimeMs*50. );
   distortion2 += getCellDistortion( uv+vec2( -70.*frameTimeMs+33.,-33 ) );

   rotate( uv, 2.-frameTimeMs*50. );
   distortion2 += getCellDistortion( uv+vec2( -10.*frameTimeMs+11.,-11 ) );

   return mix( mix( baseColor, shifterColor1, distortion1 ), shifterColor2, distortion2 );
}

void main( )
{
   vec2 p = gl_FragCoord.xy/resolution.xy;
   vec2 adjustedCoord = sin( frameTime*.2 )*.01+.5+p;

   vec2 uv = adjustedCoord*.77+offset+vec2( -.05, 0 );
   uv.x *= resolution.x/resolution.y;
   uv.x *= mix( .8, 1., isHorizontal );

   vec2 centerOffset = ( uv-adjustedCoord )/2.+vec2( .2, .35 );

   float acc = 0.;
   vec3 col = vec3( 0 );
   for( int i = 0; i<32; i++ )
   {
      vec2 dir = map( uv );

      float h = float( i )/32.;
      float w = 4.*h*( 1.-h );

      vec2 uvo = uv-centerOffset;
      rotate( uvo, frameTime*.2 );

      col += sampleAndBlendTextures( sampler, .5+centerOffset+( uvo-centerOffset )/( vec2( mix( 2., 1., hasLyric ) )+( lowFreq*2.+.2 )*( 1.-pow( p.x*( 1.-p.y )*p.y*( 1.-p.x )*15., 1.5 )*.9 ) ) ).xyz;
      acc += w;

      uv += .0024*dir*mix( 5., sin( frameTime )*2.5+2.5, isHorizontal );
   }
   col /= acc;

   col *= 1.3;
   col = 1.-exp( -col );
   col = pow( col, vec3( 3 ) );
   col *= 1.25;
   fragColor = vec4( col, 1. );
}
