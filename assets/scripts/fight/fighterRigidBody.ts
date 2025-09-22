import { _decorator, Component, Vec3 } from "cc";
import Constants from "../framework/constants";
const { ccclass, property } = _decorator;

@ccclass("FighterRigidBody")
export class FighterRigidBody extends Component {
    public enableSync: boolean = true;//开启刚体对模型的属性同步，避免刚体与模型分离

    private _bodyDef: any = null!;//b2BodyDef类包含的刚体属性有10多种，包括刚体类型，线性速度，角速度，主要是刚体运动和状态相关的属性
    private _fixture: any = null!;//b2FixtureDef类主要保存了刚体物质特性方面的属性，如密度density, 表面摩擦力friction，弹性系数restitution等
    private _world: any = null!;//物理世界
    private _b2Body: any = null!;//刚体

    start () {
        // Your initialization goes here.
    }

    onDestroy() {
        this.destroyBody();
    }

    /**
     * 初始化士兵刚体
     * @param world 
     * @param radius 
     * @returns 
     */
    public initBody (world: any, radius:number = 1) {

        //@ts-ignore 
        const bodyDef = new box2d.b2BodyDef();

        if (this._b2Body) {
            return;
        }

        this._world = world;

        //@ts-ignore 动态刚体
        bodyDef.type = box2d.b2BodyType.b2_dynamicBody;

        //不允许休眠
        bodyDef.allowSleep = false;

        //禁止刚体旋转
        bodyDef.fixedRotation = true;
        this._bodyDef = bodyDef;

        //将刚体添加到物理世界
        this._b2Body = world.CreateBody(this._bodyDef);

        //@ts-ignore 标准圆，参数为半径，后续需要做转换
        const circle = new box2d.b2CircleShape(radius / Constants.PTM_RATIO);

        //@ts-ignore 
        const fixtureDef = new box2d.b2FixtureDef();

        //@ts-ignore
        fixtureDef.shape = circle;

        //设置刚体的物理属性
        if (this._b2Body) {
            this._fixture = this._b2Body.CreateFixture(fixtureDef, 0);
        }
    }

    /**
     * 更新半径
     * @param radius 
     */
    public updateRadius (radius: number) {
        if (this._fixture) {
            this._fixture.GetShape().m_radius = radius / Constants.PTM_RATIO;
        }
    }

    /**
     * 设置士兵节点和对应刚体的世界坐标
     * @param pos 
     */
    public setWorldPosition (pos: Vec3) {
        let posBody = {x: pos.x / Constants.PTM_RATIO, y: pos.z / Constants.PTM_RATIO};
        if (this._b2Body) {
            this._b2Body.SetPosition(posBody);
        }

        this.node.setPosition(pos);
    }

    /**
     * 获取刚体的世界坐标
     * @returns 
     */
    private _getWorldPosition () {
        let out = {x: 0, y: 0};
        if (this._b2Body) {
            let pos = this._b2Body.GetPosition();
            out.x = pos.x * Constants.PTM_RATIO;
            out.y = pos.y * Constants.PTM_RATIO;
        }
        return out;
    }

    /**
     * 从物理世界中删除该士兵的刚体对象
     */
    public release () {
        if (this._b2Body) {
            if (this._fixture) {
                this._b2Body.DestroyFixture(this._fixture);
            }

            this._world.DestroyBody(this._b2Body);
            this._b2Body = null;
        }
    }

    /**
     * 删除物理刚体
     */
    public destroyBody () {
        if (this._b2Body) {
            if (this._fixture) {
                this._b2Body.DestroyFixture(this._fixture);
            }

            this._world.DestroyBody(this._b2Body);
            this._b2Body = null;
        }
    }

    update (deltaTime: number) {
        // Your update function goes here.
        //每帧去同步数据过来
        if (this._b2Body && this.enableSync) {
            let pos = this._getWorldPosition();
            let posNode = this.node.position;

            //同步士兵节点位置
            if (pos.x !== posNode.x || pos.y !== posNode.z) {
                this.node.setPosition(pos.x, 0, pos.y);
            }
        }
    }
}
