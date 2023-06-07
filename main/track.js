import * as THREE from 'three';

function createTrack(r1, r2, r3){
    const ground_geometry = new THREE.CircleGeometry( r1, 4 );
    const ground_material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const ground = new THREE.Mesh( ground_geometry, ground_material );
    ground.position.set(0, 0, 0);
    ground.rotateX(-Math.PI/2);
    ground.rotateZ(Math.PI / 4);

    const geometry_road = new THREE.RingGeometry( r1, r2, 4 );
    const material_road = new THREE.MeshBasicMaterial( { color: 0x808080, side: THREE.DoubleSide } );
    const road = new THREE.Mesh( geometry_road, material_road );
    road.position.set(0, 0, 0);
    road.rotateX(Math.PI/2);
    road.rotateZ(Math.PI / 4);

    const geometry_side = new THREE.RingGeometry( r2, r3, 4 );
    const material_side = new THREE.MeshBasicMaterial( { color: 0x00ff00, side: THREE.DoubleSide } );
    const side = new THREE.Mesh( geometry_side, material_side );
    side.position.set(0, 0, 0);
    side.rotateX(Math.PI/2);
    side.rotateZ(Math.PI / 4);

    let array = [ground, road, side];
    return array;
}

export {createTrack};