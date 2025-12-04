import React, { useMemo, useRef } from 'react';

// 全局缓存
const mapCache = new Map<
    string,
    { displacementMapUrl: string; highlightMapUrl: string; scale: number }
>();

function getCacheKey(
    width: number,
    height: number,
    borderRadius: number,
    surfaceType: string,
    glassThickness: number,
    bezelWidth: number,
): string {
    return `${width}-${height}-${borderRadius}-${surfaceType}-${glassThickness}-${bezelWidth}`;
}

interface LiquidGlassButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    width?: number;
    height?: number;
    borderRadius?: number;
    surfaceType?: 'squircle' | 'circle' | 'concave' | 'lip';
    glassThickness?: number;
    bezelWidth?: number;
    className?: string;
}

const LiquidGlassButton: React.FC<LiquidGlassButtonProps> = ({
    children,
    onClick,
    width = 200,
    height = 60,
    borderRadius = 30,
    surfaceType = 'squircle',
    glassThickness = 0.15,
    bezelWidth = 0.3,
    className = '',
}) => {
    const filterId = useRef(`liquid-${Math.random().toString(36).substr(2, 9)}`).current;

    const glassMap = useMemo(() => {
        const cacheKey = getCacheKey(
            width,
            height,
            borderRadius,
            surfaceType,
            glassThickness,
            bezelWidth,
        );

        if (mapCache.has(cacheKey)) {
            return mapCache.get(cacheKey);
        }

        const maps = generateLiquidGlassMaps(
            width,
            height,
            borderRadius,
            surfaceType,
            glassThickness,
            bezelWidth,
        );
        mapCache.set(cacheKey, maps);
        return maps;
    }, [width, height, borderRadius, surfaceType, glassThickness, bezelWidth]);

    return (
        <>
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                    <filter id={filterId}>
                        <feGaussianBlur
                            in="SourceGraphic"
                            stdDeviation="0"
                            result="blurred_source"
                        />
                        <feImage
                            href={glassMap?.displacementMapUrl}
                            x="0"
                            y="0"
                            width={width}
                            height={height}
                            preserveAspectRatio="none"
                            result="displacement_map"
                        />
                        <feDisplacementMap
                            in="blurred_source"
                            in2="displacement_map"
                            scale={height / 2}
                            xChannelSelector="R"
                            yChannelSelector="G"
                            result="displaced"
                        />
                        <feColorMatrix
                            in="displaced"
                            type="saturate"
                            result="displaced_saturated"
                            values="1.2"
                        />
                        <feImage
                            href={glassMap?.highlightMapUrl}
                            x="0"
                            y="0"
                            width={width}
                            preserveAspectRatio="none"
                            height={height}
                            result="specular_layer"
                        />
                        <feGaussianBlur
                            in="specular_layer"
                            stdDeviation="1"
                            result="specular_blurred"
                        />
                        <feBlend
                            in="specular_blurred"
                            in2="displaced_saturated"
                            mode="screen"
                            result="withHighlight"
                        />
                        <feColorMatrix
                            in="withHighlight"
                            type="matrix"
                            values="1.05 0 0 0 0.02
                                    0 1.05 0 0 0.02
                                    0 0 1.05 0 0 0.02
                                    0 0 0 1 0"
                        />
                    </filter>
                </defs>
            </svg>

            <button
                onClick={onClick}
                className={className}
                style={{
                    position: 'relative',
                    width,
                    height,
                    borderRadius,
                    border: 'none',
                    padding: 0,
                    background: 'transparent',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    backdropFilter: `url(#${filterId})`,
                    WebkitBackdropFilter: `url(#${filterId})`,
                    boxShadow: `
                        0 ${height * 0.08}px ${height * 0.25}px rgba(0, 0, 0, 0.12),
                        inset 0 0.5px 0 rgba(255, 255, 255, 0.3)
                    `,
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.currentTarget.style.transform = 'translateY(-1px) scale(1.005)';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                }}>
                <div
                    style={{
                        position: 'relative',
                        zIndex: 1,
                        textShadow: '0 1px 2px rgba(0,0,0,0.25)',
                    }}>
                    {children}
                </div>
            </button>
        </>
    );
};

// 辅助函数
interface Vector2 {
    x: number;
    y: number;
}

