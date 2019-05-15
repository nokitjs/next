import { getProviderName } from "./provider";
import { IInjectInfo, getPropInjectInfos, InjectTypes } from "./inject";

const { getByPath } = require('ntils');

/**
 * IoC 容器 
 */
export class IoCContainer {

  /**
   * 所有已注册的可注入类型
   */
  public types: { [name: string]: any } = {};

  /**
   * 所有已注册的可注入值
   */
  public values: any = {};

  /**
   * 在 IoC 容器中注册一组件类型
   * @param types 类型数组
   */
  public register(types: any[]) {
    types.forEach(type => {
      const info = getProviderName(type);
      if (!info || !info.name) return;
      if (this.types[info.name]) {
        throw new Error(`Provider name is duplicated: ${info.name}`);
      }
      this.types[info.name] = type;
    });
  }

  /**
   * 添加 values
   * @param values 要添加的 values
   */
  public appendValues(values: any) {
    Object.assign(this.values, values);
  }

  protected injectTypes(instance: any, info: IInjectInfo) {
    let refInstance: any;
    Object.defineProperty(instance, info.member, {
      enumerable: true,
      get: () => {
        if (!refInstance) refInstance = this.createInstance(info.provider);
        return refInstance;
      }
    });
  }

  protected injectValues(instance: any, info: IInjectInfo) {
    Object.defineProperty(instance, info.member, {
      enumerable: true,
      get: () => getByPath(this.values, info.provider)
    });
  }

  /**
   * 通过类型名称创建一个实例
   * @param name 已注册的类型名称
   */
  public createInstance<T>(name: string) {
    if (!name) return null;
    const Type = this.types[name];
    if (!Type) return null;
    const instance = new Type();
    const propInjectInfos = getPropInjectInfos(instance);
    propInjectInfos.forEach((info: IInjectInfo) => {
      delete instance[info.member];
      return info.options && info.options.type === InjectTypes.Value ?
        this.injectValues(instance, info) :
        this.injectTypes(instance, info);
    });
    return instance as T;
  }

}