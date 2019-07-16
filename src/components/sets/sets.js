/* eslint-disable no-prototype-builtins */
import store from 'store';
// Functions for storing hierarchical sets of string IDs (cell IDs, gene IDs, etc...).

export class HSetsNode {
  constructor(props) {
    const {
      name,
      selected = false,
      open = false,
      color,
      children,
      set,
    } = props || {};
    this.key = name;
    this.name = name;
    this.children = children;
    this.selected = selected;
    this.color = color;
    this.open = open;
    this.set = set;
  }

  setChildren(children) {
    this.children = children;
  }

  isLeaf() {
    return (this.children === undefined
        || this.children === null
        || (Array.isArray(this.children) && this.children.length === 0));
  }

  getRenderData(root) {
    if (root) {
      return this.children ? this.children.map(child => child.getRenderData(false)) : [];
    }
    return {
      title: this.name,
      key: this.name,
      size: this.set ? this.set.length : 0,
      children: this.children ? this.children.map(child => child.getRenderData(false)) : undefined,
    };
  }
}

export default class HSets {
  constructor(onChange) {
    this.root = new HSetsNode({
      name: 'All',
      children: [
        new HSetsNode({
          name: 'Current Set',
          color: '#000',
          set: [],
        }),
        new HSetsNode({
          name: 'Factors',
          color: '#000',
          children: [
            new HSetsNode({
              name: 'Oligodendrocytes',
              color: '#000',
              children: [
                new HSetsNode({
                  name: 'Oligodendrocyte Mature', color: '#000', set: [],
                }),
              ],
            }),
            new HSetsNode({
              name: 'Inhibitory neurons',
              color: '#000',
              children: [
                new HSetsNode({
                  name: 'Inhibitory Pthlh', color: '#000', set: [],
                }),
                new HSetsNode({
                  name: 'Inhibitory Kcnip2', color: '#000', set: [],
                }),
                new HSetsNode({
                  name: 'Inhibitory CP', color: '#000', set: [],
                }),
              ],
            }),
          ],
        }),
      ],
    });
    this.tabRoots = [this.root, this.root.children[1].children[0]];
    this.checkedKeys = ['Current Set'];
    this.onChange = onChange || (() => {});
  }

  setCheckedKeys(checkedKeys) {
    this.checkedKeys = checkedKeys;
    this.onChange(this);
  }

  setCurrentSet(set) {
    this.root.children[0].set = Array.from(set);
    this.onChange(this);
  }

  dragRearrange(tabRoot, dropKey, dragKey, dropPosition, dropToGap, insertBottom) {
    const loop = (data, key, callback) => {
      data.forEach((item, index, arr) => {
        if (item.key === key) {
          return callback(item, index, arr);
        }
        if (item.children) {
          return loop(item.children, key, callback);
        }
      });
    };
    const data = [...tabRoot.children];

    // Find dragObject
    let dragObj;
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });

    if (!dropToGap) {
      // Drop on the content
      loop(data, dropKey, (item) => {
        item.setChildren(item.children || []);
        // where to insert
        item.setChildren([...item.children, dragObj]);
      });
    } else if (insertBottom) {
      loop(data, dropKey, (item) => {
        item.setChildren(item.children || []);
        // where to insert
        const newChildren = [...item.children];
        newChildren.unshift(dragObj);
        item.setChildren(newChildren);
      });
    } else {
      let ar;
      let i;
      loop(data, dropKey, (item, index, arr) => {
        ar = arr;
        i = index;
      });
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj);
      } else {
        ar.splice(i + 1, 0, dragObj);
      }
    }

    tabRoot.setChildren(data);
    this.onChange(this);
  }
}