const getRoundBoxSDF = (
    px: number,
    py: number,
    width: number,
    height: number,
    borderRadius: number,
): number => {
    const halfW = width / 2;
    const halfH = height / 2;

    const qx = Math.abs(px) - (halfW - borderRadius);
    const qy = Math.abs(py) - (halfH - borderRadius);

    const distToCorner = Math.sqrt(Math.max(0, qx) ** 2 + Math.max(0, qy) ** 2);
    const distToInnerRect = Math.min(Math.max(qx, qy), 0);

    return distToCorner + distToInnerRect - borderRadius;
};

function calculateSurfaceHeight(
    distFromEdge: number,
    bezelPixels: number,
    glassThickness: number,
    surfaceType: string,
): number {
    const t = Math.min(1, distFromEdge / bezelPixels);
    const p = 4;
    const smootherstep: (x: number) => number = (x) => x * x * x * (x * (x * 6 - 15) + 10);
    const convex = glassThickness * Math.sqrt(1 - (1 - t) ** 2);
    const concave = -glassThickness * 0.3 * Math.sqrt(1 - (1 - t) ** 2);

    switch (surfaceType) {
        case 'circle':
            return glassThickness * Math.sqrt(1 - (1 - t) ** 2);
        case 'squircle':
            return glassThickness * (1 - Math.pow(1 - Math.pow(t, p), 1 / p));
        case 'concave':
            return -glassThickness * Math.sqrt(1 - (1 - t) ** 2);
        case 'lip':
            return convex * (1 - smootherstep(t)) + concave * smootherstep(t);
        default:
            return glassThickness * (1 - t * t);
    }
}

function calculateNormal(
    distFromEdge: number,
    bezelPixels: number,
    glassThickness: number,
    surfaceType: string,
): Vector2 {
    const epsilon = 0.001;
    const h1 = calculateSurfaceHeight(
        Math.max(0, distFromEdge - epsilon),
        bezelPixels,
        glassThickness,
        surfaceType,
    );
    const h2 = calculateSurfaceHeight(
        Math.min(bezelPixels, distFromEdge + epsilon),
        bezelPixels,
        glassThickness,
        surfaceType,
    );
    const dh_dt = (h2 - h1) / (2 * epsilon);
    const len = Math.sqrt(dh_dt * dh_dt + 1);
    return {
        x: -dh_dt / len,
        y: 1 / len,
    };
}

function calculateRefraction(normal: Vector2, n1: number, n2: number): Vector2 {
    const incident = { x: 0, y: -1 };
    const cosI = -(incident.x * normal.x + incident.y * normal.y);
    const sinT2 = (n1 / n2) ** 2 * (1 - cosI ** 2);

    if (sinT2 > 1) return { x: 0, y: 0 };

    const cosT = Math.sqrt(1 - sinT2);
    const ratio = n1 / n2;

    return {
        x: ratio * incident.x + (ratio * cosI - cosT) * normal.x,
        y: ratio * incident.y + (ratio * cosI - cosT) * normal.y,
    };
}

