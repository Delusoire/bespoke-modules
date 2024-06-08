import bezier from "https://esm.sh/bezier-easing";
import { getVelocity } from "./derivative.js";
/**
 * 基于 Web Animation API 的弹簧动画工具类，效果上可能逊于实时演算的版本
 */ export class WebAnimationSpring extends EventTarget {
    element;
    styleName;
    valueGenerator;
    currentPosition;
    currentAnimation;
    targetPosition;
    isStatic;
    params;
    currentSolver;
    getV;
    constructor(element, styleName, valueGenerator, currentPosition = 0){
        super();
        this.element = element;
        this.styleName = styleName;
        this.valueGenerator = valueGenerator;
        this.currentPosition = currentPosition;
        this.targetPosition = 0;
        this.isStatic = true;
        this.params = {};
        this.currentSolver = ()=>this.targetPosition;
        this.getV = ()=>0;
        this.targetPosition = currentPosition;
        this.currentAnimation = element.animate([
            {
                [styleName]: valueGenerator(currentPosition)
            }
        ], {
            duration: 1000,
            fill: "both",
            composite: "add"
        });
    }
    makeStatic() {
        this.getV = ()=>0;
        this.currentSolver = ()=>this.targetPosition;
        this.currentAnimation.cancel();
        this.currentAnimation = this.element.animate([
            {
                [this.styleName]: this.valueGenerator(this.targetPosition)
            },
            {
                [this.styleName]: this.valueGenerator(this.targetPosition)
            }
        ], {
            duration: Infinity,
            id: `wa-spring-static-${this.styleName}`,
            fill: "both",
            easing: "cubic-bezier(0.5, 0, 0.5, 1)",
            composite: "add"
        });
        this.currentAnimation.pause();
    }
    setTargetPosition(targetPosition) {
        this.targetPosition = targetPosition;
        this.onStepFinished();
    }
    getCurrentPosition() {
        if (this.isStatic || !this.currentAnimation.effect) {
            return this.currentPosition;
        } else {
            const timing = this.currentAnimation.effect?.getComputedTiming();
            return this.currentSolver(timing.progress ?? 1);
        }
    }
    getCurrentVelocity() {
        if (this.isStatic || !this.currentAnimation.effect) {
            return 0;
        } else {
            const timing = this.currentAnimation.effect?.getComputedTiming();
            return this.getV(timing.progress ?? 1);
        }
    }
    onStepFinished() {
        const currentPosition = this.getCurrentPosition();
        if (Math.abs(this.targetPosition - currentPosition) < 0.0001) {
            this.makeStatic();
            this.dispatchEvent(new Event("finished"));
            return;
        }
        this.currentSolver = bezier(0.5, 0, 0.5, 1);
        this.getV = getVelocity(this.currentSolver);
        this.currentAnimation.cancel();
        const delta = (this.targetPosition - currentPosition) * 1.05;
        this.currentPosition += delta;
        this.currentAnimation = this.element.animate([
            {
                [this.styleName]: this.valueGenerator(currentPosition)
            },
            {
                [this.styleName]: this.valueGenerator(this.currentPosition)
            }
        ], {
            duration: 250,
            id: `wa-spring-dynamic-${this.styleName}`,
            fill: "forwards",
            easing: "cubic-bezier(0.5, 0, 0.5, 1)",
            composite: "add"
        });
        this.currentAnimation.onfinish = ()=>this.onStepFinished();
    }
    stop() {
        if (this.currentAnimation) {
            this.currentAnimation.cancel();
        }
    }
    dispose() {
        this.stop();
    }
}
