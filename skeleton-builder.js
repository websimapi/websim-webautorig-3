import * as THREE from 'three';
import { BONE_HIERARCHY, BONE_NAMES } from './bone-definitions.js';

/**
 * Functions for creating and setting up skeletons
 */

export function createSkeleton(markers, modelInverseMatrix) {
    // Create bones from markers
    const bones = [];
    const boneMap = new Map();
    const markerPositions = new Map(); // Store local positions of markers

    // Transform marker world positions to the model's local space.
    for (const id of BONE_NAMES) {
        const worldPos = markers.get(id);
        const localPos = worldPos.clone().applyMatrix4(modelInverseMatrix);
        markerPositions.set(id, localPos);

        const bone = new THREE.Bone();
        bone.name = id;
        boneMap.set(id, bone);
        bones.push(bone);
    }

    // Build hierarchy and set local positions
    for (const [id, bone] of boneMap.entries()) {
        const parentId = Object.keys(BONE_HIERARCHY).find(p => BONE_HIERARCHY[p].children.includes(id));
        if (parentId) {
            const parentBone = boneMap.get(parentId);
            parentBone.add(bone);

            // Position is relative to parent bone
            const childLocalPos = markerPositions.get(id);
            const parentLocalPos = markerPositions.get(parentId);
            bone.position.copy(childLocalPos).sub(parentLocalPos);

        } else { // This is the root bone (hips)
            bone.position.copy(markerPositions.get(id));
        }
    }

    const skeleton = new THREE.Skeleton(bones);
    return { skeleton, boneMap, markerPositions };
}

export function createSkinnedMesh(targetMesh, skeleton, skinIndex, skinWeight) {
    const geometry = targetMesh.geometry;
    const material = targetMesh.material;

    // Set up geometry attributes
    geometry.setAttribute('skinIndex', skinIndex);
    geometry.setAttribute('skinWeight', skinWeight);

    // Enable skinning on material if supported
    if(material && 'skinning' in material) {
        material.skinning = true;
    }

    const skinnedMesh = new THREE.SkinnedMesh(geometry, material);

    // Decompose the original mesh's world matrix to handle its scale correctly.
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    targetMesh.matrixWorld.decompose(position, quaternion, scale);

    // Apply the original mesh's scale to the SkinnedMesh object.
    skinnedMesh.scale.copy(scale);

    skinnedMesh.bind(skeleton);

    return skinnedMesh;
}