function generateLiquidGlassMaps(
    width: number,
    height: number,
    borderRadius: number,
    surfaceType: string,
    glassThickness: number,
    bezelWidth: number,
): { displacementMapUrl: string; highlightMapUrl: string; scale: number } {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const highlightCanvas = document.createElement('canvas');
    highlightCanvas.width = width;
    highlightCanvas.height = height;
    const hCtx = highlightCanvas.getContext('2d')!;

    const centerX = width / 2;
    const centerY = height / 2;
    const effectiveRadius = Math.min(width, height) / 2;
    const bezelPixels = effectiveRadius * bezelWidth;

    const samples = 200;
    const displacements: Array<{ magnitude: number; normalizedMagnitude?: number }> = [];
    let maxDisplacement = 0;

    for (let i = 0; i <= samples; i++) {
        const distFromEdge = (i / samples) * bezelPixels;
        const surfaceHeight = calculateSurfaceHeight(
            distFromEdge,
            bezelPixels,
            glassThickness,
            surfaceType,
        );
        const normal = calculateNormal(distFromEdge, bezelPixels, glassThickness, surfaceType);
        const refractedRay = calculateRefraction(normal, 1.0, 1.52);
        const magnitude =
            Math.sqrt(refractedRay.x ** 2 + refractedRay.y ** 2) * surfaceHeight * bezelPixels;

        maxDisplacement = Math.max(maxDisplacement, magnitude);
        displacements.push({ magnitude });
    }

    displacements.forEach((d) => {
        d.normalizedMagnitude = maxDisplacement > 0 ? d.magnitude / maxDisplacement : 0;
    });

    const imageData = ctx.createImageData(width, height);
    const highlightData = hCtx.createImageData(width, height);
    const data = imageData.data;
    const hData = highlightData.data;
    const epsilon = 0.5;

    // 🌟 边缘白色高光参数
    const EDGE_HIGHLIGHT_WIDTH = 3; // 边缘高光宽度(像素)
    const EDGE_HIGHLIGHT_INTENSITY = 255; // 高光强度
    const EDGE_HIGHLIGHT_FALLOFF = 2.5; // 衰减指数

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const px = x - centerX;
            const py = y - centerY;

            const signedDistance = getRoundBoxSDF(px, py, width, height, borderRadius);
            const isInside = signedDistance < 0;
            const distFromEdge = Math.abs(signedDistance);

            const idx = (y * width + x) * 4;

            if (distFromEdge < bezelPixels) {
                // 计算法线
                const nx =
                    getRoundBoxSDF(px + epsilon, py, width, height, borderRadius) -
                    getRoundBoxSDF(px - epsilon, py, width, height, borderRadius);
                const ny =
                    getRoundBoxSDF(px, py + epsilon, width, height, borderRadius) -
                    getRoundBoxSDF(px, py - epsilon, width, height, borderRadius);

                const normalLength = Math.sqrt(nx * nx + ny * ny);
                let normalX = 0,
                    normalY = 0;

                if (normalLength > 0.0001) {
                    normalX = nx / normalLength;
                    normalY = ny / normalLength;
                }

                const sampleIndex = Math.min(
                    samples,
                    Math.floor((distFromEdge / bezelPixels) * samples),
                );
                const intensity = displacements[sampleIndex]?.normalizedMagnitude || 0;

                const finalDispX = -intensity * normalX;
                const finalDispY = -intensity * normalY;

                // 位移贴图
                data[idx] = 128 + finalDispX * 127;
                data[idx + 1] = 128 + finalDispY * 127;
                data[idx + 2] = 128;
                data[idx + 3] = 255;

                // 🌟 边缘白色高光 - 只在非常靠近边缘的位置
                if (isInside && distFromEdge < EDGE_HIGHLIGHT_WIDTH) {
                    const edgeFactor = distFromEdge / EDGE_HIGHLIGHT_WIDTH;
                    const highlightValue = Math.pow(1 - edgeFactor, EDGE_HIGHLIGHT_FALLOFF);
                    const highlightAlpha = highlightValue * EDGE_HIGHLIGHT_INTENSITY;

                    hData[idx] = 255;
                    hData[idx + 1] = 255;
                    hData[idx + 2] = 255;
                    hData[idx + 3] = Math.min(255, highlightAlpha);
                } else {
                    hData[idx] = 0;
                    hData[idx + 1] = 0;
                    hData[idx + 2] = 0;
                    hData[idx + 3] = 0;
                }
            } else if (isInside) {
                // 按钮内部
                data[idx] = 128;
                data[idx + 1] = 128;
                data[idx + 2] = 128;
                data[idx + 3] = 255;

                hData[idx] = 0;
                hData[idx + 1] = 0;
                hData[idx + 2] = 0;
                hData[idx + 3] = 0;
            } else {
                // 按钮外部
                data[idx] = 128;
                data[idx + 1] = 128;
                data[idx + 2] = 128;
                data[idx + 3] = 0;

                hData[idx] = 0;
                hData[idx + 1] = 0;
                hData[idx + 2] = 0;
                hData[idx + 3] = 0;
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);
    hCtx.putImageData(highlightData, 0, 0);

    return {
        displacementMapUrl: canvas.toDataURL(),
        highlightMapUrl: highlightCanvas.toDataURL(),
        scale: maxDisplacement,
    };
}

export default LiquidGlassButton;

