export class AbstractBaseRenderer {
}
export class BaseRenderer extends AbstractBaseRenderer {
    canvas;
    observer;
    flowSpeed;
    currerntRenderScale;
    constructor(canvas){
        super();
        this.canvas = canvas;
        this.flowSpeed = 4;
        this.currerntRenderScale = 0.75;
        this.observer = new ResizeObserver(()=>{
            const width = Math.max(1, canvas.clientWidth * window.devicePixelRatio * this.currerntRenderScale);
            const height = Math.max(1, canvas.clientHeight * window.devicePixelRatio * this.currerntRenderScale);
            this.onResize(width, height);
        });
        this.observer.observe(canvas);
    }
    setRenderScale(scale) {
        this.currerntRenderScale = scale;
        this.onResize(this.canvas.clientWidth * window.devicePixelRatio * this.currerntRenderScale, this.canvas.clientHeight * window.devicePixelRatio * this.currerntRenderScale);
    }
    /**
	 * 当画板元素大小发生变化时此函数会被调用
	 * 可以在此处重设和渲染器相关的尺寸设置
	 * 考虑到初始化的时候元素不一定在文档中或出于某些特殊样式状态，尺寸长宽有可能会为 0，请注意进行特判处理
	 * @param width 画板元素实际的物理像素宽度，有可能为 0
	 * @param height 画板元素实际的物理像素高度，有可能为 0
	 */ onResize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }
    /**
	 * 修改背景的流动速度，数字越大越快，默认为 4
	 * @param speed 背景的流动速度，默认为 4
	 */ setFlowSpeed(speed) {
        this.flowSpeed = speed;
    }
    dispose() {
        this.observer.disconnect();
        this.canvas.remove();
    }
}
