/**
 * @file module.js
 * @author denglingbo
 *
 */
import React from 'react';
import { fromJS } from 'immutable';
import { findComponents } from '../components/index';
import utils from '../components/util/util';

class Module {
    /**
     * 异步加载组件
     * @param item
     */
    static asyncComponent(item) {
        // 如果已经有组件被创建，则直接 resolve
        if (item.App && item.module) {
            return Promise.resolve(item);
        }

        return new Promise((resolve) => {
            findComponents(item.name, function (module) {
                import(`../components/${module.name}/index`)
                    .then(App => {
                        return resolve({
                            // 返回数据
                            ...item,
                            // 返回模块配置
                            module: {...module},
                            // 返回组件
                            App: App.default,
                        });
                    })
            });
        })
    }

    /**
     * 获取组件
     * @param item
     * @return {*}
     */
    static get(item) {
        return this.asyncComponent(item);
    }

    /**
     * 创建组件
     * @param moduleName
     * @return {Promise}
     */
    static create(moduleName) {
        return this.asyncComponent({
            guid: utils.guid(),
            name: moduleName,
        })
    }

    /**
     * 编辑模块
     * @param guid
     * @param data
     * @param target
     * @param attr
     * @param value
     * @return {any|*}
     */
    static edit(guid, data, target, attr, value, type) {
        let $new = fromJS({});
        const $data = fromJS(data);
// console.log({guid, data, target, attr, value, type})
        utils.find($data, guid, ($finder, deep) => {
            let setBy = deep;
            if (type === 'attr') {
                setBy = deep.concat(['attrs', target]);
            }
            else {
                setBy = deep.concat(['attrs', 'style', target, attr]);
            }
            console.log(setBy)
            
            $new = $data.setIn(setBy, value);
        }, {
            findBy: 'guid',
        })

        return $new.toJS();
    }

    /**
     * 移除一条组件数据
     * @param guid
     * @param data
     * @return {*}
     */
    static remove(guid, data) {
        return utils.deleteByGuid(data, guid);
    }
}

export default Module;
