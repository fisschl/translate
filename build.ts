import { $ } from "bun";

const target = "open-source-cn-shanghai.cr.volces.com/open/translate:latest";

// 启用Docker BuildKit缓存
await $`docker build --build-arg BUILDKIT_INLINE_CACHE=1 -t ${target} .`;
await $`docker push ${target}`;
