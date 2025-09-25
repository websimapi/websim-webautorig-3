import * as THREE from 'three';
import { BONE_HIERARCHY } from './bone-definitions.js';
import { computeSkinningWeights } from './skinning-utils.js';
import { createSkeleton, createSkinnedMesh } from './skeleton-builder.js';
import { createTestAnimations } from './animation-builder.js';

/**
 * Simplified auto-rigging implementation.
 * Creates a skeleton from markers, computes basic skinning weights,
 * and binds it to the mesh.
 */

export async function rigCharacter(model, markers, modelInverseMatrix, onProgress) {
    onProgress(0.1, "Creating skeleton...");
    await new Promise(res => setTimeout(res, 200));

    // 1. Create bones from markers
    const { skeleton, boneMap, markerPositions } = createSkeleton(markers, modelInverseMatrix);

    // 2. Find the mesh and prepare it for skinning
    let targetMesh;
    model.traverse(child => {
        if (child.isMesh && !targetMesh) {
            targetMesh = child;
        }
    });

    if (!targetMesh) {
        throw new Error("No mesh found in the model.");
    }
    
    // The geometry is already in the correct local space.
    // We just need to ensure the mesh doesn't have a world transform applied.
    targetMesh.position.set(0,0,0);
    targetMesh.rotation.set(0,0,0);
    targetMesh.scale.set(1,1,1);
    targetMesh.updateMatrixWorld(true);

    onProgress(0.4, "Computing skinning weights...");
    await new Promise(res => setTimeout(res, 200));

    // 3. Compute skinning weights
    const { skinIndex, skinWeight } = computeSkinningWeights(
        targetMesh.geometry, 
        skeleton.bones, 
        markerPositions, 
        BONE_HIERARCHY
    );

    // 4. Create SkinnedMesh
    const skinnedMesh = createSkinnedMesh(targetMesh, skeleton, skinIndex, skinWeight);
    
    // Add the root bone to the skinned mesh
    skinnedMesh.add(boneMap.get('hips')); 

    onProgress(0.9, "Finalizing rig...");
    await new Promise(res => setTimeout(res, 200));
    
    // Create a new model group to hold the final result
    const riggedModel = new THREE.Group();
    riggedModel.add(skinnedMesh);
    
    // Add test animations
    const animations = createTestAnimations(skeleton, boneMap.get('hips').position, markerPositions);

    return { riggedModel: riggedModel, animations };
}