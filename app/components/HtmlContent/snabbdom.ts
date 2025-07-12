import {
  attributesModule,
  classModule,
  datasetModule,
  init,
  propsModule,
  styleModule,
  toVNode,
} from "snabbdom";
import type { VNode } from "snabbdom";

const patch = init([classModule, propsModule, attributesModule, datasetModule, styleModule]);

const vNodeCache = new WeakMap<Element, VNode>();

export const updateElement = (oldNode: Element, newNode: Element) => {
  const result = patch(vNodeCache.get(oldNode) || oldNode, toVNode(newNode));
  vNodeCache.set(oldNode, result);
};
