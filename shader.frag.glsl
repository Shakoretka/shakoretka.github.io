//Origin https://www.shadertoy.com/view/ll2SRy

#version 300 es
precision mediump float;

uniform vec2 iResolution;
uniform float iTime;

out vec4 fragColor;

vec3 hash33(vec3 p) {
    float n = sin(dot(p, vec3(7.0, 157.0, 113.0)));
    return fract(vec3(2097152.0, 262144.0, 32768.0) * n);
}

float map(vec3 p) {
    vec3 o = hash33(floor(p)) * 0.2;
    p = fract(p + o) - 0.5;
    float r = dot(p, p) - 0.21;
    p = abs(p);
    return max(max(p.x, p.y), p.z) * 0.95 + r * 0.05 - 0.21;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - iResolution * 0.5) / iResolution.y;

    vec3 rd = normalize(vec3(uv, (1.0 - dot(uv, uv) * 0.5) * 0.5));
    vec3 ro = vec3(0.0, 0.0, iTime * 3.0);
    vec3 col = vec3(0.0);
    vec3 sp;

    float cs = cos(iTime * 0.375);
    float si = sin(iTime * 0.375);
    rd.xz = mat2(cs, si, -si, cs) * rd.xz;
    rd.xy = mat2(cs, si, -si, cs) * rd.xy;

    rd *= 0.985 + hash33(rd) * 0.03;

    float t = 0.0;
    float layers = 0.0;
    float d, aD;

    float thD = 0.035;

    for (int i = 0; i < 56; i++) {
        if (layers > 15.0  col.x > 1.0  t > 10.0) break;

        sp = ro + rd * t;
        d = map(sp);

        aD = (thD - abs(d) * 15.0 / 16.0) / thD;

        if (aD > 0.0) {
            col += aD * aD * (3.0 - 2.0 * aD) / (1.0 + t * t * 0.25) * 0.2;
            layers += 1.0;
        }

        t += max(abs(d) * 0.7, thD * 1.5);
    }

    col = max(col, 0.0);

    col = mix(col, pow(col.x * vec3(1.5, 1.0, 1.0), vec3(1.0, 2.5, 12.0)),
              dot(sin(rd.yzx * 8.0 + sin(rd.zxy * 8.0)), vec3(0.1666)) + 0.4);

    col = mix(col, vec3(col.x * col.x * 0.85, col.x, col.x * col.x * 0.3),
              dot(sin(rd.yzx * 4.0 + sin(rd.zxy * 4.0)), vec3(0.1666)) + 0.25);

    fragColor = vec4(max(col, 0.0), 1.0);
}
