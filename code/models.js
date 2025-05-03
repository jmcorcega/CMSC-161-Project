export function createRockGeometry(detail = 1) {
    const vertices = [];
    const normals = [];

    const getRandom = (min, max) => Math.random() * (max - min) + min;

    const subdivisions = detail * 6; // controls "rockiness"

    for (let i = 0; i < subdivisions; i++) {
        const angle1 = (Math.PI * 2 * i) / subdivisions;
        const angle2 = (Math.PI * 2 * (i + 1)) / subdivisions;

        const r1 = getRandom(0.3, 0.5);
        const r2 = getRandom(0.3, 0.5);

        const y1 = getRandom(0, 0.2);
        const y2 = getRandom(0, 0.2);

        const x1 = Math.cos(angle1) * r1;
        const z1 = Math.sin(angle1) * r1;
        const x2 = Math.cos(angle2) * r2;
        const z2 = Math.sin(angle2) * r2;

        // Triangle: center top, outer ring1, outer ring2
        vertices.push(0, 0.4 + getRandom(0, 0.1), 0);  // top center
        vertices.push(x1, y1, z1);
        vertices.push(x2, y2, z2);

        // Normals (simple upward facing)
        normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0);
    }

    return { vertices, normals };
}
