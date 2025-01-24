import { once } from "lodash-es";
import { io } from "socket.io-client";

export const socket = once(() => {
  return markRaw(io("https://bronya.world"));
});