function App() {
    return (
        <div
            style={{
                minHeight: '100vh',
                position: 'relative',
                overflow: 'hidden',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}>
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: `
                        radial-gradient(circle at 20% 30%, rgba(255, 0, 110, 0.4) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(131, 56, 236, 0.4) 0%, transparent 50%),
                        radial-gradient(circle at 40% 70%, rgba(58, 134, 255, 0.4) 0%, transparent 50%),
                        radial-gradient(circle at 90% 80%, rgba(251, 86, 7, 0.4) 0%, transparent 50%),
                        linear-gradient(135deg, #667eea 0%, #764ba2 100%)
                    `,
                }}
            />

            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `
                        linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px),
                        linear-gradient(0deg, rgba(255,255,255,0.05) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px',
                }}
            />

            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '180px',
                    fontWeight: '900',
                    color: 'rgba(255,255,255,0.06)',
                    userSelect: 'none',
                    pointerEvents: 'none',
                }}>
                LIQUID
            </div>

            <div
                style={{
                    position: 'relative',
                    zIndex: 10,
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '50px',
                    padding: '80px 40px 60px',
                }}>
                <div style={{ textAlign: 'center' }}>
                    <h1
                        style={{
                            color: 'white',
                            fontSize: '56px',
                            marginBottom: '15px',
                            fontWeight: '800',
                            textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                        }}>
                        💧 Liquid Glass
                    </h1>
                    <p
                        style={{
                            color: 'rgba(255,255,255,0.95)',
                            fontSize: '18px',
                            lineHeight: '1.6',
                            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                            maxWidth: '600px',
                            margin: '0 auto',
                        }}>
                        边缘白色高光 + SVG 折射效果
                    </p>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '40px',
                        maxWidth: '900px',
                    }}>
                    <div style={{ textAlign: 'center' }}>
                        <LiquidGlassButton
                            surfaceType="squircle"
                            glassThickness={0.18}
                            bezelWidth={0.35}>
                            Squircle Surface
                        </LiquidGlassButton>
                        <p
                            style={{
                                color: 'rgba(255,255,255,0.8)',
                                marginTop: '12px',
                                fontSize: '13px',
                            }}>
                            苹果偏爱的柔和曲线
                        </p>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <LiquidGlassButton
                            surfaceType="circle"
                            glassThickness={0.2}
                            bezelWidth={0.35}>
                            Circle Surface
                        </LiquidGlassButton>
                        <p
                            style={{
                                color: 'rgba(255,255,255,0.8)',
                                marginTop: '12px',
                                fontSize: '13px',
                            }}>
                            简单圆弧表面
                        </p>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <LiquidGlassButton
                            surfaceType="concave"
                            glassThickness={0.15}
                            bezelWidth={0.35}>
                            Concave Surface
                        </LiquidGlassButton>
                        <p
                            style={{
                                color: 'rgba(255,255,255,0.8)',
                                marginTop: '12px',
                                fontSize: '13px',
                            }}>
                            凹面效果
                        </p>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <LiquidGlassButton
                            surfaceType="lip"
                            glassThickness={0.18}
                            bezelWidth={0.35}>
                            Lip Surface
                        </LiquidGlassButton>
                        <p
                            style={{
                                color: 'rgba(255,255,255,0.8)',
                                marginTop: '12px',
                                fontSize: '13px',
                            }}>
                            边缘凸起
                        </p>
                    </div>
                </div>

                <div>
                    <LiquidGlassButton
                        width={320}
                        height={85}
                        borderRadius={42}
                        surfaceType="squircle"
                        glassThickness={0.2}
                        bezelWidth={0.38}>
                        <span style={{ fontSize: '24px', fontWeight: '700' }}>
                            Large Glass Button 🌊
                        </span>
                    </LiquidGlassButton>
                </div>

                <div
                    style={{
                        display: 'flex',
                        gap: '30px',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                    }}>
                    <LiquidGlassButton
                        width={100}
                        height={56}
                        borderRadius={28}
                        glassThickness={0.16}
                        bezelWidth={0.35}>
                        OFF
                    </LiquidGlassButton>

                    <LiquidGlassButton
                        width={100}
                        height={56}
                        borderRadius={28}
                        glassThickness={0.16}
                        bezelWidth={0.35}>
                        ON
                    </LiquidGlassButton>
                </div>

                <div
                    style={{
                        marginTop: '30px',
                        padding: '30px 40px',
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '20px',
                        maxWidth: '750px',
                        border: '1px solid rgba(255,255,255,0.15)',
                    }}>
                    <h3 style={{ color: 'white', marginBottom: '15px', fontSize: '22px' }}>
                        🌟 新增边缘白色高光
                    </h3>
                    <ul
                        style={{
                            color: 'rgba(255,255,255,0.9)',
                            lineHeight: '2',
                            textAlign: 'left',
                            fontSize: '15px',
                            listStyle: 'none',
                            padding: 0,
                        }}>
                        <li>✅ 边缘 3px 内的白色高光</li>
                        <li>✅ 使用 pow 函数实现平滑衰减</li>
                        <li>✅ 全局缓存优化,避免重复生成</li>
                        <li>✅ 通过 feBlend screen 模式叠加</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
