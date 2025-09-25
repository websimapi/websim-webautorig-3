import * as THREE from 'three';
import { createWaveAnimation } from './animations/wave-animation.js';
import { createIdleAnimation } from './animations/idle-animation.js';
import { createWalkAnimation } from './animations/walk-animation.js';

/**
 * Animation creation and management
 */

export function createTestAnimations(skeleton, hipPos, markerPositions) {
    const animations = {}

    // Get all bones we might need for animations
    const hips = skeleton.getBoneByName('hips');
    const spine = skeleton.getBoneByName('spine');
    const shoulderL = skeleton.getBoneByName('left_shoulder');
    const shoulderR = skeleton.getBoneByName('right_shoulder');
    const elbowL = skeleton.getBoneByName('left_elbow');
    const elbowR = skeleton.getBoneByName('right_elbow');
    const kneeL = skeleton.getBoneByName('left_knee');
    const kneeR = skeleton.getBoneByName('right_knee');

    // Create wave animation
    if (shoulderR && elbowR) {
        animations.wave = createWaveAnimation(shoulderR, elbowR);
    }

    // Create idle animation
    if (hips && spine && shoulderL && shoulderR && kneeL && kneeR) {
        animations.idle = createIdleAnimation(hips, spine, shoulderL, shoulderR, elbowL, elbowR, kneeL, kneeR, hipPos, markerPositions);
    }

    // Create walk animation
    if (hips && spine && shoulderL && shoulderR && elbowL && elbowR && kneeL && kneeR) {
        const hipL = skeleton.getBoneByName('left_hip');
        const hipR = skeleton.getBoneByName('right_hip');
        animations.walk = createWalkAnimation(hips, spine, shoulderL, shoulderR, elbowL, elbowR, kneeL, kneeR, hipL, hipR, hipPos, markerPositions);
    }

    return animations;
}

// removed function createWaveAnimation() {}
// removed function createIdleAnimation() {}
// removed function createWalkAnimation() {}

