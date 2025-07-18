import type { VNode } from "snabbdom";
import {
  attributesModule,
  classModule,
  datasetModule,
  init,
  propsModule,
  styleModule,
  toVNode,
} from "snabbdom";

const patch = init([classModule, propsModule, attributesModule, datasetModule, styleModule]);

export const updateElement = (oldNode: Element | VNode, newNode: Element) => {
  return patch(oldNode, toVNode(newNode));
};
